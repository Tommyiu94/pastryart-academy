import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-amber-50 px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-amber-900">Bakery Academy</h1>
        <p className="mt-2 text-amber-700">Curriculum &amp; Recipe Portal</p>

        <div className="mt-10 flex flex-col gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-amber-700 px-6 py-3 font-medium text-white shadow hover:bg-amber-800"
          >
            Student Login
          </Link>
          <Link
            href="/admin/login"
            className="rounded-lg border border-amber-300 bg-white px-6 py-3 font-medium text-amber-800 shadow hover:bg-amber-100"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
