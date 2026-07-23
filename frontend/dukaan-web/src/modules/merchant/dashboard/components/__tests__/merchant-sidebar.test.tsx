import { render, screen } from "@testing-library/react";
import { MerchantSidebar } from "../merchant-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

jest.mock("next/navigation", () => ({
  usePathname: () => "/merchant/dashboard",
  useRouter: () => ({ push: jest.fn() }),
}));

function renderSidebar() {
  return render(
    <SidebarProvider>
      <MerchantSidebar storeName="Demo Store" />
    </SidebarProvider>
  );
}

describe("MerchantSidebar", () => {
  it("renders the store name", () => {
    renderSidebar();
    expect(screen.getByText("Demo Store")).toBeInTheDocument();
  });

  it("renders Dashboard and Products nav links", () => {
    renderSidebar();
    expect(
      screen.getByRole("link", { name: /dashboard/i })
    ).toHaveAttribute("href", "/merchant/dashboard");
    expect(
      screen.getByRole("link", { name: /products/i })
    ).toHaveAttribute("href", "/merchant/products");
  });

  it("renders a logout button", () => {
    renderSidebar();
    expect(
      screen.getByRole("button", { name: /logout/i })
    ).toBeInTheDocument();
  });

  it("renders the active Dashboard nav link", () => {
    renderSidebar();
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    // On the /merchant/dashboard path the sidebar marks Dashboard active.
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute("href", "/merchant/dashboard");
  });
});
