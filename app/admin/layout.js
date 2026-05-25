"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/app/hooks/useAuth";
import { auth } from "../lib/firebase";

export default function AdminLayout({ children }) {
    const { user, loading } = useAuth();
    
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin/login");
        }
    }, [user, loading]);

    if (loading || !user || !user?.email.endsWith("promart.arweh.dev")) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    return <div>{children}</div>;
}