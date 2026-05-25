"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, doc, getDoc, setDoc, serverTimestamp, runTransaction } from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";
import useCart from "@/app/hooks/useCart";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, saveCart, loading: cartLoading } = useCart();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        zip: "",
    });

    // 1. Pre-fill email if user is logged in
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user?.email) {
                setForm(prev => ({ ...prev, email: user.email }));
            }
        });
        return () => unsub();
    }, []);

    // 2. Load actual product data from DB to prevent price spoofing
    useEffect(() => {
        const load = async () => {
            if (cartLoading) return;
            if (!cart?.length) {
                setItems([]);
                setLoading(false);
                return;
            }

            try {
                const loaded = await Promise.all(
                    cart.map(async (cartItem) => {
                        const snap = await getDoc(doc(db, "items", cartItem.id));
                        if (!snap.exists()) return null;
                        return { id: snap.id, ...snap.data(), qty: cartItem.qty };
                    })
                );
                setItems(loaded.filter(Boolean));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [cart, cartLoading]);

    // 3. Corrected Calculation Logic
    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => {
            const discount = Number(item.discount || 0);
            // If discount is 0.2, price is 80% (1 - 0.2)
            const unitPrice = item.price * (1 - discount); 
            return sum + (unitPrice * item.qty);
        }, 0);
    }, [items]);

    const shippingCost = subtotal > 100 || subtotal === 0 ? 0 : 12;
    const total = subtotal + shippingCost;

    const placeOrder = async () => {
        // Redirect to login but keep them on checkout
        if (!auth.currentUser) {
            router.push(`/login?redirect=/checkout`);
            return;
        }

        if (!form.firstName || !form.address || !form.phone) {
            alert("Please fill in required shipping details");
            return;
        }

        setPlacing(true);
        try {
            // Transactional Stock Update
            await runTransaction(db, async (transaction) => {
                const itemRefs = items.map(i => ({ ref: doc(db, "items", i.id), qty: i.qty }));
                
                // Read all first
                const snaps = await Promise.all(itemRefs.map(i => transaction.get(i.ref)));
                
                snaps.forEach((snap, idx) => {
                    const data = snap.data();
                    const requestedQty = itemRefs[idx].qty;
                    if (data.stock < requestedQty) {
                        throw new Error(`${data.title} is out of stock!`);
                    }
                    transaction.update(itemRefs[idx].ref, {
                        stock: data.stock - requestedQty
                    });
                });
            });

            // Create the order
            const orderRef = await addDoc(collection(db, "orders"), {
                userId: auth.currentUser.uid,
                customer: form,
                items: items.map(i => ({ id: i.id, title: i.title, qty: i.qty, price: i.price })),
                total,
                status: "processing",
                createdAt: serverTimestamp(),
            });

            // Clear Cart
            await saveCart([]); 
            router.push(`/order-success/${orderRef.id}`);

        } catch (err) {
            alert(err.message);
        } finally {
            setPlacing(false);
        }
    };

    if (loading || cartLoading) return <div className="p-20 text-center">Validating your cart...</div>;
    if (items.length === 0) return <div className="p-20 text-center">Your cart is empty.</div>;

    return (
        <main className="min-h-screen bg-(--background) px-6 py-10 text-(--foreground)">
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_400px]">
                
                {/* FORM SECTION */}
                <section className="rounded-3xl border border-(--border) bg-(--card) p-8">
                    <h1 className="text-3xl font-bold mb-8">Shipping Details</h1>
                    <div className="grid gap-4 md:grid-cols-2">
                        <input className="input-style" placeholder="First Name" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                        <input className="input-style" placeholder="Last Name" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                        <input className="input-style md:col-span-2" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                        <input className="input-style md:col-span-2" placeholder="Street Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                        <input className="input-style" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                        <input className="input-style" placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                </section>

                {/* SUMMARY SECTION */}
                <aside className="h-fit space-y-6">
                    <div className="rounded-3xl border border-(--border) bg-(--card) p-6">
                        <h2 className="text-xl font-bold mb-4">Summary</h2>
                        <div className="space-y-4 max-h-75 overflow-y-auto mb-6">
                            {items.map(item => (
                                <div key={item.id} className="flex gap-4">
                                    <img src={item.image} className="h-16 w-16 rounded-xl object-cover" />
                                    <div className="flex-1">
                                        <p className="font-medium line-clamp-1">{item.title}</p>
                                        <p className="text-sm text-(--muted)">Qty: {item.qty}</p>
                                    </div>
                                    <p className="font-bold">${(item.price * (1 - item.discount) * item.qty).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="border-t border-(--border) pt-4 space-y-2">
                            <div className="flex justify-between text-(--muted)">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-(--muted)">
                                <span>Shipping</span>
                                <span>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-black pt-2">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={placeOrder}
                            disabled={placing}
                            className="w-full mt-6 bg-(--primary) text-white py-4 rounded-2xl font-bold hover:opacity-90 transition disabled:opacity-50"
                        >
                            {placing ? "Processing..." : auth.currentUser ? "Confirm Order" : "Login to Checkout"}
                        </button>
                    </div>
                </aside>
            </div>
        </main>
    );
}