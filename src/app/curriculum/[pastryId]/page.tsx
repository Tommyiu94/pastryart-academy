import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentNav from "@/components/StudentNav";

export default async function PastryLessonsPage({
  params,
}: {
  params: Promise<{ pastryId: string }>;
}) {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const { pastryId } = await params;

  const pastry = await prisma.pastry.findUnique({
    where: { id: pastryId },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  if (!pastry || pastry.intakeId !== session.intakeId) {
    notFound();
  }

  return (
    <>
      <StudentNav intakeName={session.intakeName} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <Link href="/curriculum" className="text-sm text-amber-700 hover:underline">
          &larr; Back to curriculum
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-amber-900">{pastry.name}</h1>

        {pastry.lessons.length === 0 ? (
          <p className="mt-8 text-amber-700">
            No theory lessons have been uploaded for this pastry yet.
          </p>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {pastry.lessons.map((lesson) => (
              <li key={lesson.id}>
                <a
                  href={lesson.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-4 shadow transition hover:border-amber-400 hover:shadow-md"
                >
                  <span className="font-medium text-amber-900">{lesson.title}</span>
                  <span className="text-sm text-amber-600">View PDF &rarr;</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
