import { prisma } from "@/lib/prisma";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const intakes = await prisma.intake.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-1 items-center justify-center bg-amber-50 px-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-amber-900">Student Login</h1>
        <p className="mt-1 text-sm text-amber-700">
          Select your intake and enter the password provided by your instructor.
        </p>
        <LoginForm intakes={intakes} />
      </div>
    </div>
  );
}
