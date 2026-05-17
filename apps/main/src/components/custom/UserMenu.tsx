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
import { LogOut, MapPin, PackageSearch, UserCircle, ChevronDown } from "lucide-react";
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
          className="relative flex items-center gap-2.5 px-2 pr-3 h-10 rounded-xl hover:bg-[#F8F5F0] focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300"
        >
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-[#1A4331] to-[#2a5c47] flex items-center justify-center overflow-hidden ring-1 ring-[#1A4331]/10 shadow-sm">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[11px] font-bold text-white">
                {getNameInitials(user.name)}
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-[#1A4331] hidden lg:block max-w-[120px] truncate">
            {user.name || user.email}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#8A9A7A] hidden lg:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-xl border border-[#1A4331]/8 bg-white/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(26,67,49,0.12)] p-1"
        align="end"
        sideOffset={8}
        forceMount
      >
        <DropdownMenuLabel className="font-normal px-3 py-3 rounded-lg bg-[#F8F5F0]/60 mb-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-[#1A4331] to-[#2a5c47] flex items-center justify-center overflow-hidden shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-white">
                  {getNameInitials(user.name)}
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-bold text-[#1A4331] truncate">
                {user.name || "Người dùng"}
              </p>
              {user.email && (
                <p className="text-[11px] text-[#8A9A7A] truncate mt-0.5">
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <div className="space-y-0.5">
          <DropdownMenuItem
            onClick={() => navigate("/profile")}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-[#1A4331] font-medium text-sm focus:bg-[#F8F5F0] focus:text-[#1A4331] transition-colors"
          >
            <UserCircle className="mr-2.5 h-4 w-4 text-[#8A9A7A]" />
            <span>Thông tin cá nhân</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate("/profile/address")}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-[#1A4331] font-medium text-sm focus:bg-[#F8F5F0] focus:text-[#1A4331] transition-colors"
          >
            <MapPin className="mr-2.5 h-4 w-4 text-[#8A9A7A]" />
            <span>Địa chỉ</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate("/order")}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-[#1A4331] font-medium text-sm focus:bg-[#F8F5F0] focus:text-[#1A4331] transition-colors"
          >
            <PackageSearch className="mr-2.5 h-4 w-4 text-[#8A9A7A]" />
            <span>Đơn hàng của tôi</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-[#1A4331]/6 my-1" />
        
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer rounded-lg px-3 py-2.5 text-red-500 font-medium text-sm focus:bg-red-50 focus:text-red-600 transition-colors"
        >
          <LogOut className="mr-2.5 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
