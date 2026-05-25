"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase.client";
import { CheckCircle2, Package, ArrowLeft, ShoppingBag } from "lucide-react";

export default function OrderPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const snap = await getDoc(doc(db, "orders", id));
                if (snap.exists()) {
                    setOrder(snap.data());
                }
            } catch (err) {
                console.error("Error fetching order:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrder();
    }, [id]);

    if (loading) return <div className="flex min-h-screen items-center justify-center">Verifying Order...</div>;

    if (!order) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Order not found</h1>
                <button onClick={() => router.push("/")} className="text-(--primary) underline">Return Home</button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-(--background) px-6 py-20 text-(--foreground)">
            <div className="mx-auto max-w-3xl text-center">
                
                {/* SUCCESS ANIMATION ICON */}
                <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-green-500/10 p-4 text-green-500 animate-bounce">
                        <CheckCircle2 size={64} />
                    </div>
                </div>

                <h1 className="text-5xl font-black tracking-tight">Thank you!</h1>
                <p className="mt-4 text-xl text-(--muted)">
                    Your order <span className="font-mono font-bold text-(--foreground)">#{id.slice(0, 8)}</span> has been placed.
                </p>
                <p className="text-(--muted)">A confirmation email has been sent to {order.customer.email}</p>

                {/* ORDER DETAILS CARD */}
                <div className="mt-12 overflow-hidden rounded-3xl border border-(--border) bg-(--card) text-left shadow-xl">
                    <div className="border-b border-(--border) bg-white/5 p-6 flex justify-between items-center">
                        <div className="flex items-center gap-2 font-bold">
                            <Package size={20} />
                            <span>Order Summary</span>
                        </div>
                        <span className="rounded-full bg-(--primary) px-3 py-1 text-xs font-bold text-white uppercase">
                            {order.status}
                        </span>
                    </div>

                    <div className="p-6 space-y-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm text-(--muted)">Quantity: {item.qty}</p>
                                </div>
                                <p className="font-bold">${(item.price * item.qty).toFixed(2)}</p>
                            </div>
                        ))}

                        <div className="mt-6 border-t border-(--border) pt-6 space-y-2">
                            <div className="flex justify-between text-(--muted)">
                                <span>Shipping to</span>
                                <span className="text-(--foreground) text-right">{order.customer.address}, {order.customer.city}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-black pt-4">
                                <span>Total Paid</span>
                                <span className="text-(--primary)">${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* NAVIGATION ACTIONS */}
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                        onClick={() => router.push("/")}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-(--primary) px-8 py-4 font-bold text-white transition hover:opacity-90"
                    >
                        <ShoppingBag size={20} />
                        Continue Shopping
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-(--border) px-8 py-4 font-bold transition hover:bg-white/5"
                    >
                        Print Receipt
                    </button>
                </div>

                <button 
                    onClick={() => router.push("/account/orders")}
                    className="mt-8 flex items-center justify-center gap-2 mx-auto text-(--muted) hover:text-(--foreground) transition"
                >
                    <ArrowLeft size={16} />
                    View all orders
                </button>
            </div>
        </main>
    );
}