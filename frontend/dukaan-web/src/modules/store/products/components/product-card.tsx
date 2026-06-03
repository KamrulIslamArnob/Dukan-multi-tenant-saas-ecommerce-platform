"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { Overlay } from "@astryxdesign/core/Overlay";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { localStorageService } from "@/lib/local-storage.service";
import { getMediaUrl } from "@/lib/utils";
import { HttpError } from "@/lib/http";
import { useAddCartItem } from "@/modules/store/cart/hooks";
import type { StorefrontProduct } from "../types";

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const LOW_STOCK_THRESHOLD = 5;

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const token = localStorageService.getCustomerToken(slug);
  const { mutate: addItem, isPending } = useAddCartItem(slug, token ?? "");
  const [saved, setSaved] = useState(false);

  const outOfStock = product.stockQuantity === 0;
  const lowStock = !outOfStock && product.stockQuantity <= LOW_STOCK_THRESHOLD;
  const storeName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const mediaUrl = getMediaUrl(product.imageUrl, "thumbnail");

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      router.push(`/store/${slug}/login?redirect=/store/${slug}`);
      return;
    }
    addItem(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => toast.success("Added to cart"),
        onError: (err) => {
          if (err instanceof HttpError && err.status === 400) {
            toast.error("This product is out of stock");
          } else {
            toast.error("Something went wrong, please try again");
          }
        },
      }
    );
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaved((s) => !s);
    toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
  }

  return (
    <ClickableCard href={`/store/${slug}/products/${product.id}`} label={product.name} padding={0}>
      <VStack gap={0}>
        <div className="relative overflow-hidden rounded-t-xl">
          <Overlay
            showOn="hover"
            position="bottom"
            scrim="dark"
            align="center"
            content={
              !outOfStock ? (
                <Button
                  label="Quick add to cart"
                  variant="primary"
                  width="100%"
                  icon={<ShoppingBag size={16} />}
                  isLoading={isPending}
                  onClick={handleAddToCart}
                />
              ) : (
                <Text type="supporting" color="inherit" justify="center">
                  Currently unavailable
                </Text>
              )
            }
          >
            <AspectRatio ratio={4 / 3} fit="cover">
              {mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.06] motion-reduce:transition-none"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200">
                  <ShoppingBag size={30} className="text-zinc-300" />
                </div>
              )}
            </AspectRatio>
          </Overlay>

          {/* status badges — top-left, always visible */}
          <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {outOfStock && <Badge variant="warning" label="Sold out" />}
            {lowStock && <Badge variant="orange" label={`Only ${product.stockQuantity} left`} />}
          </div>

          {/* wishlist — top-right */}
          <button
            type="button"
            onClick={handleWishlist}
            aria-pressed={saved}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            className="absolute right-2.5 top-2.5 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/85 text-zinc-700 shadow-sm backdrop-blur transition-all hover:scale-110 hover:text-rose-500 motion-reduce:transition-none"
          >
            <Heart size={17} fill={saved ? "currentColor" : "none"} className={saved ? "text-rose-500" : ""} />
          </button>
        </div>

        <VStack gap={1.5} padding={3}>
          <Text type="supporting" weight="semibold" display="block">
            <span className="text-xs uppercase tracking-wider">{storeName}</span>
          </Text>
          <Text type="body" weight="medium" maxLines={2} display="block">
            {product.name}
          </Text>
          <HStack gap={2} hAlign="between" vAlign="center" style={{ marginTop: 2 }}>
            <Text type="body" weight="semibold" hasTabularNumbers>
              {fmt.format(product.price)}
            </Text>
            {outOfStock ? (
              <Text type="supporting" color="secondary">
                <span className="text-xs text-zinc-400">Unavailable</span>
              </Text>
            ) : (
              <Text type="supporting" color="secondary">
                <span className="text-xs text-emerald-600">In stock</span>
              </Text>
            )}
          </HStack>
        </VStack>
      </VStack>
    </ClickableCard>
  );
}