import Link from "next/link";

export default function Item({ id, data, type }) {
    const price = Number(data?.price || 0);
    const discount = Number(data?.discount || 0);

    // proper pricing model: discount is 0 → 1
    const finalPrice = price * (1 - discount);

    const hasDiscount = discount > 0;

    const badgeText = () => {
        if (!hasDiscount) return "HOT";

        if (type === "negative") {
            return `HOT -${Math.round(discount * 100)}%`;
        }

        return `SAVE ${Math.round(discount * 100)}%`;
    };

    const badgeColor = () => {
        if (!hasDiscount) return "bg-(--primary)";
        return type === "negative" ? "bg-red-500/90" : "bg-green-500/90";
    };

    return (
        <Link
            href={`/item/${id || 1}`}
            className="
                group flex flex-col overflow-hidden rounded-2xl
                border border-(--border)
                bg-(--card)
                shadow-(--shadow)
                transition-all duration-300
                hover:-translate-y-1
                hover:bg-(--card-hover)
                hover:shadow-2xl
            "
        >
            {/* IMAGE */}
            <div className="relative overflow-hidden">

                <img
                    className="
                        h-64 w-80 object-cover
                        transition-transform duration-500
                        group-hover:scale-105
                    "
                    alt={data?.title || "Product"}
                    src={data?.image || "/globe.svg"}
                />

                {/* BADGE */}
                <div
                    className={`
                        absolute left-3 top-3 rounded-full
                        ${badgeColor()}
                        px-3 py-1 text-xs font-semibold text-white
                        shadow-lg
                    `}
                >
                    {badgeText()}
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex flex-col gap-2 p-4">

                <span className="text-xs font-medium uppercase tracking-wide text-(--primary)">
                    {data?.category || "Featured"}
                </span>

                <h2 className="line-clamp-1 text-lg font-semibold">
                    {data?.title || "Nameless Item"}
                </h2>

                <p className="line-clamp-2 text-sm text-(--muted)">
                    {data?.subtitle || ""}
                </p>

                {/* FOOTER */}
                <div className="mt-2 flex items-center justify-between">

                    {/* PRICE */}
                    <div className="flex items-center gap-2">

                        <span className="text-xl font-bold">
                            ${finalPrice.toFixed(2)}
                        </span>

                        {hasDiscount && (
                            <span className="text-sm text-red-500 line-through">
                                ${price.toFixed(2)}
                            </span>
                        )}

                    </div>

                    {/* META */}
                    {data?.meta && (
                        <div className="flex items-center gap-2 text-sm text-(--muted)">
                            <span>No. {data.meta.number || "4"}</span>
                            <span>•</span>
                            <span>{data.meta.year || "2025"}</span>
                        </div>
                    )}

                </div>
            </div>
        </Link>
    );
}