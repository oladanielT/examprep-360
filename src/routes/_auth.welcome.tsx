import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/global/logo";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

function Welcome() {
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
            <Link to="/register?user=secondary">
              <ItemContent>
                <ItemTitle className="text-lg font-medium text-[#101828]">
                  Junior promotional exam / 0'Level
                </ItemTitle>
                <ItemDescription className="text-base text-[#475467]">
                  Are you preparing for 0'level or junior promotional exams
                </ItemDescription>
              </ItemContent>
              <ItemMedia>
                <img
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
            <Link className="" to="/register?user=undergraduate">
              <ItemContent>
                <ItemTitle className="text-lg font-medium text-[#101828]">
                  Undergraduate
                </ItemTitle>
                <ItemDescription className="text-base text-[#475467]">
                  Are you an undergraduate?
                </ItemDescription>
              </ItemContent>
              <ItemMedia>
                <img
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

export const Route = createFileRoute("/_auth/welcome")({
  component: Welcome,
});
