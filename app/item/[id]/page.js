"use client";
export const runtime = 'edge';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase.client";
import useCart from "@/app/hooks/useCart";
import { Check, ShoppingBag, Truck, ShieldCheck, Star } from "lucide-react"; // install lucide-react

export default function ItemPage() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [qty, setQty] = useState(1);
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchItem = async () => {
            const ref = doc(db, "items", id);
            const snap = await getDoc(ref);
            if (snap.exists()) setItem({ id: snap.id, ...snap.data() });
            setLoading(false);
        };
        fetchItem();
    }, [id]);

    const handleAddToCart = async () => {
        setAdding(true);
        await addToCart(item.id, item.stock, qty);
        setTimeout(() => setAdding(false), 1500); // Visual feedback duration
    };

    if (loading) return <div className="animate-pulse min-h-screen bg-(--background)" />; // Basic skeleton

    if (!item) return <div className="flex h-screen items-center justify-center">Item not found</div>;

    const discount = Number(item.discount || 0);
    const finalPrice = item.price * (1 - discount);
    const isInStock = item.stock > 0;

    return (
        <main className="min-h-screen bg-(--background) px-6 py-10">
            <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
                
                {/* LEFT: Image Gallery Style */}
                <div className="relative">
                    <div className="aspect-square overflow-hidden rounded-3xl bg-white/5 border border-(--border)">
                        <img 
                            src={item.image} 
                            alt={item.title} 
                            className="h-full w-full object-contain p-8" 
                        />
                        {discount > 0 && (
                            <div className="absolute top-6 left-6 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                                -{Math.round(discount * 100)}%
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Product Details */}
                <div className="flex flex-col">
                    <p className="text-(--primary) font-bold uppercase tracking-widest text-sm">{item.category}</p>
                    <h1 className="text-5xl font-black mt-2 leading-tight">{item.title}</h1>
                    
                    <div className="flex items-center gap-4 mt-6">
                        <span className="text-4xl font-bold">${finalPrice.toFixed(2)}</span>
                        {discount > 0 && (
                            <span className="text-xl text-(--muted) line-through">${item.price.toFixed(2)}</span>
                        )}
                    </div>

                    <p className="mt-8 text-gray-400 leading-relaxed text-lg">{item.description}</p>

                    {/* Quantity Selector UI */}
                    <div className="mt-10 flex items-center gap-6">
                        <div className="flex items-center border border-(--border) rounded-xl overflow-hidden">
                            <button 
                                onClick={() => setQty(q => Math.max(1, q - 1))}
                                className="px-5 py-3 hover:bg-white/5 transition"
                            >-</button>
                            <span className="w-10 text-center font-bold">{qty}</span>
                            <button 
                                onClick={() => setQty(q => Math.min(item.stock, q + 1))}
                                className="px-5 py-3 hover:bg-white/5 transition"
                            >+</button>
                        </div>
                        <p className="text-sm text-(--muted)">{item.stock} units available</p>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex gap-4">
                        <button 
                            disabled={!isInStock || adding}
                            onClick={handleAddToCart}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-5 text-lg font-bold transition-all ${
                                adding ? "bg-green-500 text-white" : "bg-(--primary) text-white hover:opacity-90 active:scale-95"
                            } disabled:opacity-50`}
                        >
                            {adding ? <><Check size={20} /> Added!</> : <><ShoppingBag size={20} /> Add to Cart</>}
                        </button>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-(--border) pt-10">
                        <div className="flex items-center gap-3">
                            <Truck className="text-(--primary)" size={24} />
                            <div>
                                <p className="text-xs text-(--muted)">Shipping</p>
                                <p className="text-sm font-bold">{item.shipping || "Fast Delivery"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-(--primary)" size={24} />
                            <div>
                                <p className="text-xs text-(--muted)">Warranty</p>
                                <p className="text-sm font-bold">{item.warranty || "1 Year"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Star className="text-(--primary)" size={24} />
                            <div>
                                <p className="text-xs text-(--muted)">Rating</p>
                                <p className="text-sm font-bold">{item.rating} / 5.0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}