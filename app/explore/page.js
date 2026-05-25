"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase.client";
import Item from "../Components/item";
import { useSearch } from "../context/SearchContext";

export default function ExplorePage() {
    const [groupedItems, setGroupedItems] = useState({});
    const [loading, setLoading] = useState(true);
    const { query } = useSearch();

    useEffect(() => {
        const fetchAllItems = async () => {
            try {
                const snap = await getDocs(collection(db, "items"));
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

                const grouped = data.reduce((acc, item) => {
                    const cat = item.category || "Uncategorized";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(item);
                    return acc;
                }, {});

                setGroupedItems(grouped);
            } catch (err) {
                console.error("Failed to load items:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllItems();
    }, []);

    const filteredItems = useMemo(() => {
        const safeGroups = groupedItems || {};

        // no search → return original structure
        if (!query?.trim()) return safeGroups;

        const q = query.toLowerCase();

        const filtered = {};

        Object.entries(safeGroups).forEach(([cat, items]) => {
            const match = items.filter((item) =>
                item.title?.toLowerCase().includes(q) ||
                item.category?.toLowerCase().includes(q)
            );

            if (match.length > 0) {
                filtered[cat] = match;
            }
        });

        return filtered;
    }, [groupedItems, query]);

    if (loading) {
        return (
            <div className="p-10 text-center">
                Loading Explore...
            </div>
        );
    }

    const hasResults = Object.keys(filteredItems).length > 0;

    return (
        <div className="min-h-screen bg-(--background) text-(--foreground) px-6 py-20">

            <header className="mx-auto max-w-6xl mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">
                        Explore Marketplace
                    </h1>
                </div>
                <p className="text-(--muted)">
                    Browse our full catalog by category.
                </p>
            </header>

            <main className="mx-auto max-w-6xl space-y-8">

                {!hasResults ? (
                    <div className="text-center text-(--muted) py-20">
                        No results found for "{query}"
                    </div>
                ) : (
                    Object.entries(filteredItems).map(([category, items]) => (
                        <CategorySection
                            key={category}
                            title={category}
                            items={items}
                        />
                    ))
                )}

            </main>
        </div>
    );
}

function CategorySection({ title, items }) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="border-b border-white/10 pb-6">
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="flex w-full items-center justify-between py-4 hover:bg-white/5 transition-colors px-2 rounded-lg"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold capitalize">{title}</h2>
          <span className="text-sm bg-white/10 px-2 py-0.5 rounded-full text-gray-400">
            {items.length}
          </span>
        </div>
        {/* Native SVG Chevrons */}
        {isMinimized ? (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {!isMinimized && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 mt-4 animate-[fadeIn_0.3s_ease-out]">
          {items.map((item) => (
            <Item key={item.id} id={item.id} data={item} />
          ))}
        </div>
      )}
    </div>
  );
}