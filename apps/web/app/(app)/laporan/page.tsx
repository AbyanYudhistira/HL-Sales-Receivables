import * as reportService from "@/lib/services/reports";
import { parseMonthYear } from "@/lib/parse-search-params";

import { LaporanPageClient } from "@/components/laporan/laporan-page-client";

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const query = await searchParams;
  const { month, year } = parseMonthYear(query);
  const data = await reportService.getReportSummary(year, month);

  return <LaporanPageClient year={year} month={month} data={data} />;
}
