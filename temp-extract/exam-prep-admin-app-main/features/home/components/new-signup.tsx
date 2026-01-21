import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const signups = [
  {
    name: "Risa Pearson",
    time: "30 mins ago",
    badge: "Waec",
    badgeColor: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  {
    name: "Margaret D. Evans",
    time: "5 mins ago",
    badge: "Uni",
    badgeColor: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  },
  {
    name: "James T. O'Connor",
    time: "2 hours ago",
    badge: "Waec",
    badgeColor: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  {
    name: "Liam A. Thompson",
    time: "10 mins ago",
    badge: "Waec",
    badgeColor: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  {
    name: "Sophia R. Martinez",
    time: "1 hour ago",
    badge: "Waec",
    badgeColor: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
];

export default function NewSignups() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">New Sign ups</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {signups.map((signup, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-muted">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {signup.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {signup.time}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className={signup.badgeColor}>
                {signup.badge}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
