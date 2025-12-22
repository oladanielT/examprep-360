import React from "react";
import { Progress } from "@/components/ui/progress";
import { GoBack } from "@/components/global/go-back";
import { Logo } from "@/components/global/logo";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import PrimaryButton from "@/components/buttons/primary-button";
import Image from "next/image";
import { ArrowRight, ChevronDown, Dot, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function SummaryPage() {
  return (
    <section className="space-y-5">
      <Progress value={33} />
      <GoBack backTo="/welcome" />
      <div className="flex flex-col gap-10 items-center mt-5 max-w-md mx-auto">
        <Logo />
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter text-[#101828]">
            Get access to the exams you need
          </h2>
        </div>
        <div className="bg-[#FFF0B3]/30 rounded-2xl p-7 w-full">
          <div className="flex gap-4 w-full">
            <div className="shrink-0">
              <Image src="/auth/file.svg" alt="Image" width={104} height={60} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">WAEC</h3>
                <p className="text-lg font-semibold">25,000</p>
              </div>
              <div className="flex items-center gap-1 mb-6 text-sm text-gray-600">
                <span>60 Days</span>
                <Dot className="text-accent" />
                <span className="flex items-center gap-1">
                  6 Subjects
                  <ChevronDown className="w-4 h-4 text-accent" />
                </span>
              </div>
              <ul className="space-y-2 mb-8 bg-white p-4 rounded-xl">
                {[
                  "English Language",
                  "Mathematics",
                  "Biology",
                  "Chemistry",
                  "Physics",
                  "Literature",
                ].map((subject) => (
                  <li
                    key={subject}
                    className="flex text-sm items-center gap-2 text-gray-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#999999]"></span>
                    {subject}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <PrimaryButton
            className="bg-accent/80 hover:bg-accent/90 text-lg text-white"
            title="Continue Payment"
          />
          <PrimaryButton
            className="bg-transparent font-semibold mt-2 hover:bg-transparent hover:underline text-lg text-[#595959]"
            title="Start Free Trial"
          />
        </div>
        <div className="w-full">
          <p className="font-semibold text-[#595959] text-base text-center">
            Or Use
          </p>
          <div className="mt-10">
            <Label className="mb-2 uppercase text-[#6D6D6D]">
              License code (optional)
            </Label>
            <InputGroup className="rounded-4xl h-14">
              <InputGroupInput placeholder="••••••••" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Direction"
                  title="Right Direction Arrow"
                  size="icon-sm"
                  className="bg-accent"
                  variant="default"
                >
                  <ArrowRight className="size-6!" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
        <PrimaryButton
          className="bg-transparent font-semibold mt-2 hover:bg-transparent decoration-accent hover:underline text-lg text-[#595959]"
          title="Start Free Trial"
        >
          <div className="flex items-center gap-2 text-accent">
            <Plus />
            <span>Add Another Exam</span>
          </div>
        </PrimaryButton>
      </div>
    </section>
  );
}
