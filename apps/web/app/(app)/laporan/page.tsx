import * as reportService from "@/lib/services/reports";

import { LaporanPageClient } from "@/components/laporan/laporan-page-client";

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const query = await searchParams;
  const now = new Date();
  const month = Number(query.month ?? now.getMonth() + 1);
  const year = Number(query.year ?? now.getFullYear());
  const data = await reportService.getReportSummary(year, month);

  return <LaporanPageClient year={year} month={month} data={data} />;
}
