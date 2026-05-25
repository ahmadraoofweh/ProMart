"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

import BannerCarousel from "./Components/banner";
import Item from "./Components/item";
import Hero from "./Components/hero";
import RollingText from "./Components/rollingtext";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const q = query(
                collection(db, "items"),
                where("featured", "==", true),
                limit(8)
            );
            const snap = await getDocs(q);
            setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div className="min-h-screen bg-(--background) text-(--foreground)">
         
            <div className="relative border-b border-(--border)/50">
                <Hero />
                {/* Visual Accent */}
                <div className="absolute bottom-0 left-1/2 h-px w-1/2 -translate-x-1/2 bg-linear-to-r from-transparent via-(--primary) to-transparent opacity-30" />
            </div>

            <div className="px-6 py-12">
                <BannerCarousel />
            </div>

            {/* FEATURED SECTION */}
            <section className="mx-auto max-w-7xl px-6 py-20">
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-(--primary)">
                            <Sparkles size={16} />
                            <span>Selected for you</span>
                        </div>
                        <h2 className="text-4xl font-black">Featured Deals</h2>
                    </div>
                    <button className="flex items-center gap-2 font-bold text-(--muted) hover:text-(--primary) transition">
                        View All <ArrowRight size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-80 animate-pulse rounded-3xl bg-(--card) border border-(--border)" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {items.map((item) => (
                            <Item key={item.id} id={item.id} data={item} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}