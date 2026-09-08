import { prisma } from "@/lib/prisma";
import PaymentTermsManager from "@/components/admin/PaymentTermsManager";

export const dynamic = "force-dynamic";

export default async function AdminPaymentTermsPage() {
  const terms = await prisma.paymentTerm.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-800 text-2xl text-graphite mb-2">Условия оплаты</h1>
      <p className="text-sm text-steel mb-6">
        Эти условия клиент сможет выбрать в форме заявки на товар. Если указан «порог от суммы» —
        условие предлагается только для товаров дороже этой суммы (в USD, по текущему курсу).
        Условие без порога доступно для любого товара.
      </p>
      <PaymentTermsManager initialTerms={terms as any} />
    </div>
  );
}
