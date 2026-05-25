"use client";

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

const Search = forwardRef(function Search(
{
    placeholder = "Search...",
    scope = "items",
    onChange,
    onSelect,
},
ref
) {
    const [query, setQuery] = useState("");
    const [allData, setAllData] = useState([]);
    const [results, setResults] = useState([]);

    useEffect(() => {
        const load = async () => {
            const snap = await getDocs(collection(db, scope));

            const data = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setAllData(data);
        };

        load();
    }, [scope]);

    useEffect(() => {
        const q = query.toLowerCase().trim();

        if (!q) {
            setResults([]);
            onChange?.("");
            return;
        }

        const filtered = allData.filter((item) =>
            item.title?.toLowerCase().includes(q) ||
            item.category?.toLowerCase().includes(q)
        );

        setResults(filtered);
        onChange?.(q);
    }, [query, allData]);

    // 👇 expose clear() to parent
    useImperativeHandle(ref, () => ({
        clear: () => {
            setQuery("");
            setResults([]);
        }
    }));

    return (
        <div className="relative w-full max-w-sm">
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2 text-(--foreground)"
            />

            {results.length > 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border border-(--border) bg-(--card)">
                    {results.slice(0, 6).map((item) => (
                        <div
                            key={item.id}
                            onClick={() => {
                                onSelect?.(item);
                                setQuery(""); // auto clear on select
                            }}
                            className="cursor-pointer px-4 py-2 hover:bg-(--primary-soft)"
                        >
                            {item.title}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

export default Search;