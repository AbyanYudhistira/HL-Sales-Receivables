import { renderToBuffer } from "@react-pdf/renderer";

import { buildBonPdfData } from "@/lib/pdf/data/bon-data";
import { sanitizeFilename } from "@/lib/pdf/filename";
import { pdfResponse } from "@/lib/pdf/response";
import { requirePdfAuth } from "@/lib/pdf/require-auth";
import { BonDocument } from "@/lib/pdf/templates/bon-document";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePdfAuth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const data = await buildBonPdfData(id);
  if (!data) {
    return new Response("Not Found", { status: 404 });
  }

  const buffer = await renderToBuffer(<BonDocument data={data} />);
  const filename = `bon-${sanitizeFilename(data.nomorBon)}.pdf`;

  return pdfResponse(buffer, filename);
}
