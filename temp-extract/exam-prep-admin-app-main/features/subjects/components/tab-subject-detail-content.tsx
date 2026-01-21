import Image from "next/image";
import React from "react";
import { Subject } from "../api/subject/get-subjects";

interface TabSubjectDetailContentProps {
  subject: Subject;
}

const TabSubjectDetailContent = ({ subject }: TabSubjectDetailContentProps) => {
  return (
    <div className="grid grid-cols-3 gap-y-5">
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Subject Name</h6>
        <span>{subject.name}</span>
      </div>
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Exam Type</h6>
        <span>{subject.examType?.name || "N/A"}</span>
      </div>
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Year</h6>
        <span>{subject.year}</span>
      </div>
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Paper</h6>
        <span>{subject.paper || "N/A"}</span>
      </div>
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Topics Count</h6>
        <span>{subject.topics?.length || 0}</span>
      </div>
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Created At</h6>
        <span>{new Date(subject.createdAt).toLocaleDateString()}</span>
      </div>
      {subject.examType?.imageUrl && (
        <div className="flex gap-2 col-span-3">
          <div className="space-y-2">
            <h6 className="text-[#7C8FAC] text-sm">Exam Image</h6>
          </div>
          <Image
            src={subject.examType.imageUrl}
            width={80}
            height={80}
            className="size-15 object-contain"
            alt={`${subject.examType.name} image`}
          />
        </div>
      )}
    </div>
  );
};

export default TabSubjectDetailContent;
