import { renderToBuffer } from "@react-pdf/renderer";

import { formatMonthYear } from "@/lib/format-idr";
import { buildCustomerPdfData } from "@/lib/pdf/data/customer-data";
import { sanitizeFilename } from "@/lib/pdf/filename";
import { pdfResponse } from "@/lib/pdf/response";
import { requirePdfAuth } from "@/lib/pdf/require-auth";
import { CustomerDocument } from "@/lib/pdf/templates/customer-document";

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePdfAuth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const period = parseMonthYear(searchParams);
  if (!period) {
    return new Response("Bad Request", { status: 400 });
  }

  const { id } = await params;
  const data = await buildCustomerPdfData(id, period.year, period.month);
  if (!data) {
    return new Response("Not Found", { status: 404 });
  }

  const buffer = await renderToBuffer(<CustomerDocument data={data} />);
  const filename = `pelanggan-${sanitizeFilename(data.customerName)}-${sanitizeFilename(formatMonthYear(period.month, period.year))}.pdf`;

  return pdfResponse(buffer, filename);
}
