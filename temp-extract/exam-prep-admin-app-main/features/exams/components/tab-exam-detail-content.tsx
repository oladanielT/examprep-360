import Image from "next/image";
import React from "react";
import { ExamType } from "../api/exam-types/get-all-exam-types";
import { Badge } from "@/components/ui/badge";

interface TabExamDetailContentProps {
  examType: ExamType;
}

const TabExamDetailContent = ({ examType }: TabExamDetailContentProps) => {
  return (
    <div className=" grid grid-cols-3 gap-y-5">
      <div className=" space-y-2">
        <h6 className="text-[#7C8FAC] text-sm ">Name</h6>
        <span className="font-medium">{examType.name}</span>
      </div>
      <div className=" space-y-2">
        <h6 className="text-[#7C8FAC] text-sm ">Category</h6>
        <Badge variant="outline">{examType.category}</Badge>
      </div>
      {examType.imageUrl && (
        <div className="flex gap-2">
          <div className=" space-y-2">
            <h6 className="text-[#7C8FAC] text-sm ">Image</h6>
            <span className="text-sm text-muted-foreground">View image →</span>
          </div>
          <Image
            src={examType.imageUrl}
            width={60}
            height={60}
            className="size-15 rounded object-cover"
            alt={`${examType.name} image`}
          />
        </div>
      )}
      <div className=" space-y-2">
        <h6 className="text-[#7C8FAC] text-sm ">Created At</h6>
        <span className="text-sm">{new Date(examType.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}</span>
      </div>
      <div className=" space-y-2">
        <h6 className="text-[#7C8FAC] text-sm ">Last Updated</h6>
        <span className="text-sm">{new Date(examType.updatedAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}</span>
      </div>
    </div>
  );
};

export default TabExamDetailContent;
