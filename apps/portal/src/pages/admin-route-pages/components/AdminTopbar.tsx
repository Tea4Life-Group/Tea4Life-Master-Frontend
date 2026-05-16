import { Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/useAuth";

interface AdminTopbarProps {
  onMenuClick?: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { fullName, email, avatarUrl } = useAuth();


  const displayName = fullName || email || "Admin";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-14 border-b border-slate-200/80 bg-white sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 gap-3">
      {/* Left side: hamburger + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>


      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 shrink-0">


        {/* User Profile */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-semibold text-slate-700 leading-tight">
              {displayName}
            </p>
            <p className="text-[10px] text-emerald-600 font-medium">
              Quản trị viên
            </p>
          </div>
          <Avatar className="h-8 w-8 border-2 border-emerald-100">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-emerald-50 text-emerald-700 text-[11px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
