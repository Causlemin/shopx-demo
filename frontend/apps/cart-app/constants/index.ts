export function formatCurrency(amount: any) {
  //truncate the amount to 0 decimals
  //for every digit that is followed by 3 digits and a word boundary
  //add a comma
  amount = amount?.toFixed?.(2)?.replace?.(/(\d)(?=(\d{3})+\b)/g, "$1,");
  return amount
    ?.replace?.(/\./g, "#")
    .replace(/,/g, ".")
    ?.replace?.(/#/g, ",");
};

// packages/utils/routes.ts
export function cartPath(path: string) {
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/cart")
  ) {
    return `/cart${path}`;
  }

  return path;
}