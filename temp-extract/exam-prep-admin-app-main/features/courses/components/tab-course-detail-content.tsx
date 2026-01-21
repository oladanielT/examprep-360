import Image from "next/image";
import React from "react";
import { Course } from "../api/course/get-courses";

interface TabCourseDetailContentProps {
  course: Course;
}

const TabCourseDetailContent = ({ course }: TabCourseDetailContentProps) => {
  return (
    <div className="grid grid-cols-3 gap-y-5">
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Course Name</h6>
        <span>{course.name}</span>
      </div>
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Course Code</h6>
        <span>{course.code}</span>
      </div>
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Level</h6>
        <span>{course.level}</span>
      </div>
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Institution</h6>
        <span>{course.department.university.name}</span>
      </div>
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Institution Type</h6>
        <span>{course.department.university.type}</span>
      </div>
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Faculty</h6>
        <span>{course.department.faculty.name}</span>
      </div>
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Department</h6>
        <span>{course.department.name}</span>
      </div>
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Modules Count</h6>
        <span>{course.modules?.length || 0}</span>
      </div>
      <div className="space-y-2">
        <h6 className="text-[#7C8FAC] text-sm">Created At</h6>
        <span>{new Date(course.createdAt).toLocaleDateString()}</span>
      </div>
      {course.department.university.imageUrl && (
        <div className="flex gap-2 col-span-3">
          <div className="space-y-2">
            <h6 className="text-[#7C8FAC] text-sm">Institution Image</h6>
          </div>
          <Image
            src={course.department.university.imageUrl}
            width={80}
            height={80}
            className="size-15 object-contain"
            alt={`${course.department.university.name} image`}
          />
        </div>
      )}
    </div>
  );
};

export default TabCourseDetailContent;
