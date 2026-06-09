import { AdminLoginForm } from "@/modules/admin/components/admin-login-form";
import { CenterLayout } from "@/components/shared/center-layout";

export default function AdminLoginPage() {
  return (
    <CenterLayout className="bg-zinc-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Dukaan Admin</h1>
        <AdminLoginForm />
      </div>
    </CenterLayout>
  );
}
