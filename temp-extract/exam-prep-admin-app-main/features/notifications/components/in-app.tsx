import {
  InputField,
  TextareaField,
} from "@/components/custom/custom-form-field";
import { CustomSelect } from "@/components/custom/custom-select";
import { coursesTypes, examTypes } from "@/lib/placehoder-data";
import { Search } from "lucide-react";

const InApp = () => {
  return (
    <section className=" space-y-5">
      <div className="flex gap-5 ">
        <CustomSelect
          options={examTypes}
          placeholder="Select "
          label="Select User"
        />

        <InputField
          icon={<Search className=" absolute right-5 top-9 text-gray-400" />}
          placeholder="Enter Name"
          containerClassName="relative "
          label="Search User"
        />
      </div>
      <div className="flex gap-5 ">
        <CustomSelect
          options={examTypes}
          placeholder="Select "
          label="Select Exam"
        />
        <CustomSelect
          options={examTypes}
          placeholder="Select"
          label="Select Subject"
        />
      </div>
      <div className="flex gap-5 ">
        <CustomSelect
          options={examTypes}
          placeholder="Select "
          label="Select Tutorial"
        />
        <CustomSelect
          options={coursesTypes}
          placeholder="select "
          label="Select COURSE"
        />
      </div>
      <div className="flex gap-5 ">
        <CustomSelect
          options={examTypes}
          placeholder="Select  "
          label="Select LEVEL"
        />
        <CustomSelect
          options={examTypes}
          placeholder="Select"
          label="Select active/ inactive users"
        />
      </div>
      <TextareaField
        placeholder="Type Notification"
        className=" min-h-40 placeholder:text-black rounded-2xl max-w-3xl w-full bg-[#EDEDED]"
      />
    </section>
  );
};

export default InApp;
