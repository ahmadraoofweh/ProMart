"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import useCart from "@/app/hooks/useCart";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";

export default function CartPage() {
    const router = useRouter();
    const { cart, addToCart, decreaseQty, removeFromCart, loading: cartLoading } = useCart();
    const [items, setItems] = useState([]);
    const [fetchingItems, setFetchingItems] = useState(true);

    useEffect(() => {
        const loadItems = async () => {
            if (cartLoading) return;
            if (cart.length === 0) {
                setItems([]);
                setFetchingItems(false);
                return;
            }

            try {
                const loaded = await Promise.all(
                    cart.map(async (cartItem) => {
                        const snap = await getDoc(doc(db, "items", cartItem.id));
                        if (!snap.exists()) return null;
                        return {
                            id: snap.id,
                            ...snap.data(),
                            qty: cartItem.qty || 1,
                        };
                    })
                );
                setItems(loaded.filter(Boolean));
            } catch (err) {
                console.error(err);
            } finally {
                setFetchingItems(false);
            }
        };

        loadItems();
    }, [cart, cartLoading]);

    // Derived State for totals
    const { subtotal, totalDiscount } = useMemo(() => {
        return items.reduce((acc, item) => {
            const price = Number(item.price || 0);
            const discountPercent = Number(item.discount || 0);
            const finalPrice = price * (1 - discountPercent);
            
            acc.subtotal += finalPrice * item.qty;
            acc.totalDiscount += (price * discountPercent) * item.qty;
            return acc;
        }, { subtotal: 0, totalDiscount: 0 });
    }, [items]);

    if (fetchingItems || cartLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-(--primary)" size={40} />
                <p className="text-(--muted)">Reviewing your bag...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-(--background) px-6 py-12 text-(--foreground)">
            <div className="mx-auto max-w-5xl">
                <div className="mb-10 flex items-end gap-4">
                    <h1 className="text-5xl font-black tracking-tight">Your Bag</h1>
                    <span className="mb-1 text-xl text-(--muted)">({items.length} items)</span>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-(--border) p-20 text-center">
                        <div className="mb-6 rounded-full bg-(--card) p-6 text-(--muted)">
                            <ShoppingBag size={48} />
                        </div>
                        <h2 className="text-2xl font-bold">Your cart is empty</h2>
                        <p className="mt-2 text-(--muted)">Looks like you haven't added anything yet.</p>
                        <button 
                            onClick={() => router.push("/")}
                            className="mt-8 flex items-center gap-2 rounded-2xl bg-(--primary) px-8 py-4 font-bold text-white transition hover:scale-105"
                        >
                            Start Shopping <ArrowRight size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-10 lg:grid-cols-[1fr_350px]">
                        
                        {/* ITEM LIST */}
                        <div className="space-y-4">
                            {items.map((item) => {
                                const finalUnitPrice = item.price * (1 - item.discount);
                                return (
                                    <div 
                                        key={item.id} 
                                        className="group flex items-center gap-6 rounded-3xl border border-(--border) bg-(--card) p-5 transition-all hover:border-(--primary-soft) hover:shadow-xl hover:shadow-(--primary-soft)"
                                    >
                                        <img
                                            src={item.image || "/file.svg"}
                                            className="h-28 w-28 rounded-2xl object-cover shadow-sm"
                                            alt={item.title}
                                        />

                                        <div className="flex flex-1 flex-col gap-1">
                                            <h2 className="text-lg font-bold leading-tight group-hover:text-(--primary)">
                                                {item.title}
                                            </h2>
                                            
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-black">${finalUnitPrice.toFixed(2)}</span>
                                                {item.discount > 0 && (
                                                    <span className="text-sm text-red-500 line-through opacity-60">
                                                        ${item.price}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="mt-3 flex w-fit items-center gap-1 rounded-xl border border-(--border) bg-(--background) p-1">
                                                <button
                                                    onClick={() => item.qty > 1 && decreaseQty(item.id)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-(--card) disabled:opacity-30"
                                                    disabled={item.qty <= 1}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-8 text-center font-bold">{item.qty}</span>
                                                <button
                                                    onClick={() => item.qty < item.stock && addToCart(item.id, item.stock)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-(--card) disabled:opacity-30"
                                                    disabled={item.qty >= item.stock}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl text-red-500 transition hover:bg-red-500/10"
                                            title="Remove item"
                                        >
                                            <Trash2 size={22} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ORDER SUMMARY */}
                        <aside className="h-fit space-y-6">
                            <div className="rounded-3xl border border-(--border) bg-(--card) p-8 shadow-sm">
                                <h2 className="mb-6 text-xl font-bold">Order Summary</h2>
                                
                                <div className="space-y-3 border-b border-(--border) pb-6">
                                    <div className="flex justify-between text-(--muted)">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-(--foreground)">${(subtotal + totalDiscount).toFixed(2)}</span>
                                    </div>
                                    {totalDiscount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Savings</span>
                                            <span>-${totalDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-(--muted)">
                                        <span>Shipping</span>
                                        <span className="text-green-600 font-medium">Free</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-between items-end">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-3xl font-black text-(--primary)">${subtotal.toFixed(2)}</span>
                                </div>

                                <button 
                                    onClick={() => router.push("/checkout")} 
                                    className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-(--primary) py-5 text-lg font-bold text-white shadow-lg shadow-(--primary-soft) transition hover:scale-[1.02] active:scale-95"
                                >
                                    Checkout Now <ArrowRight size={20} />
                                </button>
                            </div>

                            <p className="px-4 text-center text-xs text-(--muted)">
                                Secure checkout powered by ARWEH. <br/>
                                Taxes calculated at next step.
                            </p>
                        </aside>

                    </div>
                )}
            </div>
        </main>
    );
}