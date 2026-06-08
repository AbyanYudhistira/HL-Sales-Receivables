import { createCustomerAction } from "@/actions/customers";
import { CustomerForm } from "@/components/customers/customer-form";
import { Card } from "@/components/ui/card";

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Customer Baru</h1>
      <Card>
        <CustomerForm action={createCustomerAction} submitLabel="Buat Customer" />
      </Card>
    </div>
  );
}
