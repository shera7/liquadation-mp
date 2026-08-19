import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import EmployeeManager from "@/components/admin/EmployeeManager";

export const dynamic = "force-dynamic";

export default async function AdminEmployeesPage() {
  const token = cookies().get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (session?.role !== "FULL") redirect("/admin");

  const employees = await prisma.admin.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Сотрудники</h1>
      <EmployeeManager initialEmployees={employees} />
    </div>
  );
}
