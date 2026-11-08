import type { InvoiceWhereInput } from "../../../generated/prisma/models/Invoice.ts";
import { buildSearchFilter } from "../../common/search.ts";

export function buildInvoiceSearchFilter(search?: string): InvoiceWhereInput {
  return buildSearchFilter<InvoiceWhereInput>(search, [
    (term) => ({ id: { contains: term } }),
    (term) => ({ paymentId: { contains: term } }),
    (term) => ({ customerName: { contains: term } }),
    (term) => ({ customerTaxId: { contains: term } }),
  ]);
}
