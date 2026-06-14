import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DIRECT_UPLOAD_ENABLED } from "@/lib/storage";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import IntakeManager from "./IntakeManager";

export default async function AdminIntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);

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
        {t.adminIntakeDetail.back}
      </Link>
      <IntakeManager
        intake={intake}
        directUploadEnabled={DIRECT_UPLOAD_ENABLED}
        t={t.adminIntakeDetail}
      />
    </div>
  );
}
