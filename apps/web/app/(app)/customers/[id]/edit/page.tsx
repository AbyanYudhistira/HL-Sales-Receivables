import { notFound } from "next/navigation";

import { updateCustomerAction } from "@/actions/customers";
import { CustomerForm } from "@/components/customers/customer-form";
import { Card } from "@/components/ui/card";
import { parseDiscountSteps } from "@/lib/format-idr";
import * as customerService from "@/lib/services/customers";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await customerService.getCustomerById(id);
  if (!customer) notFound();

  const updateAction = updateCustomerAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Customer</h1>
      <Card>
        <CustomerForm
          action={updateAction}
          initial={{
            nama: customer.nama,
            discountLm: parseDiscountSteps(customer.discountLm),
            discountBr: parseDiscountSteps(customer.discountBr),
            bonusThreshold: Number(customer.bonusThreshold),
          }}
          submitLabel="Perbarui"
        />
      </Card>
    </div>
  );
}
