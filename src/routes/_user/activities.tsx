import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Completed from "@/feature/activities/components/completed";
import Paused from "@/feature/activities/components/paused";
import Reported from "@/feature/activities/components/reported";
import Bookmarked from "@/feature/activities/components/bookmarked";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

function ActivitiesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your activities and track your progress
            </p>
          </div>
        </div>
      </div>

      {/* Content with Sidebar */}
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="flex gap-16">
          {/* Sidebar */}
          <Tabs defaultValue="paused" className="contents">
            <div className="w-72 shrink-0 mt-20">
              <TabsList className="flex flex-col h-fit bg-transparent p-0 gap-3 w-full">
                <TabsTrigger
                  value="paused"
                  className="w-full justify-start px-8 py-4 text-left text-gray-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-l-4 data-[state=active]:border-[#F04F54] data-[state=active]:shadow-none rounded-none font-medium text-base hover:text-gray-900 transition-colors"
                >
                  Paused Exams
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="w-full justify-start px-8 py-4 text-left text-gray-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-l-4 data-[state=active]:border-[#F04F54] data-[state=active]:shadow-none rounded-none font-medium text-base hover:text-gray-900 transition-colors"
                >
                  Completed Exams
                </TabsTrigger>
                <TabsTrigger
                  value="bookmarked"
                  className="w-full justify-start px-8 py-4 text-left text-gray-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-l-4 data-[state=active]:border-[#F04F54] data-[state=active]:shadow-none rounded-none font-medium text-base hover:text-gray-900 transition-colors"
                >
                  Bookmarked Questions
                </TabsTrigger>
                <TabsTrigger
                  value="reported"
                  className="w-full justify-start px-8 py-4 text-left text-gray-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-l-4 data-[state=active]:border-[#F04F54] data-[state=active]:shadow-none rounded-none font-medium text-base hover:text-gray-900 transition-colors"
                >
                  Reported Questions
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              <TabsContent
                value="paused"
                className="mt-0 data-[state=inactive]:hidden"
              >
                <Paused />
              </TabsContent>

              <TabsContent
                value="completed"
                className="mt-0 data-[state=inactive]:hidden"
              >
                <Completed />
              </TabsContent>

              <TabsContent
                value="bookmarked"
                className="mt-0 data-[state=inactive]:hidden"
              >
                <Bookmarked />
              </TabsContent>

              <TabsContent
                value="reported"
                className="mt-0 data-[state=inactive]:hidden"
              >
                <Reported />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user/activities")({
  component: ActivitiesPage,
});
