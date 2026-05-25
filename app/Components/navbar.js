"use client";

import Link from "next/link";
import Search from "./search";
import useTheme from "../hooks/useTheme";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase.client";
import useAuth from "../hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useSearch } from "../context/SearchContext";
import { useRef, useState, useEffect } from "react";
import RollingText from "./rollingtext";
export default function Navbar() {
    const searchRef = useRef(null);
    const { setQuery } = useSearch();
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    const links = [
        { name: "Home", href: "/" },
        { name: "Explore", href: "/explore" },
        { name: "Hot Deals", href: "/deals" },
        { name: "Contact", href: "/contact" },
    ];

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    const handleLogin = () => {
        router.push(`/login?redirect=${pathname}`);
    };

    return (
        <nav
            className={`
        w-full border-b border-(--border)
        bg-(--background)/80 backdrop-blur-xl
        transition-all duration-500 ease-out

        ${scrolled
                    ? "fixed top-0 left-0 z-50 shadow-lg translate-y-0"
                    : "relative translate-y-0"
                }

        ${scrolled ? "animate-slideDown" : ""}
    `}
        >
            {scrolled && <div className="h-1"/>}
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">

                {/* LOGO */}
                <h1 className="text-xl font-bold tracking-tight text-(--foreground)">
                    ProMart
                </h1>

                {/* SEARCH */}
                <div className="flex-1 max-w-md">
                    <Search
                        ref={searchRef}
                        placeholder="Search products..."
                        scope="items"
                        onChange={(q) => setQuery(q)}
                        onSelect={(i) => {
                            router.push("/item/" + i.id);
                            searchRef.current?.clear(); // ✅ clean reset
                        }}
                    />
                </div>
                {/* LINKS */}
                <div className="hidden md:flex items-center gap-1">
                    {links.map((link) => {
                        const active = pathname === link.href;

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`
                                    rounded-full px-4 py-2 text-sm font-medium transition
                                    ${active
                                        ? "bg-(--primary) text-white shadow-lg"
                                        : "text-(--foreground) hover:bg-(--primary-soft) hover:text-(--primary)"
                                    }
                                `}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2">

                    {/* THEME */}
                    <button
                        onClick={toggleTheme}
                        className="relative cursor-pointer flex h-10 w-10 items-center justify-center rounded-full border border-(--border) hover:bg-(--primary-soft) transition"
                    >
                        <span
                            className={`absolute transition-all duration-300 ${theme === "dark"
                                ? "rotate-90 scale-0 opacity-0"
                                : "rotate-0 scale-100 opacity-100"
                                }`}
                        >
                            ☀️
                        </span>

                        <span
                            className={`absolute transition-all duration-300 ${theme === "dark"
                                ? "rotate-0 scale-100 opacity-100"
                                : "-rotate-90 scale-0 opacity-0"
                                }`}
                        >
                            🌙
                        </span>
                    </button>
                    {/* CART */}
                    <Link
                        href="/cart"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-(--border) hover:bg-(--primary-soft) transition"
                    >
                        🛒
                    </Link>

                    {/* AUTH */}
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="rounded-full cursor-pointer bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition"
                        >
                            Logout
                        </button>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="rounded-full cursor-pointer bg-(--primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--primary-hover) transition"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
               <RollingText />
            
        </nav>
    );
}