"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function BannerCarousel() {
    const [banners, setBanners] = useState([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const load = async () => {
            const snap = await getDocs(collection(db, "banners"));

            const data = snap.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));

            setBanners(data.filter(b => b.active));
        };

        load();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % (banners.length || 1));
        }, 4000);

        return () => clearInterval(interval);
    }, [banners]);

    if (!banners.length) return null;

    const banner = banners[index];

    return (
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-(--border)">
            
            <img
                src={banner.image}
                className="h-72 w-full object-cover"
            />

            <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent p-10 text-white">
                <h2 className="text-3xl font-bold">
                    {banner.title}
                </h2>

                <p className="mt-2 opacity-80">
                    {banner.subtitle}
                </p>
            </div>
        </div>
    );
}