import type { StorefrontCategory } from "../types";

interface CategoryFilterProps {
  categories: StorefrontCategory[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

function pillClasses(isActive: boolean, subtle = false) {
  return [
    "shrink-0 whitespace-nowrap rounded-full border text-sm transition-all duration-200",
    "motion-reduce:transition-none",
    subtle ? "px-3 py-1.5" : "px-4 py-2 font-medium",
    isActive
      ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
      : subtle
        ? "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-900"
        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
  ].join(" ");
}

export function CategoryFilter({ categories, activeId, onSelect }: CategoryFilterProps) {
  const topLevel = categories.filter((c) => c.parentCategoryId === null);
  const activeTop =
    topLevel.find((c) => c.id === activeId) ??
    topLevel.find((c) => c.subCategories.some((s) => s.id === activeId)) ??
    null;
  const subs = activeTop?.subCategories ?? [];

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1"
        role="group"
        aria-label="Product categories"
      >
        <button
          type="button"
          aria-pressed={activeId === null}
          onClick={() => onSelect(null)}
          className={pillClasses(activeId === null)}
        >
          All
        </button>
        {topLevel.map((cat) => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={activeId === cat.id || subs.some((s) => s.id === activeId)}
            onClick={() => onSelect(cat.id)}
            className={pillClasses(activeTop?.id === cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {subs.length > 0 && (
        <div
          className="flex items-center gap-2 overflow-x-auto pl-1 motion-reduce:[animation:none]"
          role="group"
          aria-label={`Refine within ${activeTop?.name ?? "category"}`}
        >
          <span className="text-xs uppercase tracking-wider text-zinc-400 mr-1 origin-left">
            in {activeTop?.name}
          </span>
          <button
            type="button"
            aria-pressed={activeTop?.id === activeId}
            onClick={() => onSelect(activeTop!.id)}
            className={pillClasses(activeTop?.id === activeId, true)}
          >
            All {activeTop?.name}
          </button>
          {subs.map((sub) => (
            <button
              key={sub.id}
              type="button"
              aria-pressed={sub.id === activeId}
              onClick={() => onSelect(sub.id)}
              className={pillClasses(sub.id === activeId, true)}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}