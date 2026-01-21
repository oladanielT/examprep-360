import React from "react";
import { Student } from "../../api/get-students";

interface DetailsProps {
  student: Student;
}

const Details = ({ student }: DetailsProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className=" grid grid-cols-3 gap-y-5">
      <div className=" space-y-2">
        <h6 className="text-[#7C8FAC] text-sm ">User name</h6>
        <span>{student.fullName}</span>
      </div>
      <div className=" space-y-2">
        <h6 className="text-[#7C8FAC] text-sm ">Email address</h6>
        <span>{student.email}</span>
      </div>
      <div className=" space-y-2">
        <h6 className="text-[#7C8FAC] text-sm ">Phone number</h6>
        <span>{student.phone || "N/A"}</span>
      </div>
      <div className=" space-y-2">
        <h6 className="text-[#7C8FAC] text-sm ">Date of Birth</h6>
        <span>{student.dateOfBirth ? formatDate(student.dateOfBirth) : "N/A"}</span>
      </div>
      <div className=" space-y-2">
        <h6 className="text-[#7C8FAC] text-sm ">Academic Level</h6>
        <span>{student.academicLevel || "N/A"}</span>
      </div>
      <div className=" space-y-2">
        <h6 className="text-[#7C8FAC] text-sm ">Exam Type</h6>
        <span>{student.examType || "N/A"}</span>
      </div>
      <div className=" space-y-2">
        <h6 className="text-[#7C8FAC] text-sm ">Date Joined</h6>
        <span>{formatDate(student.createdAt)}</span>
      </div>
    </div>
  );
};

export default Details;