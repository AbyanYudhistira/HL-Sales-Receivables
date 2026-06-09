import { sanitizeFilename } from "@/lib/pdf/filename";

export function pdfResponse(buffer: Buffer, filename: string) {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(filename)}"`,
      "Cache-Control": "no-store",
    },
  });
}
