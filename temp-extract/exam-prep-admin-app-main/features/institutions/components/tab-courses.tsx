'use client'
import { AddNewButton } from "@/components/buttons/add-new-button";
import { SmallStatsCard } from "@/components/cards/small-stats-card";
import { CustomDialog } from "@/components/custom/custom-dialog";
import { useState } from "react";
import SelectCourse from "./select-course";
import SelectCourseRadioGroup from "./select-course-radio-group";


export default function TabCourses() {
    const [open, setOpen] = useState(false)
    const [changeDialogContent, setDialogChange] = useState(false)
    const dialogHandler = () => {
        setDialogChange(true)
    }
    return (
        <div className="grid grid-cols-3 gap-5">
            <CustomDialog trigger={<AddNewButton
                label="Add New Course"
                onClick={() => console.log("Adding course")}
            />} open={open} onOpenChange={(open) => setOpen(open)} title="Add Course">
                {changeDialogContent ?
                    <SelectCourse /> : <SelectCourseRadioGroup onClick={dialogHandler} />}

            </CustomDialog>

            <SmallStatsCard
                amountClassName=" text-lg"
                title="UNIBEN"
                amount={"Mat 101"}
            />
            <SmallStatsCard
                amountClassName=" text-lg"
                title="UNIBEN"
                amount={"Mat 401"}
            />
        </div>
    );
};