import { createCustomerAction } from "@/actions/customers";
import { CustomerForm } from "@/components/customers/customer-form";
import { Card } from "@/components/ui/card";

export default function NewCustomerPage() {
  async function action(formData: FormData) {
    "use server";
    await createCustomerAction(formData);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="font-display text-3xl font-semibold text-foreground">Tambah Pelanggan</h1>
      <Card>
        <CustomerForm action={action} submitLabel="Simpan" returnTo="/pelanggan" />
      </Card>
    </div>
  );
}
