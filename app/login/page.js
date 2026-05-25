"use client";

import { useState } from "react";
import { auth } from "@/app/lib/firebase.client";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [error, setError] = useState("");

    const handleAuth = async () => {
        setLoading(true);
        setError("");

        try {
            if (isSignup) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }

            router.push("/");
        } catch (err) {
            console.error(err);

            setError(
                err.code === "auth/email-already-in-use"
                    ? "Email already in use"
                    : err.code === "auth/wrong-password"
                    ? "Wrong password"
                    : err.code === "auth/user-not-found"
                    ? "User not found"
                    : "Authentication failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-(--background)">
            <div className="w-full max-w-sm rounded-3xl border border-(--border) bg-(--card) p-8">

                <h1 className="mb-2 text-3xl font-bold">
                    {isSignup ? "Create Account" : "Welcome Back"}
                </h1>

                <p className="mb-6 text-sm text-(--muted)">
                    {isSignup
                        ? "Sign up to access the admin dashboard"
                        : "Login to continue to admin panel"}
                </p>

                {error && (
                    <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-500">
                        {error}
                    </div>
                )}

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
                    onClick={handleAuth}
                    disabled={loading}
                    className="
                        w-full rounded-2xl bg-(--primary)
                        px-6 py-3 font-semibold text-white
                        transition hover:bg-(--primary-hover)
                        disabled:opacity-50
                    "
                >
                    {loading
                        ? "Please wait..."
                        : isSignup
                        ? "Sign Up"
                        : "Login"}
                </button>

                <button
                    onClick={() => setIsSignup(!isSignup)}
                    className="mt-4 w-full text-sm text-(--primary) hover:underline"
                >
                    {isSignup
                        ? "Already have an account? Login"
                        : "Don't have an account? Sign up"}
                </button>
            </div>
        </div>
    );
}