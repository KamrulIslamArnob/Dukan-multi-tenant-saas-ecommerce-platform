"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw, X } from "lucide-react";
import { Card } from "@astryxdesign/core/Card";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";
import { Divider } from "@astryxdesign/core/Divider";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Grid } from "@astryxdesign/core/Grid";
import { CategoryFilter } from "./category-filter";
import { ProductGrid } from "./product-grid";
import {
  useStorefrontStore,
  useStorefrontCategories,
  useStorefrontProducts,
  useStorefrontProductsByCategory,
} from "../hooks";
import { HttpError } from "@/lib/http";
import type { PagedResponse, StorefrontCategory, StorefrontProduct, StorefrontTenant } from "../types";

type SortKey = "featured" | "price-asc" | "price-desc";

const TRUST = [
  { icon: Truck, title: "Fast, free shipping", body: "On every order over $50" },
  { icon: RotateCcw, title: "30-day returns", body: " Hassle-free, no questions asked" },
  { icon: ShieldCheck, title: "Secure checkout", body: "Encrypted end-to-end payments" },
  { icon: Sparkles, title: "Curated quality", body: "Hand-picked by the store owner" },
];

function buildCategoryIndex(cats: StorefrontCategory[] | undefined) {
  const map = new Map<string, string>();
  const walk = (list: StorefrontCategory[]) => {
    for (const c of list) {
      map.set(c.id, c.name);
      if (c.subCategories?.length) walk(c.subCategories);
    }
  };
  if (cats) walk(cats);
  return map;
}

export function StorefrontView() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("featured");

  const shopRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  const { data: storeData, error: storeError } = useStorefrontStore(slug!);
  const { data: categoriesData } = useStorefrontCategories(slug!);

  const allProducts = useStorefrontProducts(slug!, page);
  const categoryProducts = useStorefrontProductsByCategory(slug!, activeCategoryId ?? "", page);
  const { data, isLoading, error } = activeCategoryId ? categoryProducts : allProducts;

  const categoryIndex = useMemo(() => buildCategoryIndex(categoriesData?.items), [categoriesData]);
  const paged = data as PagedResponse<StorefrontProduct> | undefined;

  const products = useMemo(() => {
    const base = paged?.items ?? [];
    if (sortKey === "price-asc") return [...base].sort((a, b) => a.price - b.price);
    if (sortKey === "price-desc") return [...base].sort((a, b) => b.price - a.price);
    return base;
  }, [paged, sortKey]);

  function handleCategorySelect(id: string | null) {
    setActiveCategoryId(id);
    setPage(1);
    setSortKey("featured");
  }

  function scrollTo(ref: React.RefObject<HTMLDivElement | null>) {
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  const storeName = storeData?.storeName ?? slug!.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const activeCategoryName = activeCategoryId ? categoryIndex.get(activeCategoryId) : null;
  const showing = products.length;

  if (storeError instanceof HttpError && storeError.status === 404) {
    return (
      <VStack hAlign="center" padding={10} style={{ flex: 1 }}>
        <Heading level={2}>Store not found</Heading>
        <Text type="supporting" color="secondary">
          {"The store you're looking for doesn't exist or has moved."}
        </Text>
      </VStack>
    );
  }

  if (error instanceof HttpError && error.status === 404) {
    return (
      <VStack hAlign="center" padding={10} style={{ flex: 1 }}>
        <Heading level={2}>Store not found</Heading>
        <Text type="supporting" color="secondary">
          {"The store you're looking for doesn't exist or has moved."}
        </Text>
      </VStack>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl motion-reduce:hidden" />
        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl motion-reduce:hidden" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-4 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
          <VStack gap={2} hAlign="start" style={{ maxWidth: 640 }}>
            <Badge variant="green" label="Multi-vendor marketplace" />
            <Heading level={1} type="display-3" textWrap="balance">
              {storeName}
            </Heading>
            <Text type="large" color="secondary" textWrap="pretty" maxLines={3} display="block">
              Thoughtfully curated products from {storeName}. Shop the collection, filter by
              category, and check out in minutes — all in one place.
            </Text>
            <HStack gap={3} vAlign="center" style={{ marginTop: 4, flexWrap: "wrap" }}>
              <Button
                label="Shop the collection"
                variant="primary"
                size="lg"
                icon={<ArrowRight size={18} />}
                onClick={() => scrollTo(shopRef)}
              />
              <Button
                label="Browse categories"
                variant="secondary"
                size="lg"
                onClick={() => scrollTo(catRef)}
              />
            </HStack>
          </VStack>
        </div>
      </section>

      {/* CATEGORY NAV (sticky) */}
      <div
        ref={catRef}
        id="categories"
        className="sticky top-0 z-20 border-y border-zinc-200 bg-white/85 backdrop-blur-md"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <CategoryFilter
            categories={categoriesData?.items ?? []}
            activeId={activeCategoryId}
            onSelect={handleCategorySelect}
          />
        </div>
      </div>

      {/* MAIN */}
      <main id="shop" ref={shopRef} className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* toolbar */}
        <HStack hAlign="between" vAlign="center" gap={3} style={{ flexWrap: "wrap", marginBottom: 20 }}>
          <VStack gap={0.5}>
            <HStack gap={2} vAlign="center">
              <Text type="label" weight="semibold">
                {activeCategoryName ? activeCategoryName : "All products"}
              </Text>
              {paged && <Badge variant="neutral" label={paged.totalCount} />}
            </HStack>
            <Text type="supporting" color="secondary">
              {activeCategoryName
                ? `Browsing ${activeCategoryName}`
                : showing === 0
                  ? ""
                  : `Showing ${showing} of ${paged?.totalCount ?? showing}`}
            </Text>
          </VStack>

          <HStack gap={2} vAlign="center">
            {activeCategoryId && (
              <Button
                label="Clear"
                variant="ghost"
                size="sm"
                icon={<X size={15} />}
                onClick={() => handleCategorySelect(null)}
              />
            )}
            <HStack gap={0.5} vAlign="center">
              <Text type="supporting" color="secondary">
                <span className="mr-1 text-xs">Sort</span>
              </Text>
              {([
                { k: "featured", label: "Featured" },
                { k: "price-asc", label: "Price ↑" },
                { k: "price-desc", label: "Price ↓" },
              ] as const).map((opt) => (
                <Button
                  key={opt.k}
                  label={opt.label}
                  variant={sortKey === opt.k ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortKey(opt.k)}
                />
              ))}
            </HStack>
          </HStack>
        </HStack>

        <ProductGrid products={products} isLoading={isLoading} />

        {/* pagination */}
        {paged && (paged.totalPages > 1 || paged.pageNumber > 1) && (
          <HStack gap={3} hAlign="between" vAlign="center" style={{ marginTop: 28 }}>
            <Text type="supporting" color="secondary">
              Page {paged.pageNumber} of {paged.totalPages}
            </Text>
            <HStack gap={2} vAlign="center">
              <Button
                label="Previous"
                variant="secondary"
                size="sm"
                isDisabled={!paged.hasPreviousPage}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  scrollTo(shopRef);
                }}
              />
              <Button
                label="Next"
                variant="secondary"
                size="sm"
                isDisabled={!paged.hasNextPage}
                onClick={() => {
                  setPage((p) => p + 1);
                  scrollTo(shopRef);
                }}
              />
            </HStack>
          </HStack>
        )}
      </main>

      {/* TRUST STRIP */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <Card variant="muted" padding={0}>
          <Grid columns={{ minWidth: 200, max: 4 }} gap={0}>
            {TRUST.map(({ icon: Icon, title, body }) => (
              <VStack key={title} gap={1} padding={4} hAlign="start">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm ring-1 ring-zinc-200">
                  <Icon size={20} />
                </span>
                <Text type="label" weight="semibold">{title}</Text>
                <Text type="supporting" color="secondary">{body}</Text>
              </VStack>
            ))}
          </Grid>
        </Card>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <VStack gap={1} hAlign="start">
            <HStack gap={2} vAlign="center">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-900 text-sm font-bold text-white">
                {storeName.charAt(0)}
              </span>
              <Heading level={3}>{storeName}</Heading>
            </HStack>
            <Text type="supporting" color="secondary" maxLines={2} display="block">
              Thanks for stopping by {storeName}. Every order supports an independent seller.
            </Text>
            <Divider variant="subtle" />
            <Text type="supporting" color="secondary">
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                Powered by Dukaan
              </span>
            </Text>
          </VStack>
        </div>
      </footer>
    </div>
  );
}