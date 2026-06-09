import * as customerService from "@/lib/services/customers";

import { CustomersPageClient } from "@/components/customers/customers-page-client";

export default async function CustomersPage() {
  const customers = await customerService.getCustomersWithSummaries();

  return (
    <CustomersPageClient
      customers={customers.map((customer) => ({
        id: customer.id,
        nama: customer.nama,
        totalUnpaid: customer.totalUnpaid,
        totalPaid: customer.totalPaid,
        bonusAvailable: customer.bonusAvailable,
      }))}
    />
  );
}
