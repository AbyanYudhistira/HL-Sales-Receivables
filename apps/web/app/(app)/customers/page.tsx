import * as customerService from "@/lib/services/customers";
import { parseListSearchParams } from "@/lib/parse-search-params";

import { CustomersPageClient } from "@/components/customers/customers-page-client";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const query = await searchParams;
  const { search, page } = parseListSearchParams(query);

  const result = await customerService.listCustomersForTable({ search, page });

  return (
    <CustomersPageClient
      initialSearch={search}
      initialPage={page}
      totalCount={result.totalCount}
      customers={result.rows}
    />
  );
}
