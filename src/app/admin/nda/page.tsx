import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import NdaDocumentManager from "@/components/admin/NdaDocumentManager";

export const dynamic = "force-dynamic";

export default async function AdminNdaPage() {
  const token = cookies().get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (session?.role !== "FULL") redirect("/admin");

  const documents = await prisma.ndaDocument.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { acceptances: true } } },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">NDA-документ</h1>
      <NdaDocumentManager initialDocuments={documents as any} />
    </div>
  );
}
