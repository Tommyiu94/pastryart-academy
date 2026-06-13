import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentNav from "@/components/StudentNav";

export default async function CurriculumPage() {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const pastries = await prisma.pastry.findMany({
    where: { intakeId: session.intakeId },
    orderBy: { order: "asc" },
    include: { _count: { select: { lessons: true } } },
  });

  return (
    <>
      <StudentNav intakeName={session.intakeName} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-amber-900">Your Curriculum</h1>
        <p className="mt-1 text-amber-700">
          Theory lessons for each pastry in your intake.
        </p>

        {pastries.length === 0 ? (
          <p className="mt-8 text-amber-700">
            No pastries have been added to your intake yet. Check back soon!
          </p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {pastries.map((pastry) => (
              <li key={pastry.id}>
                <Link
                  href={`/curriculum/${pastry.id}`}
                  className="block rounded-xl border border-amber-200 bg-white p-5 shadow transition hover:border-amber-400 hover:shadow-md"
                >
                  <h2 className="text-lg font-semibold text-amber-900">{pastry.name}</h2>
                  <p className="mt-1 text-sm text-amber-600">
                    {pastry._count.lessons} lesson{pastry._count.lessons === 1 ? "" : "s"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
