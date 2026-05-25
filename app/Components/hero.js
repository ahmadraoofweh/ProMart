"use client";
import { useEffect, useState } from "react";
import { ShoppingBag, ChevronRight } from "lucide-react";

export default function Hero() {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => setOffset(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-32 text-center">
            {/* Animated Background Orbs */}
            <div 
                className="absolute top-1/4 left-1/4 -z-10 h-64 w-64 rounded-full bg-(--primary) opacity-20 blur-[100px]"
                style={{ transform: `translateY(${offset * 0.3}px)` }}
            />
            <div 
                className="absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 rounded-full bg-blue-500 opacity-10 blur-[120px]"
                style={{ transform: `translateY(${offset * -0.2}px)` }}
            />

            <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur-md mb-8">
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                New Collection is Live
            </div>

            <h1 className="max-w-4xl text-6xl font-black leading-tight tracking-tighter md:text-8xl">
                Elevate Your <span className="text-(--primary)">Lifestyle.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-(--muted) md:text-xl">
                Experience the next generation of shopping with ProMart. 
                Premium tech, curated fashion, and lifestyle essentials.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
                <button className="flex items-center gap-2 rounded-2xl bg-(--primary) px-8 py-4 font-bold text-white shadow-(--primary-soft) transition hover:scale-105 active:scale-95">
                    <ShoppingBag size={20} />
                    Shop Now
                </button>
                <button className="flex items-center gap-2 rounded-2xl border border-(--border) bg-(--card) px-8 py-4 font-bold transition hover:bg-white/5">
                    View Catalog
                    <ChevronRight size={20} />
                </button>
            </div>
        </section>
    );
}