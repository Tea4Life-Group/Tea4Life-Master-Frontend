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
import keycloak from "@/lib/keycloak";

interface RequireLoginDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function RequireLoginDialog({
  isOpen,
  onOpenChange,
  title = "Yêu cầu đăng nhập",
  description = "Bạn cần đăng nhập để sử dụng tính năng này. Bạn có muốn đăng nhập ngay không?",
}: RequireLoginDialogProps) {
  const handleLogin = () => {
    keycloak.login();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="font-sans bg-[#F8F5F0] border-2 border-[#1A4331]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#1A4331] font-bold text-xl">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#5c4033] font-medium mt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel className="border-2 border-[#1A4331] text-[#1A4331] hover:bg-[#1A4331] hover:text-white font-bold px-6 py-2 rounded-full transition-colors">
            Đóng
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogin}
            className="bg-[#1A4331] text-white hover:bg-[#8A9A7A] hover:text-[#1A4331] font-bold px-6 py-2 rounded-full border-2 border-[#1A4331] transition-colors"
          >
            Đăng Nhập
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
