import { Card } from "@/components/ui/card";
import { UsersRound } from "lucide-react";
import React from "react";

const HomeStatsSmallCards = () => {
  return (
    <section className="grid grid-cols-3 mt-7 gap-4">
      {users.map((item, idx) => (
        <Card key={idx} className="p-4 flex-row gap-4">
          <div className="bg-[#1CB454]/30 text-[#1CB454] size-12 rounded-md flex items-center justify-center">
            <UsersRound />
          </div>
          <div>
            <h2 className="text-gray-900 font-medium text-sm">{item}</h2>
            <p className="text-2xl font-semibold text-gray-900">2,000</p>
          </div>
        </Card>
      ))}
    </section>
  );
};

export default HomeStatsSmallCards;

const users = ["New Users", "Inactive Users", "Suspected Accounts"];
