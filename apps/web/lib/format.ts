export const compact = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export const percent = (n: number, digits = 1) =>
  `${n.toFixed(digits)}%`;

/** Pence to "£12" / "£0.45". */
export const formatGbp = (pence: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: pence % 100 === 0 ? 0 : 2,
  }).format(pence / 100);
