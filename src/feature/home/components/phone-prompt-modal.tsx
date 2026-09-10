import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
import { useProfile, useUpdateProfile } from "@/feature/profile/hooks/useProfile";
import { toast } from "sonner";
import { Loader2, Phone } from "lucide-react";

export default function PhonePromptModal() {
  const { user: authUser } = useAuthStore();
  const { data: profileUser } = useProfile();
  const user = profileUser || authUser;
  
  const updateProfile = useUpdateProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    // Show modal if user logged in via Google and has no phone number.
    // Also ensuring we only trigger it once per session to avoid annoying the user.
    if (user && !user.phone && user.oauthProvider === "GOOGLE" && !hasPrompted) {
      setIsOpen(true);
      setHasPrompted(true);
    }
  }, [user, hasPrompted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 5) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      await updateProfile.mutateAsync({ phone });
      toast.success("Phone number updated successfully!");
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update phone number");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-accent" />
            </div>
            <DialogTitle className="text-center text-xl">Complete Your Profile</DialogTitle>
            <DialogDescription className="text-center mt-2">
              Please provide your phone number so we can send you important updates regarding your exams.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <Input
              type="tel"
              placeholder="+2348000000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-center text-lg h-12"
              autoFocus
            />
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2 space-x-0 sm:space-x-0">
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-white"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save Phone Number
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Skip for now
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
