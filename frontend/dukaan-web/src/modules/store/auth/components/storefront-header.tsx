"use client";

import Link from "next/link";
import { useCustomerAuthState } from "../hooks";
import { CartDrawer } from "@/modules/store/cart/components/cart-drawer";
import { NotificationBell } from "@/modules/notifications/notification-bell";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Text } from "@astryxdesign/core/Text";

const ANNOUNCEMENTS = [
  "Free shipping on orders over $50",
  "30-day easy returns",
  "Secure checkout",
  "New arrivals every week",
  "Everyday essentials, delivered",
];

function titleCase(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function StorefrontHeader({ slug }: { slug: string }) {
  const { token, email } = useCustomerAuthState(slug);
  const storeName = titleCase(slug);
  const monogram = storeName.charAt(0) || "D";

  return (
    <div className="sticky top-0 z-30">
      <style>{`
        @keyframes dukaanMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .dukaan-marquee__track { display: inline-flex; white-space: nowrap; animation: dukaanMarquee 28s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .dukaan-marquee__track { animation: none; transform: translateX(0); }
        }
      `}</style>

      {/* announcement marquee */}
      <div className="flex h-8 items-center overflow-hidden bg-zinc-900 text-zinc-100">
        <ul className="sr-only">
          {ANNOUNCEMENTS.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
        <div className="dukaan-marquee__track" aria-hidden="true">
          {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((a, i) => (
            <span key={i} className="flex items-center text-xs font-medium tracking-wide">
              <span className="px-6">{a}</span>
              <span className="text-zinc-500" aria-hidden="true">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* brand bar */}
      <header className="flex h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white/85 px-4 backdrop-blur-md sm:px-6">
        <Link
          href={`/store/${slug}`}
          className="group inline-flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-90"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-base font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none">
            {monogram}
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <Text size="xl" weight="bold">{storeName}</Text>
            <Text type="supporting" color="secondary">
              <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">General Store</span>
            </Text>
          </span>
          <span className="text-lg font-semibold sm:hidden">{storeName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <a
            href="#shop"
            className="rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            Shop all
          </a>
          <a
            href="#categories"
            className="rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            Categories
          </a>
        </nav>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="flex items-center">
            <CartDrawer slug={slug} token={token} />
          </div>
          <NotificationBell token={token} enabled />
          {token ? (
            <Link
              href={`/store/${slug}/profile`}
              className="ml-1 rounded-full ring-offset-2 ring-zinc-900 transition-shadow hover:ring-2"
              aria-label={`Account${email ? `: ${email}` : ""}`}
            >
              <Avatar name={email ?? "Account"} size="small" />
            </Link>
          ) : (
            <Link
              href={`/store/${slug}/login`}
              className="ml-1 inline-flex h-9 items-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>
    </div>
  );
}