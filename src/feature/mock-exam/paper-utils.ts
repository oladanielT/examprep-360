import type { AvailableExam } from "@/api/types/exam.types";

// A single paper bucket: all mocks that resolve to the same paper number
// for a given subject. The runner will pick one at random per bucket.
export interface PaperBucket {
  paperNumber: number;
  paperName: string; // human label like "Paper 1"
  mocks: AvailableExam[];
}

// Parse paper number from a mock name. Returns 1 when no "Paper N" is found
// so legacy JAMB-style single-paper mocks still work.
export function parsePaperNumber(name: string | undefined | null): number {
  if (!name) return 1;
  const match = name.match(/paper\s*(\d+)/i);
  if (match) {
    const n = parseInt(match[1], 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return 1;
}

// Group a subject's mocks into per-paper buckets, sorted by paper number asc.
export function groupMocksByPaper(mocks: AvailableExam[]): PaperBucket[] {
  const byPaper = new Map<number, AvailableExam[]>();
  for (const mock of mocks) {
    const paperNumber = parsePaperNumber(mock.name);
    const arr = byPaper.get(paperNumber) ?? [];
    arr.push(mock);
    byPaper.set(paperNumber, arr);
  }

  return Array.from(byPaper.entries())
    .sort(([a], [b]) => a - b)
    .map(([paperNumber, bucketMocks]) => ({
      paperNumber,
      paperName: `Paper ${paperNumber}`,
      mocks: bucketMocks,
    }));
}

// Pick one mock per bucket at random. Stable for the lifetime of the array
// reference — caller should memoize on `mocks.length` to avoid re-rolling
// every render.
export function pickRandomMockPerBucket(
  buckets: PaperBucket[]
): Array<{ paperNumber: number; paperName: string; mock: AvailableExam }> {
  return buckets.map((bucket) => ({
    paperNumber: bucket.paperNumber,
    paperName: bucket.paperName,
    mock: bucket.mocks[Math.floor(Math.random() * bucket.mocks.length)],
  }));
}

// True when at least one subject's mocks span more than one paper number.
// Drives whether the setup UI shows the paper-pill row and the "Papers"
// summary column.
export function hasMultiplePapers(buckets: PaperBucket[]): boolean {
  return buckets.length > 1;
}
