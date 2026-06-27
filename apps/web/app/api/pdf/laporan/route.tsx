import { renderToBuffer } from "@react-pdf/renderer";

import { formatMonthYear } from "@/lib/format-idr";
import { sanitizeFilename } from "@/lib/pdf/filename";
import { pdfResponse } from "@/lib/pdf/response";
import { requirePdfAuth } from "@/lib/pdf/require-auth";
import { ReportDocument } from "@/lib/pdf/templates/report-document";
import * as reportService from "@/lib/services/reports";

function parseMonthYear(searchParams: URLSearchParams) {
  const now = new Date();
  const month = Number(searchParams.get("month") ?? now.getMonth() + 1);
  const year = Number(searchParams.get("year") ?? now.getFullYear());

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return null;
  }

  return { month, year };
}

export async function GET(request: Request) {
  const session = await requirePdfAuth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const period = parseMonthYear(new URL(request.url).searchParams);
  if (!period) {
    return new Response("Bad Request", { status: 400 });
  }

  const hideLaba = new URL(request.url).searchParams.get("hideLaba") === "1";
  const data = await reportService.getReportSummary(period.year, period.month);
  const buffer = await renderToBuffer(
    <ReportDocument
      data={{ month: period.month, year: period.year, ...data }}
      hideLaba={hideLaba}
    />
  );
  const filename = `laporan-${sanitizeFilename(formatMonthYear(period.month, period.year))}.pdf`;

  return pdfResponse(buffer, filename);
}
