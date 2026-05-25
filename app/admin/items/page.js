"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";

export default function ItemsPage() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "items"),
            (snapshot) => {
                setItems(
                    snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                );
            }
        );

        return () => unsubscribe();
    }, []);

    const removeItem = async (id) => {
        const confirmed = confirm(
            "Are you sure you want to delete this item?"
        );

        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, "items", id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <main className="min-h-screen bg-(--background) p-10 text-(--foreground)">
            <div className="mx-auto max-w-6xl">

                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-4xl font-bold">
                        Manage Items
                    </h1>

                    <Link
                        href="/admin/items/new"
                        className="
                            rounded-2xl bg-(--primary)
                            px-5 py-3 font-semibold text-white
                            transition hover:bg-(--primary-hover)
                        "
                    >
                        Add New Item
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="
                                overflow-hidden rounded-3xl
                                border border-(--border)
                                bg-(--card)
                                shadow-(--shadow)
                            "
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                className="h-64 w-full object-cover"
                            />

                            <div className="p-5">
                                <div className="mb-2 flex items-center justify-between">
                                    <h2 className="text-xl font-bold">
                                        {item.title}
                                    </h2>

                                    <span
                                        className="
                                            rounded-full
                                            bg-(--primary-soft)
                                            px-3 py-1 text-xs font-semibold
                                            text-(--primary)
                                        "
                                    >
                                        {item.category}
                                    </span>
                                </div>

                                <p className="mb-4 line-clamp-2 text-sm text-(--muted)">
                                    {item.description}
                                </p>

                                <div className="mb-5 flex items-center justify-between">
                                    <span className="text-2xl font-bold">
                                        ${item.price}
                                    </span>

                                    <span className="text-sm text-(--muted)">
                                        Stock: {item.stock}
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <Link
                                        href={`/admin/items/${item.id}`}
                                        className="
                                            flex-1 rounded-xl
                                            bg-blue-500 px-4 py-3
                                            text-center font-semibold text-white
                                            transition hover:bg-blue-600
                                        "
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="
                                            flex-1 rounded-xl
                                            bg-red-500 px-4 py-3
                                            font-semibold text-white
                                            transition hover:bg-red-600
                                        "
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </main>
    );
}