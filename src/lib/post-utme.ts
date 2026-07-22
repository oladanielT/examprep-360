import type { Subject } from "@/api/types";

// Post-UTME subjects are per-institution and only carry the school inside their
// free-text name (there is no structured `school` field on Subject yet). This
// module parses the school out so the picker can group tiles by institution.
//
// Order matters: multi-word / most-specific names come first so a bare token
// never wins over a longer institution name. Anything unmatched lands in
// "Other" — the list is never dropped, only ungrouped.
const SCHOOLS: { label: string; match: RegExp }[] = [
  { label: "University of Nigeria Nsukka", match: /university of nigeria(\s+nsukka)?/i },
  { label: "Ahmadu Bello University", match: /ahmadu bello university/i },
  { label: "UNIBADAN", match: /\bunibadan\b/i },
  { label: "UNILORIN", match: /\bunilorin\b/i },
  { label: "UNIPORT", match: /\buniport\b/i },
  { label: "UNIZIK", match: /\bunizik\b/i },
  { label: "UNIBEN", match: /\buniben\b/i },
  { label: "UNILAG", match: /\bunilag\b/i },
  { label: "OAU", match: /\boau\b/i },
];

const OTHER = "Other";

// Parse a subject name like "Post UTME UNIBADAN Medical Sciences" into its
// school ("UNIBADAN") and the shorter stream label shown on the tile
// ("Medical Sciences"). Unknown schools return { school: "Other" } with the
// full name as the label so the tile still reads sensibly.
export function parseSchool(name: string): { school: string; label: string } {
  const entry = SCHOOLS.find((s) => s.match.test(name));
  if (!entry) return { school: OTHER, label: name.trim() };

  const stream = name
    .replace(/post[\s-]*utme/i, "")
    .replace(entry.match, "")
    .replace(/\s+/g, " ")
    .trim();

  // e.g. "Post UTME UNILORIN" leaves no stream — the tile covers the whole
  // institution, so label it "General" under its school header.
  return { school: entry.label, label: stream || "General" };
}

export interface SchoolGroup {
  school: string;
  items: { subject: Subject; label: string }[];
}

// Group subjects by school, preserving SCHOOLS order with "Other" last.
export function groupSubjectsBySchool(subjects: Subject[]): SchoolGroup[] {
  const order = [...SCHOOLS.map((s) => s.label), OTHER];
  const bySchool = new Map<string, SchoolGroup>();

  for (const subject of subjects) {
    const { school, label } = parseSchool(subject.name);
    let group = bySchool.get(school);
    if (!group) {
      group = { school, items: [] };
      bySchool.set(school, group);
    }
    group.items.push({ subject, label });
  }

  return order
    .filter((label) => bySchool.has(label))
    .map((label) => bySchool.get(label)!);
}

// True when grouping is actually meaningful — i.e. most subjects resolve to a
// known institution and there's more than one. Keeps ordinary subject lists
// (JAMB "Mathematics"/"English", which all fall into "Other") rendering flat.
export function shouldGroupBySchool(subjects: Subject[]): boolean {
  if (subjects.length < 2) return false;
  const known = subjects.filter((s) => parseSchool(s.name).school !== OTHER);
  if (known.length < subjects.length / 2) return false;
  const schools = new Set(known.map((s) => parseSchool(s.name).school));
  return schools.size > 1;
}
