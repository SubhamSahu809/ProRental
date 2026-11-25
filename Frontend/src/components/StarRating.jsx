import { Star } from "lucide-react";

/** Read-only stars, or an input when `onChange` is passed. */
export default function StarRating({ value = 0, onChange, size = 18 }) {
  const stars = [1, 2, 3, 4, 5];

  if (!onChange) {
    return (
      <span className="inline-flex text-yellow-500" aria-label={`${value} out of 5 stars`}>
        {stars.map((s) => (
          <Star key={s} size={size} fill={s <= Math.round(value) ? "currentColor" : "none"} className={s <= Math.round(value) ? "" : "text-gray-300"} />
        ))}
      </span>
    );
  }

  return (
    <div className="inline-flex gap-1" role="radiogroup" aria-label="Rating">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
          onClick={() => onChange(s)}
          className={`p-0.5 ${s <= value ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
        >
          <Star size={size + 6} fill={s <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}
