import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, MapPin, PackageSearch, UserCircle } from "lucide-react";
import { getNameInitials } from "@/lib/utils";
import keycloak from "@/lib/keycloak";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const navigate = useNavigate();
  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex items-center gap-2 px-2 rounded-none hover:bg-[#8A9A7A]/10 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <div className="h-8 w-8 bg-[#F8F5F0] flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-[#1A4331]">
                {getNameInitials(user.name)}
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-[#1A4331] hidden lg:block uppercase tracking-wide">
            {user.name || user.email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 rounded-none border-2 border-[#1A4331] bg-[#F8F5F0] shadow-[2px_2px_0px_0px_#1A4331] p-0"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal px-3 py-2 bg-[#1A4331]/5">
          <div className="flex flex-col space-y-0.5">
            <p className="text-xs font-bold leading-none text-[#1A4331]">
              {user.name || "Người dùng"}
            </p>
            {user.email && (
              <p className="text-[10px] leading-none text-[#8A9A7A] mt-0.5">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#1A4331]/15 h-[2px] m-0" />
        <div className="p-1">
          <DropdownMenuItem
            onClick={() => navigate("/profile")}
            className="cursor-pointer rounded-none px-2.5 py-1.5 text-[#1A4331] font-medium text-xs focus:bg-[#1A4331] focus:text-[#F8F5F0] transition-colors"
          >
            <UserCircle className="mr-1.5 h-3.5 w-3.5" />
            <span>Thông tin cá nhân</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate("/profile/address")}
            className="cursor-pointer rounded-none px-2.5 py-1.5 text-[#1A4331] font-medium text-xs focus:bg-[#1A4331] focus:text-[#F8F5F0] transition-colors"
          >
            <MapPin className="mr-1.5 h-3.5 w-3.5" />
            <span>Địa chỉ</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate("/order")}
            className="cursor-pointer rounded-none px-2.5 py-1.5 text-[#1A4331] font-medium text-xs focus:bg-[#1A4331] focus:text-[#F8F5F0] transition-colors"
          >
            <PackageSearch className="mr-1.5 h-3.5 w-3.5" />
            <span>Đơn hàng của tôi</span>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="bg-[#1A4331]/15 h-[2px] m-0" />
        <div className="p-1">
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer rounded-none px-2.5 py-1.5 text-red-600 font-medium text-xs focus:bg-red-600 focus:text-white transition-colors"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            <span>Đăng xuất</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
