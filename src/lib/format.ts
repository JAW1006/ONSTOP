/** 원화 표기(레거시 won: "₩" + 천 단위 쉼표) */
export function formatKrw(n: number): string {
  return `₩${n.toLocaleString("en-US")}`;
}
