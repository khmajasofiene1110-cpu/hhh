/** Display amounts in Tunisian dinar style (mock app). */
export function formatMoneyDt(value: number): string {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DT`;
}
