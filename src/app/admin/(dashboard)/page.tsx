import { prisma } from "@/lib/prisma";
import { DIRECT_UPLOAD_ENABLED } from "@/lib/storage";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import PastryManager from "./PastryManager";

export const dynamic = "force-dynamic";

export default async function AdminLessonsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const pastries = await prisma.pastry.findMany({
    orderBy: { order: "asc" },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  return (
    <PastryManager
      pastries={pastries}
      directUploadEnabled={DIRECT_UPLOAD_ENABLED}
      t={t.adminLessons}
    />
  );
}
