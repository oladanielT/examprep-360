import PrimaryButton from "@/components/buttons/primary-button";
import { CustomSelect } from "@/components/custom/custom-select";
import { coursesTypes } from "@/lib/placehoder-data";



export default function SelectCourse() {
    return (
        <div className=" space-y-4">
            <CustomSelect label="Select Course"  options={coursesTypes}/>
            <PrimaryButton  title="Add Course" className=" max-w-full" />
        </div>
    )
}
