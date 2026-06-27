export const TRANSACTIONS_PAGE_SIZE = 20;
export const CUSTOMERS_PAGE_SIZE = 20;
export const PRODUCTS_PAGE_SIZE = 20;

/** SQL CASE for line omzet — keep aligned across raw aggregation queries */
export const SQL_LINE_OMZET =
  'CASE WHEN tl."isBonusLine" THEN 0 ELSE tl."discountedUnitPrice" * tl.quantity END';

/** SQL CASE for line laba when Product join is available */
export const SQL_LINE_LABA =
  'CASE WHEN tl."isBonusLine" THEN 0 ELSE (tl."discountedUnitPrice" - p."hargaModal") * tl.quantity END';
