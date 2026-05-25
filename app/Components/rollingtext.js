export default function RollingText() {
    const messages = [
        "🔥 Big Sale: Up to 50% off",
        "🚚 Free shipping over $50",
        "🆕 New arrivals every week",
        "💸 Best prices guaranteed",
        "⭐ 4.9/5 Customer Rating",
    ];

    return (
        <div className="relative flex w-full overflow-hidden border-b border-(--border) bg-(--card) py-3">
            <div className="animate-marquee whitespace-nowrap">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-12 pr-12 text-xs font-bold uppercase tracking-widest text-(--muted)">
                        {messages.map((msg, idx) => (
                            <span key={idx} className="flex items-center gap-2">
                                <span className="text-(--primary)">•</span> {msg}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}