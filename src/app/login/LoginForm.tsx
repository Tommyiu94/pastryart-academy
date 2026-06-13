"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Intake = { id: string; name: string };

export default function LoginForm({ intakes }: { intakes: Intake[] }) {
  const router = useRouter();
  const [intakeId, setIntakeId] = useState(intakes[0]?.id ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intakeId, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed");
      return;
    }

    router.push("/curriculum");
    router.refresh();
  }

  if (intakes.length === 0) {
    return (
      <p className="mt-6 text-sm text-amber-700">
        No intakes have been set up yet. Please check back later.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-amber-900">Intake</label>
        <select
          value={intakeId}
          onChange={(e) => setIntakeId(e.target.value)}
          className="mt-1 w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
        >
          {intakes.map((intake) => (
            <option key={intake.id} value={intake.id}>
              {intake.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-amber-900">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-md bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
