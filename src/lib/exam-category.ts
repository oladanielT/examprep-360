/** Trial behavior follows the selected exam category, never the account type. */
export function isProfessionalExam(category?: string | null): boolean {
  return category?.toUpperCase().includes("PROFESSIONAL") ?? false;
}
