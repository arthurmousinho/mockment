import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";
import type { Invoice } from "../../generated/prisma/client.ts";

const C = {
  black: "#18181B",
  gray: "#71717A",
  border: "#E4E4E7",
  red: "#9F1239",
  redBackground: "#FFF1F2",
  green: "#15803D",
};

export function getInvoicePdfPath(id: string) {
  const directory = fileURLToPath(
    new URL("../../storage/invoices/", import.meta.url),
  );
  return path.join(directory, `${id}.pdf`);
}

export async function generateInvoicePdf(invoice: Invoice) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    info: {
      Title: `Mock Invoice ${invoice.id}`,
      Author: "Mockment",
      Subject: "Simulated invoice - Not a real document",
    },
  });

  const chunks: Buffer[] = [];
  const pdfPromise = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const x = 48;
  const right = doc.page.width - 48;
  const width = right - x;

  const write = (
    value: string,
    px: number,
    py: number,
    size = 10,
    color = C.black,
    bold = false,
    options: PDFKit.Mixins.TextOptions = {},
  ) => {
    doc
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(size)
      .fillColor(color)
      .text(value, px, py, {
        lineBreak: false,
        ellipsis: true,
        ...options,
      });
  };

  const line = (y: number) => {
    doc
      .moveTo(x, y)
      .lineTo(right, y)
      .lineWidth(0.7)
      .strokeColor(C.border)
      .stroke();
  };

  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: invoice.currency,
  }).format(invoice.amountInCents / 100);

  const date = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(invoice.issuedAt ?? invoice.createdAt);

  // Background watermark
  doc.save();
  doc.opacity(0.045);
  doc.font("Helvetica-Bold").fontSize(100);
  doc.fillColor(C.black);
  doc.rotate(-35, {
    origin: [doc.page.width / 2, doc.page.height / 2],
  });
  doc.text("SAMPLE", 60, 380, {
    width: 480,
    align: "center",
  });
  doc.restore();

  // Header
  write("mockment", x, 50, 17, C.black, true);
  write("INVOICE", right - 100, 55, 9, C.gray, true, {
    width: 100,
    align: "right",
  });

  // Explicit fake document warning
  doc.roundedRect(x, 100, width, 80, 7).fill(C.redBackground);

  write("THIS IS NOT A REAL INVOICE", x + 18, 116, 13, C.red, true);

  write(
    "This document is simulated and intended only for",
    x + 18,
    140,
    9,
    C.red,
  );

  write(
    "development and testing. It has no fiscal or legal validity.",
    x + 18,
    154,
    9,
    C.red,
  );

  // Main amount
  write("Invoice amount", x, 222, 11, C.gray);
  write(amount, x, 245, 30, C.black, true);

  write("ISSUED (SIMULATED)", x, 302, 9, C.green, true);

  write(date, x + 145, 302, 9, C.gray);

  line(342);

  // Customer
  write("BILLED TO", x, 370, 9, C.gray, true);
  write(invoice.customerName, x, 393, 12, C.black, true, {
    width: 230,
  });

  if (invoice.customerTaxId) {
    write(`Tax ID: ${invoice.customerTaxId}`, x, 418, 9, C.gray, false, {
      width: 230,
    });
  }

  // Invoice information
  const col = 325;

  write("INVOICE DETAILS", col, 370, 9, C.gray, true);
  write(invoice.id, col, 393, 10, C.black, true, {
    width: 220,
  });
  write(date, col, 418, 9, C.gray);
  write(`Currency: ${invoice.currency}`, col, 437, 9, C.gray);

  // Description table
  write("DESCRIPTION", x, 505, 9, C.gray, true);
  write("AMOUNT", right - 130, 505, 9, C.gray, true, {
    width: 130,
    align: "right",
  });

  line(531);

  write("Invoice total", x, 550, 11, C.black, true);

  if (invoice.paymentId) {
    write(`Payment ${invoice.paymentId}`, x, 573, 9, C.gray, false, {
      width: 280,
    });
  }

  write(amount, right - 155, 550, 11, C.black, true, {
    width: 155,
    align: "right",
  });

  write(
    "FAKE DOCUMENT - NOT VALID FOR TAX OR PAYMENT PURPOSES",
    x,
    789,
    8,
    C.red,
    true,
    { width },
  );

  doc.end();

  const pdf = await pdfPromise;

  const directory = fileURLToPath(
    new URL("../../storage/invoices/", import.meta.url),
  );

  await mkdir(directory, { recursive: true });

  await writeFile(getInvoicePdfPath(invoice.id), pdf);
}
