"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/lib/firebase.client";

import Item from "../Components/item";

export default function HotDealsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {

                // ... inside useEffect
                const q = query(
                    collection(db, "items"),
                    where("discount", ">=", 0.5) // Only download the hot ones!
                );
                const snap = await getDocs(q);

                const data = snap.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                }));

                // filter hot deals (discount >= 0.6)
                const hotDeals = data.filter(
                    (item) => Number(item.discount || 0) >= 0.2
                );

                setItems(hotDeals);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-(--foreground)">
                Loading Hot Deals...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-(--background) text-(--foreground) px-6 py-10">

            {/* HEADER */}
            <div className="mx-auto max-w-6xl mb-10">
                <h1 className="text-4xl font-bold">
                    🔥 Hot Deals
                </h1>

                <p className="text-(--muted) mt-2">
                    Items with 60%+ discounts — limited time offers
                </p>
            </div>

            {/* GRID */}
            <section className="mx-auto max-w-6xl">
                {items.length === 0 ? (
                    <div className="rounded-2xl border border-(--border) p-8 text-center">
                        No hot deals available right now
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="relative group"
                            >
                                <Item id={item.id} data={item} type="negative" />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}