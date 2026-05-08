import Link from "next/link";
import { ShoppingBag, Store, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const PORTALS = [
  {
    href: "/store/demo-store",
    title: "Storefront",
    description:
      "Browse the public marketplace — products, categories, cart and checkout as a customer.",
    icon: ShoppingBag,
  },
  {
    href: "/merchant/login",
    title: "Merchant Console",
    description:
      "Manage your catalog, categories, orders and store profile as a merchant.",
    icon: Store,
  },
  {
    href: "/admin/login",
    title: "Admin Platform",
    description:
      "Platform-wide control: tenants, merchants, customers and order oversight.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="flex w-full max-w-3xl flex-col items-center gap-10 text-center">
        <header className="flex flex-col items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-900 text-lg font-bold text-white">
            D
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dukaan
          </h1>
          <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            A multi-vendor e-commerce platform. Pick a portal to get started.
          </p>
        </header>

        <div className="grid w-full gap-4 sm:grid-cols-3">
          {PORTALS.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-start gap-3 rounded-xl border border-zinc-200 bg-white p-5 text-left transition-colors hover:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-500"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                <Icon className="size-5" />
              </span>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {title}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
              <Button variant="link" className="h-auto p-0 text-sm">
                Open {title} →
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
