import { Menu, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/useAuth";
import keycloak from "@/lib/keycloak";
import { getMediaUrl } from "@/lib/utils";

interface AdminTopbarProps {
  onMenuClick?: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { fullName, email, avatarUrl } = useAuth();
  const avatarSrc = getMediaUrl(avatarUrl);

  const displayName = fullName || email || "Admin";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return (
    <header className="h-14 border-b border-slate-200/80 bg-white sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 gap-3">
      {/* Left side: hamburger */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors cursor-pointer outline-none">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-semibold text-slate-700 leading-tight">
                  {displayName}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium">
                  Quản trị viên
                </p>
              </div>
              <Avatar className="h-8 w-8 border-2 border-emerald-100">
                <AvatarImage src={avatarSrc || undefined} />
                <AvatarFallback className="bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                {email && (
                  <p className="text-xs text-slate-500 truncate">{email}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-slate-600">
              <User className="mr-2 h-4 w-4" />
              Thông tin cá nhân
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

