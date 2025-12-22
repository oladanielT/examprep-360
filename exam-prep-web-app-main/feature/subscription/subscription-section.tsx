import React from "react";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

import Link from "next/link";
import { paths } from "@/paths";
import Image from "next/image";

export const SubscriptionSection = () => {
  return (
    <section>
      <section className="py-10 flex gap-20">
        <Item className="h-fit bg-[#FFF0B333] w-80">
          <ItemContent>
            <ItemTitle className="text-lg font-semibold">WAEC</ItemTitle>
            <ItemDescription>6 Subjects</ItemDescription>
          </ItemContent>
          <ItemMedia className="w-24 h-20" variant="image">
            <Image
              src="/svg/note.svg"
              alt=""
              width={32}
              height={32}
              className="w-full"
            />
          </ItemMedia>
        </Item>
      </section>
    </section>
  );
};
