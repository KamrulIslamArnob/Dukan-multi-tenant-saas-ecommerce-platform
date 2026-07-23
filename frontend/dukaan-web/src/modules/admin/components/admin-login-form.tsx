"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { http, HttpError } from "@/lib/http";

interface LoginFormData {
  email: string;
  password: string;
}

export function AdminLoginForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(data: LoginFormData) {
    setError(null);
    try {
      const response = await http<{ token: string; email: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const payload = response.token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      const userType = Number(decoded.user_type);

      if (userType !== 3) {
        setError("Access denied — admin privileges required.");
        return;
      }

      localStorage.setItem("admin_token", response.token);
      router.push("/admin");
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email", { required: "Email is required" })}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="admin@dukaan.com"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register("password", { required: "Password is required" })}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-gray-900 text-white rounded px-3 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
