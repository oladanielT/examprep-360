import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const examSearchSchema = z.object({
  examId: z.string().optional(),
});

function ExamPage() {
  const { examId } = Route.useSearch();

  return (
    <div className="py-10">
      <h1 className="text-2xl font-semibold mb-4">Exam</h1>
      {examId ? (
        <p>Loading exam: {examId}</p>
      ) : (
        <p>Loading practice session...</p>
      )}
      {/* TODO: Implement exam taking UI */}
    </div>
  );
}

export const Route = createFileRoute("/_user/tests/exam")({
  component: ExamPage,
  validateSearch: examSearchSchema,
});
