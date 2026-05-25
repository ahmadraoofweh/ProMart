"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/app/lib/firebase.client";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function useCart() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Initial Load (Local Storage)
    useEffect(() => {
        const localCart = localStorage.getItem("temp_cart");
        if (localCart) {
            setCart(JSON.parse(localCart));
        }
        setLoading(false);
    }, []);

    // 2. Sync with Firebase on Auth Change
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const ref = doc(db, "users", user.uid);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    const cloudCart = snap.data().cart || [];
                    const localCart = JSON.parse(localStorage.getItem("temp_cart") || "[]");

                    // Merge local and cloud (Anonymous items move to account)
                    const mergedCart = [...cloudCart];
                    localCart.forEach(localItem => {
                        const existing = mergedCart.find(i => i.id === localItem.id);
                        if (existing) {
                            existing.qty += localItem.qty;
                        } else {
                            mergedCart.push(localItem);
                        }
                    });

                    setCart(mergedCart);
                    await updateDoc(ref, { cart: mergedCart });
                    localStorage.removeItem("temp_cart"); // Clear temp once merged
                }
            }
        });
        return () => unsub();
    }, []);

    // 3. Persistent Save helper
    const saveCart = async (newCart) => {
        setCart(newCart);
        const user = auth.currentUser;

        if (user) {
            await updateDoc(doc(db, "users", user.uid), { cart: newCart });
        } else {
            localStorage.setItem("temp_cart", JSON.stringify(newCart));
        }
    };

    const clearCart = async () => {
        await saveCart([]);
    };
    const addToCart = async (itemId, stock, qty = 1) => {
        const existing = cart.find((i) => i.id === itemId);
        let newCart;

        if (existing) {
            const finalQty = Math.min(stock, existing.qty + qty);
            newCart = cart.map((i) => i.id === itemId ? { ...i, qty: finalQty } : i);
        } else {
            newCart = [...cart, { id: itemId, qty: Math.min(qty, stock) }];
        }

        await saveCart(newCart);
    };

    const removeFromCart = async (itemId) => {
        await saveCart(cart.filter((i) => i.id !== itemId));
    };

    const decreaseQty = async (itemId) => {
        const newCart = cart
            .map((i) => i.id === itemId ? { ...i, qty: i.qty - 1 } : i)
            .filter((i) => i.qty > 0);
        await saveCart(newCart);
    };

    return { cart, addToCart, removeFromCart, decreaseQty, saveCart, clearCart, loading };
}