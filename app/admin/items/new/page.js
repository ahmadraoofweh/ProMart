"use client";

import { useState, useRef } from "react";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../lib/firebase.client";

export default function AdminPage() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        image: "",
        price: "",
        discount: "",
        stock: "",
        shipping: "",
        warranty: "",
        rating: "",
    });

    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const updateField = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Drag and Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            uploadImage(file);
        } else {
            alert("Please upload a valid image file.");
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) uploadImage(file);
    };

    // Firebase Storage Upload
    const uploadImage = (file) => {
        if (!file) return;

        setIsUploading(true);
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            
            "state_changed",
            (snapshot) => {
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                alert("Failed to upload image. Try again.");
                setIsUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                updateField("image", downloadURL);
                setIsUploading(false);
                setUploadProgress(0);
            }
        );
    };

    const addItem = async () => {
        if (!form.title || !form.price) {
            alert("Title and Price are required.");
            return;
        }

        try {
            await addDoc(collection(db, "items"), {
                ...form,
                price: Number(form.price),
                discount: Number(form.discount || 0),
                stock: Number(form.stock || 0),
                rating: Number(form.rating || 0),
                createdAt: Date.now(),
            });

            setForm({
                title: "",
                description: "",
                category: "",
                image: "",
                price: "",
                discount: "",
                stock: "",
                shipping: "",
                warranty: "",
                rating: "",
            });

            alert("Item added successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to add item.");
        }
    };

    const inputStyle =
        "rounded-2xl border border-(--border) bg-(--background) p-4 outline-none transition focus:border-(--primary)";

    return (
        <main className="min-h-screen bg-(--background) p-10 text-(--foreground)">
            <div className="mx-auto max-w-4xl rounded-3xl border border-(--border) bg-(--card) p-8 shadow-(--shadow)">
                <h1 className="mb-8 text-4xl font-bold">Admin Dashboard</h1>

                <div className="grid gap-4 md:grid-cols-2">
                    <input
                        type="text"
                        placeholder="Product title"
                        value={form.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        className={inputStyle}
                    />

                    <input
                        type="text"
                        placeholder="Category"
                        value={form.category}
                        onChange={(e) => updateField("category", e.target.value)}
                        className={inputStyle}
                    />

                    <input
                        type="number"
                        placeholder="Price"
                        value={form.price}
                        onChange={(e) => updateField("price", e.target.value)}
                        className={inputStyle}
                    />

                    <input
                        type="number"
                        placeholder="Discount %"
                        value={form.discount}
                        onChange={(e) => updateField("discount", e.target.value)}
                        className={inputStyle}
                    />

                    <input
                        type="number"
                        placeholder="Stock"
                        value={form.stock}
                        onChange={(e) => updateField("stock", e.target.value)}
                        className={inputStyle}
                    />

                    <input
                        type="number"
                        step="0.1"
                        placeholder="Rating"
                        value={form.rating}
                        onChange={(e) => updateField("rating", e.target.value)}
                        className={inputStyle}
                    />

                    <input
                        type="text"
                        placeholder="Shipping"
                        value={form.shipping}
                        onChange={(e) => updateField("shipping", e.target.value)}
                        className={inputStyle}
                    />

                    <input
                        type="text"
                        placeholder="Warranty"
                        value={form.warranty}
                        onChange={(e) => updateField("warranty", e.target.value)}
                        className={inputStyle}
                    />
                </div>

                {/* Drag and Drop Image Upload */}
                <div className="mt-4">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative flex h-40 cursor-pointer flex-col items-center justify-center 
                            rounded-2xl border-2 border-dashed transition-colors
                            ${
                                isDragging
                                    ? "border-(--primary) bg-(--primary)/10"
                                    : "border-(--border) bg-(--background) hover:border-(--primary)"
                            }
                        `}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        {isUploading ? (
                            <p className="font-medium text-(--primary)">
                                Uploading... {uploadProgress}%
                            </p>
                        ) : form.image ? (
                            <p className="font-medium text-green-500">
                                Image uploaded successfully! Click to replace.
                            </p>
                        ) : (
                            <div className="text-center text-gray-500">
                                <p className="font-medium">Drag & drop an image here</p>
                                <p className="text-sm">or click to browse</p>
                            </div>
                        )}
                    </div>
                </div>

                <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    className={`${inputStyle} mt-4 min-h-45 w-full`}
                />

                {/* Preview */}
                {form.image && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-(--border)">
                        <img
                            src={form.image}
                            alt="Preview"
                            className="h-64 w-full object-cover"
                        />
                    </div>
                )}

                <button
                    onClick={addItem}
                    disabled={isUploading}
                    className={`
                        mt-6 w-full rounded-2xl px-6 py-4 text-lg font-semibold text-white transition
                        ${
                            isUploading
                                ? "cursor-not-allowed bg-gray-400"
                                : "bg-(--primary) hover:bg-(--primary-hover)"
                        }
                    `}
                >
                    {isUploading ? "Uploading Image..." : "Add Item"}
                </button>
            </div>
        </main>
    );
}