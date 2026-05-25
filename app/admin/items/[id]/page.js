"use client";
import { useEffect, useState, useRef } from "react"; // Added useRef
import { doc, getDoc, updateDoc } from "firebase/firestore";
// Added storage imports
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; 
// Assuming storage is exported from firebase.ts
import { db, storage } from "@/app/lib/firebase.client"; 
import { useParams } from "next/navigation";

export default function EditItemPage() {
    const { id } = useParams();

    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);

    // New state for upload functionality
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!id) return;

        const loadItem = async () => {
            setLoading(true);

            const ref = doc(db, "items", id);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setForm({
                    id: snap.id,
                    ...snap.data(),
                });
            }

            setLoading(false);
        };

        loadItem();
    }, [id]);

    const updateField = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // --- Drag and Drop Handlers ---
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

    // --- Firebase Storage Upload Logic ---
    const uploadImage = (file) => {
        if (!file || !id) return;

        setIsUploading(true);
        setUploadProgress(0);

        // Create a unique path for the image in storage
        // Organized by item ID: products/[itemId]/[timestamp]_[filename]
        const storageRef = ref(storage, `products/${id}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                // Update progress bar state
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
                // Success: Get the download URL and update the form state
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                updateField("image", downloadURL);
                setIsUploading(false);
                setUploadProgress(0);
            }
        );
    };

    const saveItem = async () => {
        try {
            // Prevent saving if image is still uploading
            if (isUploading) {
                alert("Please wait for the image to finish uploading.");
                return;
            }

            const itemRef = doc(db, "items", id);
            
            // Explicitly destruct id so we don't save it inside the document payload
            const { id: _, ...dataToSave } = form;

            await updateDoc(itemRef, {
                ...dataToSave,
                price: Number(form.price),
                discount: Number(form.discount || 0),
                stock: Number(form.stock || 0),
                rating: Number(form.rating || 0),
            });

            alert("Item updated successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to update item.");
        }
    };

    if (loading) {
        return <div className="p-10">Loading...</div>;
    }

    if (!form) {
        return <div className="p-10">Item not found</div>;
    }

    const inputStyle =
        "rounded-2xl border border-(--border) bg-(--background) p-4 outline-none transition focus:border-(--primary)";

    return (
        <main className="min-h-screen bg-(--background) p-10 text-(--foreground)">
            <div className="mx-auto max-w-5xl rounded-3xl border border-(--border) bg-(--card) p-8 shadow-(--shadow)">

                <h1 className="mb-8 text-4xl font-bold">
                    Edit Item
                </h1>

                {/* GRID INPUTS */}
                <div className="grid gap-4 md:grid-cols-2">

                    <input
                        value={form.title || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                        placeholder="Title"
                        className={inputStyle}
                    />

                    <input
                        value={form.category || ""}
                        onChange={(e) => updateField("category", e.target.value)}
                        placeholder="Category"
                        className={inputStyle}
                    />

                    <input
                        type="number"
                        value={form.price || ""}
                        onChange={(e) => updateField("price", e.target.value)}
                        placeholder="Price"
                        className={inputStyle}
                    />

                    <input
                        type="number"
                        value={form.discount || ""}
                        onChange={(e) => updateField("discount", e.target.value)}
                        placeholder="Discount %"
                        className={inputStyle}
                    />

                    <input
                        type="number"
                        value={form.stock || ""}
                        onChange={(e) => updateField("stock", e.target.value)}
                        placeholder="Stock"
                        className={inputStyle}
                    />

                    <input
                        type="number"
                        step="0.1"
                        value={form.rating || ""}
                        onChange={(e) => updateField("rating", e.target.value)}
                        placeholder="Rating"
                        className={inputStyle}
                    />

                    <input
                        value={form.shipping || ""}
                        onChange={(e) => updateField("shipping", e.target.value)}
                        placeholder="Shipping"
                        className={inputStyle}
                    />

                    <input
                        value={form.warranty || ""}
                        onChange={(e) => updateField("warranty", e.target.value)}
                        placeholder="Warranty"
                        className={inputStyle}
                    />
                </div>

                {/* --- Image Drag and Drop Area --- */}
                <div className="mt-4">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        // Trigger file browser on click
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
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {isUploading ? (
                            <div className="text-center text-(--primary)">
                                <p className="font-medium">Uploading... {uploadProgress}%</p>
                                {/* Optional: Add a CSS spinner here */}
                            </div>
                        ) : form.image ? (
                            <div className="text-center">
                                <p className="font-medium text-emerald-500">
                                    Image set from database/upload.
                                </p>
                                <p className="text-sm text-gray-500">Drag or click to replace.</p>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <p className="font-medium">Drag & drop an image here</p>
                                <p className="text-sm">or click to browse</p>
                            </div>
                        )}
                    </div>
                </div>

                <textarea
                    value={form.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Description"
                    className={`${inputStyle} mt-4 min-h-40 w-full`}
                />

                {/* IMAGE PREVIEW */}
                {form.image && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-(--border)">
                        <img
                            src={form.image}
                            alt="preview"
                            className="h-72 w-full object-cover"
                        />
                    </div>
                )}

                {/* SAVE BUTTON */}
                <button
                    onClick={saveItem}
                    // Disable button during upload
                    disabled={isUploading} 
                    className={`
                        mt-6 w-full rounded-2xl
                        px-6 py-4 text-lg font-semibold text-white
                        transition
                        ${
                            isUploading
                                ? "cursor-not-allowed bg-gray-400"
                                : "bg-(--primary) hover:bg-(--primary-hover)"
                        }
                    `}
                >
                    {isUploading ? `Uploading Image (${uploadProgress}%)` : "Save Changes"}
                </button>

            </div>
        </main>
    );
}