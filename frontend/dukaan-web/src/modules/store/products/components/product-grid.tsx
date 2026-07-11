import { Grid } from "@astryxdesign/core/Grid";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/Layout";
import { ProductCard } from "./product-card";
import type { StorefrontProduct } from "../types";

interface ProductGridProps {
  products: StorefrontProduct[];
  isLoading: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <Grid columns={{ minWidth: 260, max: 4 }} gap={4}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-zinc-200 bg-white animate-pulse">
            <div className="aspect-[4/3] w-full bg-zinc-100" />
            <div className="flex flex-col gap-2 p-3">
              <div className="h-2.5 w-12 rounded-full bg-zinc-100" />
              <div className="h-3.5 w-full rounded bg-zinc-100" />
              <div className="h-3.5 w-2/3 rounded bg-zinc-100" />
              <div className="mt-1 h-4 w-20 rounded bg-zinc-100" />
            </div>
          </div>
        ))}
      </Grid>
    );
  }

  if (products.length === 0) {
    return (
      <VStack hAlign="center" padding={6}>
        <Text type="body" color="secondary">No products found.</Text>
      </VStack>
    );
  }

  return (
    <Grid columns={{ minWidth: 260, max: 4 }} gap={4}>
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </Grid>
  );
}
