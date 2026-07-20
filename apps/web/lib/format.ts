export const compact = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export const percent = (n: number, digits = 1) =>
  `${n.toFixed(digits)}%`;
