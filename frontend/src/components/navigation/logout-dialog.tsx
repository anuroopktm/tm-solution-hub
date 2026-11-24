import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLogout } from "@/hooks/use-logout";
import { BRAND_CONFIG } from "@/config/brand.config";
import type { AxiosError } from "axios";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const handleConfirmLogout = () => {
    toast.promise(logoutMutation.mutateAsync(), {
      loading: "Logging out...",
      success: () => {
        onOpenChange(false);
        navigate("/login", { replace: true });
        return "Logged out successfully";
      },
      error: (error: AxiosError) => {
        onOpenChange(false);
        navigate("/login", { replace: true });
        return error.message || "Logged out (session cleared)";
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Log out</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to log out of your account? You will need to
            sign in again to access {BRAND_CONFIG.fullName}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirmLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "Logging out..." : "Log out"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
