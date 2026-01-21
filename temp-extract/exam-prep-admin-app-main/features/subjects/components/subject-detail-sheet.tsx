"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Loader2, Edit, Plus, BookOpen, ExternalLink } from "lucide-react";
import {
  useSubjects,
  Subject,
  SubjectsResponse,
} from "@/features/subjects/api/subject/get-subjects";
import { TopicCollapsibleItem } from "./topic-collapsible-item";
import { EditSubjectDialog } from "./edit-subject-dialog";
import { AddTopicDialog } from "./add-topic-dialog";
import { Topic } from "../api/topic/get-topics";

interface SubjectDetailSheetProps {
  subject: Subject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export function SubjectDetailSheet({
  subject,
  open,
  onOpenChange,
  onRefresh,
}: SubjectDetailSheetProps) {
  const router = useRouter();

  // Fetch the latest subject data to ensure name updates are reflected
  const {
    data: subjectsData,
    isLoading,
    refetch: refetchSubject,
  } = useSubjects({
    examTypeId: subject?.examTypeId || "",
    page: 1,
    limit: 100,
    queryConfig: {
      enabled: open && !!subject?.id,
    },
  }) as {
    data: SubjectsResponse | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  // Find the current subject from the fetched data (includes nested topics and subtopics)
  const currentSubject =
    subjectsData?.data?.find((s: Subject) => s.id === subject?.id) || subject;

  // Use the nested topics from the subject response (no extra API call needed!)
  const topics = currentSubject?.topics || [];

  // Refetch subject when sheet opens or subject changes
  useEffect(() => {
    if (open && subject?.id) {
      refetchSubject();
    }
  }, [open, subject?.id, refetchSubject]);

  const handleRefreshAll = () => {
    refetchSubject();
    onRefresh();
  };

  const handleOpenFullView = () => {
    onOpenChange(false);
    router.push(`/subjects/${currentSubject?.id}`);
  };

  if (!currentSubject) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
        <div className="h-full overflow-y-auto px-6 py-6">
          <SheetHeader className="space-y-3 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  {currentSubject.name}
                </SheetTitle>
                <div className="flex items-center gap-2">
                  {currentSubject.year && (
                    <Badge variant="secondary" className="font-normal">
                      Year {currentSubject.year}
                    </Badge>
                  )}
                  {currentSubject.paper && (
                    <Badge variant="outline" className="font-normal">
                      {currentSubject.paper}
                    </Badge>
                  )}
                  <Badge variant="default" className="font-normal">
                    {topics.length} {topics.length === 1 ? "Topic" : "Topics"}
                  </Badge>
                </div>
              </div>
              <EditSubjectDialog
                subject={currentSubject}
                onSuccess={handleRefreshAll}
              >
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  <Edit className="h-4 w-4" />
                  Edit Subject
                </Button>
              </EditSubjectDialog>
            </div>
            <Separator />
            <SheetDescription className="text-left">
              Manage topics and subtopics for this subject. Topics help organize
              the curriculum structure.
            </SheetDescription>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={handleOpenFullView}
            >
              <ExternalLink className="h-4 w-4" />
              Open Full View
            </Button>
          </SheetHeader>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg">
              <div>
                <h3 className="font-semibold">Topics</h3>
                <p className="text-sm text-muted-foreground">
                  {topics.length === 0
                    ? "No topics yet"
                    : `${topics.length} topic${
                        topics.length === 1 ? "" : "s"
                      } in this subject`}
                </p>
              </div>
              <AddTopicDialog
                subjectId={currentSubject.id}
                onSuccess={handleRefreshAll}
              >
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Topic
                </Button>
              </AddTopicDialog>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading subject details...
                </p>
              </div>
            ) : !topics.length ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 border-2 border-dashed rounded-lg">
                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                <div className="text-center space-y-1">
                  <p className="font-medium text-muted-foreground">
                    No topics added yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Get started by adding your first topic
                  </p>
                </div>
                <AddTopicDialog
                  subjectId={currentSubject.id}
                  onSuccess={handleRefreshAll}
                >
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Topic
                  </Button>
                </AddTopicDialog>
              </div>
            ) : (
              <div className="space-y-3">
                {topics.map((topic: Topic) => (
                  <TopicCollapsibleItem
                    key={topic.id}
                    topic={topic}
                    onRefresh={handleRefreshAll}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
