import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function SubscriptionTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [daysLeft, setDaysLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTime = () => {
      const end = new Date(endDate);
      const now = new Date();
      if (now > end) {
        setTimeLeft("Expired");
        setDaysLeft(0);
        return;
      }
      
      const total = end.getTime() - now.getTime();
      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else {
        const minutes = Math.floor((total / 1000 / 60) % 60);
        setTimeLeft(`${hours}h ${minutes}m left`);
      }
      setDaysLeft(days);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (timeLeft === "Expired" || !timeLeft) return null;

  let colorClass = "bg-emerald-500";
  if (daysLeft < 1) {
    colorClass = "bg-red-500";
  } else if (daysLeft <= 7) {
    colorClass = "bg-orange-500";
  }

  return (
    <div
      className={`absolute top-0 right-0 pl-3 pr-3 py-1 text-[10px] sm:text-xs font-bold text-white shadow-md flex items-center gap-1.5 ${colorClass}`}
      style={{
        clipPath: "polygon(12px 0, 100% 0, 100% 100%, 0 100%)",
        borderTopRightRadius: "0.75rem",
      }}
    >
      <Clock className="w-3 h-3" />
      {timeLeft}
    </div>
  );
}
