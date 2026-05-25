"use client";

import { useState } from "react";
import { auth } from "@/app/lib/firebase.client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const login = async () => {
        try {
            setLoading(true);

            await signInWithEmailAndPassword(auth, email, password);

            router.push("/admin");
        } catch (err) {
            alert("Login failed");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-(--background)">
            <div className="w-full max-w-sm rounded-3xl border border-(--border) bg-(--card) p-8">

                <h1 className="mb-6 text-3xl font-bold">
                    Admin Login
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-4 w-full rounded-xl border border-(--border) bg-(--background) p-3 outline-none"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-6 w-full rounded-xl border border-(--border) bg-(--background) p-3 outline-none"
                />

                <button
                    onClick={login}
                    disabled={loading}
                    className="
                        w-full rounded-2xl bg-(--primary)
                        px-6 py-3 font-semibold text-white
                        transition hover:bg-(--primary-hover)
                        disabled:opacity-50
                    "
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </div>
        </div>
    );
}