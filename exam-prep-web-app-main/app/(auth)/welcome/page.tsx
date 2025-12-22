import { Logo } from "@/components/global/logo";
import React from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <section>
      <Logo />
      <div className="mt-10 space-y-10">
        <h2 className="text-2xl font-bold tracking-tighter">
          Select Your Preferred Option
        </h2>
        <div className="flex w-full flex-col gap-4">
          <Item
            className="pb-0 group [a]:hover:bg-warning"
            variant="outline"
            asChild
          >
            <Link href="/register?user=secondary">
              <ItemContent>
                <ItemTitle className="text-lg font-medium text-[#101828]">
                  Junior promotional exam / 0’Level
                </ItemTitle>
                <ItemDescription className="text-base text-[#475467]">
                  Are you preparing for 0’level or junior promotional exams
                </ItemDescription>
              </ItemContent>
              <ItemMedia>
                <Image
                  src="/auth/welcome-1.svg"
                  className="object-cover h-30"
                  alt="Image"
                  width={104}
                  height={60}
                />
              </ItemMedia>
            </Link>
          </Item>
          <Item
            className="pb-0 group [a]:hover:bg-warning"
            variant="outline"
            asChild
          >
            <Link className="" href="/register?user=undergraduate">
              <ItemContent>
                <ItemTitle className="text-lg font-medium text-[#101828]">
                  Undergraduate
                </ItemTitle>
                <ItemDescription className="text-base text-[#475467]">
                  Are you an undergraduate?
                </ItemDescription>
              </ItemContent>
              <ItemMedia>
                <Image
                  src="/auth/welcome-2.svg"
                  className="h-30"
                  alt="Image"
                  width={104}
                  height={60}
                />
              </ItemMedia>
            </Link>
          </Item>
        </div>
      </div>
    </section>
  );
}
