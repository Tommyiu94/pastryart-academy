import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import IntakeManager from "./IntakeManager";

export default async function AdminIntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const intake = await prisma.intake.findUnique({
    where: { id },
    include: {
      pastries: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!intake) notFound();

  return (
    <div>
      <Link href="/admin" className="text-sm text-amber-700 hover:underline">
        &larr; Back to intakes
      </Link>
      <IntakeManager intake={intake} />
    </div>
  );
}
