import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/custom/UserMenu";
import { RequireLoginDialog } from "@/components/custom/RequireLoginDialog";
import { useAuth } from "@/features/auth/useAuth";
import { getMediaUrl } from "@/lib/utils";
import keycloak from "@/lib/keycloak";
import {
  ShoppingCart,
  Store,
  UserCircle,
  LogOut,
  ShoppingBag,
  Home,
  Newspaper,
  ChevronRight,
  Leaf,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/features/store";
import { fetchCart, clearLastAction } from "@/features/cart/cartSlice";

const navLinks = [
  { name: "Trang chủ", href: "/", icon: Home, description: "Về trang chủ" },
  {
    name: "Thực đơn",
    href: "/shop",
    icon: ShoppingBag,
    isPrimary: true,
    description: "Khám phá menu",
  },
  {
    name: "Tin tức",
    href: "/news",
    icon: Newspaper,
    description: "Đọc tin mới",
  },
  {
    name: "Cửa hàng",
    href: "/places",
    icon: Store,
    isSecondary: true,
    description: "Tìm cửa hàng",
  },
];

export default function Header() {
  const dispatch = useAppDispatch();
  const { cart, lastAction } = useAppSelector((state) => state.cart);
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const bounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isAuthenticated, fullName, email, avatarUrl, initialized } =
    useAuth();

  // Scroll detection for shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (lastAction.type) {
      const type = lastAction.type;

      // Use setTimeout to avoid synchronous cascading renders
      const timer = setTimeout(() => {
        if (type === "add") {
          setIsBouncing(true);
        }

        const messages = {
          add: "+ Đã thêm vào giỏ",
          remove: "- Đã xóa món",
          clear: "× Đã làm trống giỏ",
          update: "✓ Đã cập nhật",
        };

        setBubbleMessage(messages[type] || null);
      }, 0);

      if (bounceTimeout.current) clearTimeout(bounceTimeout.current);
      bounceTimeout.current = setTimeout(() => {
        setIsBouncing(false);
        setBubbleMessage(null);
        dispatch(clearLastAction());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [lastAction.timestamp, lastAction.type, dispatch]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogin = useCallback(() => keycloak.login(), []);
  const handleLogout = useCallback(
    () => keycloak.logout({ redirectUri: window.location.origin }),
    []
  );

  const isActivePath = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(26,67,49,0.08),0_8px_24px_rgba(26,67,49,0.04)]"
            : "bg-white/95 backdrop-blur-md"
        }`}
        style={{
          borderBottom: scrolled
            ? "1px solid rgba(26,67,49,0.06)"
            : "1px solid rgba(26,67,49,0.08)",
        }}
      >
        {/* Decorative top accent line */}
        <div className="h-[2px] bg-linear-to-r from-transparent via-[#D2A676] to-transparent opacity-60" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between gap-4">
            {/* ──── Logo Section ──── */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="relative">
                {/* Glow ring on hover */}
                <div className="absolute -inset-2 rounded-2xl bg-linear-to-br from-[#D2A676]/0 to-[#1A4331]/0 group-hover:from-[#D2A676]/15 group-hover:to-[#1A4331]/10 transition-all duration-500 blur-sm" />
                <img
                  src="/logo/logo.png"
                  alt="Tea4Life Logo"
                  className="relative h-11 w-11 object-contain rounded-xl shadow-sm ring-1 ring-[#1A4331]/8 group-hover:ring-[#D2A676]/30 group-hover:shadow-md group-hover:scale-105 transition-all duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[22px] font-extrabold text-[#1A4331] leading-none tracking-tight">
                  Tea4Life
                </span>
                <span className="text-[9px] font-semibold text-[#D2A676] uppercase tracking-[0.25em] mt-0.5 flex items-center gap-1">
                  <Leaf className="w-2.5 h-2.5" />
                  Premium Tea
                </span>
              </div>
            </Link>

            {/* ──── Desktop Navigation ──── */}
            <nav className="hidden md:flex items-center">
              <div className="flex items-center gap-1 p-1 rounded-full bg-[#F8F5F0]/80 ring-1 ring-[#1A4331]/6">
                {navLinks.map((link) => {
                  const isActive = isActivePath(link.href);

                  if (link.isPrimary) {
                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        className="relative group/cta mx-0.5"
                      >
                        <div
                          className={`relative flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold
                          bg-linear-to-r from-[#1A4331] to-[#1d4e39] text-white
                          shadow-[0_2px_8px_rgba(26,67,49,0.3)]
                          hover:shadow-[0_4px_16px_rgba(26,67,49,0.4)]
                          hover:from-[#1d4e39] hover:to-[#226644]
                          active:scale-[0.97]
                          transition-all duration-300 overflow-hidden`}
                        >
                          {/* Shimmer sweep */}
                          <div className="absolute inset-0 -translate-x-full group-hover/cta:translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out" />
                          <link.icon className="h-4 w-4 relative z-10 text-[#D2A676]" />
                          <span className="relative z-10 tracking-wide">
                            {link.name}
                          </span>
                        </div>
                      </Link>
                    );
                  }

                  if (link.isSecondary) {
                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        className="relative group/sec mx-0.5"
                      >
                        <div
                          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300
                          ${
                            isActive
                              ? "bg-[#D2A676]/15 text-[#1A4331] ring-1 ring-[#D2A676]/30"
                              : "text-[#1A4331]/80 hover:bg-[#D2A676]/10 hover:text-[#1A4331]"
                          }
                        `}
                        >
                          <link.icon
                            className={`h-4 w-4 transition-colors duration-300 ${
                              isActive
                                ? "text-[#D2A676]"
                                : "text-[#8A9A7A] group-hover/sec:text-[#D2A676]"
                            }`}
                          />
                          <span>{link.name}</span>
                        </div>
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 group/link
                        ${
                          isActive
                            ? "bg-white text-[#1A4331] shadow-sm ring-1 ring-[#1A4331]/8"
                            : "text-[#1A4331]/60 hover:text-[#1A4331] hover:bg-white/60"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <link.icon
                          className={`h-4 w-4 transition-all duration-300 ${
                            isActive
                              ? "text-[#D2A676]"
                              : "text-[#8A9A7A]/70 group-hover/link:text-[#8A9A7A]"
                          }`}
                        />
                        {link.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* ──── Actions Area ──── */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <div
                className="relative group/cart flex items-center"
                onMouseEnter={() => {
                  if (isAuthenticated) dispatch(fetchCart());
                }}
              >
                <Link
                  to="/cart"
                  onClick={(e: React.MouseEvent) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      setShowLoginDialog(true);
                    }
                  }}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-xl text-[#1A4331] 
                    hover:bg-[#1A4331] hover:text-white 
                    transition-all duration-300 group-hover/cart:shadow-md ${
                      isBouncing ? "animate-bounce" : ""
                    }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cart && cart.totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#D2A676] text-[10px] font-bold text-white px-1 shadow-sm ring-2 ring-white">
                      {cart.totalItems > 99 ? "99+" : cart.totalItems}
                    </span>
                  )}
                </Link>

                {/* Bubble Feedback Message */}
                {bubbleMessage && (
                  <div className="absolute top-full mt-2 right-0 bg-[#1A4331] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg z-60 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-200 pointer-events-none whitespace-nowrap">
                    {bubbleMessage}
                    <div className="absolute -top-1 right-3 w-2 h-2 bg-[#1A4331] rotate-45" />
                  </div>
                )}

                {/* Cart Dropdown Popover */}
                {isAuthenticated && cart && cart.totalItems > 0 && (
                  <div className="absolute top-full mt-3 right-0 w-[340px] bg-white/95 backdrop-blur-xl rounded-2xl border border-[#1A4331]/8 shadow-[0_10px_40px_rgba(26,67,49,0.12)] opacity-0 invisible group-hover/cart:opacity-100 group-hover/cart:visible translate-y-1 group-hover/cart:translate-y-0 transition-all duration-300 z-50 overflow-hidden pointer-events-auto cursor-default">
                    {/* Popover Header */}
                    <div className="px-4 py-3 border-b border-[#1A4331]/6 bg-linear-to-r from-[#F8F5F0] to-white">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#1A4331]/60 uppercase tracking-wider">
                          Giỏ hàng
                        </p>
                        <span className="text-[10px] font-semibold text-[#D2A676] bg-[#D2A676]/10 px-2 py-0.5 rounded-full">
                          {cart.totalItems} món
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="max-h-[240px] overflow-y-auto">
                      {cart.items.slice(0, 4).map((item, index) => (
                        <div
                          key={item.id}
                          className={`flex gap-3 p-3 hover:bg-[#F8F5F0]/60 transition-colors ${
                            index < Math.min(cart.items.length, 4) - 1
                              ? "border-b border-[#1A4331]/4"
                              : ""
                          }`}
                        >
                          <img
                            src={
                              item.productImageUrl
                                ? getMediaUrl(item.productImageUrl)
                                : "/placeholder.svg"
                            }
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-xl bg-[#F8F5F0] ring-1 ring-[#1A4331]/6"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#1A4331] truncate leading-tight">
                              {item.productName}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-xs font-bold text-[#D2A676]">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(item.subTotal)}
                              </span>
                              <span className="text-[11px] font-medium text-[#8A9A7A] bg-[#8A9A7A]/10 px-1.5 py-0.5 rounded">
                                x{item.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {cart.totalItems > 4 && (
                      <div className="px-4 py-2 text-center border-t border-[#1A4331]/4 bg-[#F8F5F0]/40">
                        <p className="text-[11px] font-medium text-[#8A9A7A]">
                          + {cart.totalItems - 4} món khác
                        </p>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="p-3 bg-linear-to-r from-[#F8F5F0]/60 to-white border-t border-[#1A4331]/4">
                      <Link
                        to="/cart"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1A4331] text-white text-sm font-bold rounded-xl hover:bg-[#1d4e39] transition-colors shadow-sm"
                      >
                        Xem giỏ hàng
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-[#1A4331]/10" />

              {/* Auth Section */}
              <div className="hidden sm:flex items-center">
                {!initialized ? (
                  <div className="h-9 w-9 rounded-xl bg-[#F8F5F0] animate-pulse" />
                ) : isAuthenticated ? (
                  <UserMenu
                    user={{
                      name: fullName || "",
                      email: email || "",
                      avatar: getMediaUrl(avatarUrl),
                    }}
                  />
                ) : (
                  <Button
                    onClick={handleLogin}
                    className="bg-[#F8F5F0] border border-[#1A4331]/12 text-[#1A4331] hover:bg-[#1A4331] hover:text-white hover:border-[#1A4331] font-semibold text-sm px-5 h-9 rounded-xl transition-all duration-300 shadow-none hover:shadow-md"
                  >
                    Đăng nhập
                  </Button>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden relative flex items-center justify-center w-10 h-10 rounded-xl text-[#1A4331] hover:bg-[#F8F5F0] transition-all duration-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              >
                <div className="relative w-5 h-5">
                  <span
                    className={`absolute left-0 block h-[2px] w-5 bg-[#1A4331] rounded-full transition-all duration-300 ease-out ${
                      mobileMenuOpen
                        ? "top-[9px] rotate-45"
                        : "top-[3px] rotate-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-[9px] block h-[2px] w-5 bg-[#1A4331] rounded-full transition-all duration-300 ease-out ${
                      mobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`absolute left-0 block h-[2px] w-5 bg-[#1A4331] rounded-full transition-all duration-300 ease-out ${
                      mobileMenuOpen
                        ? "top-[9px] -rotate-45"
                        : "top-[15px] rotate-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ──── Mobile Menu Overlay ──── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#1A4331]/20 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute top-[74px] right-0 left-0 bottom-0 bg-white overflow-y-auto transition-all duration-300 ease-out ${
            mobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="p-5 pb-32">
            {/* Auth Header for Mobile (when not logged in) */}
            {!isAuthenticated && (
              <div className="mb-6 p-5 rounded-2xl bg-linear-to-br from-[#1A4331] to-[#1d4e39] text-white">
                <p className="text-sm font-medium text-white/70 mb-2">
                  Chào mừng bạn đến với
                </p>
                <p className="text-xl font-bold mb-4">Tea4Life</p>
                <Button
                  onClick={handleLogin}
                  className="w-full bg-white text-[#1A4331] hover:bg-[#F8F5F0] font-bold rounded-xl h-11"
                >
                  Đăng nhập ngay
                </Button>
              </div>
            )}

            {/* Auth Header (logged in) */}
            {isAuthenticated && (
              <div className="mb-6 p-4 rounded-2xl bg-[#F8F5F0] flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden ring-1 ring-[#1A4331]/8 shrink-0">
                  {avatarUrl ? (
                    <img
                      src={getMediaUrl(avatarUrl)}
                      alt={fullName || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-6 h-6 text-[#8A9A7A]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A4331] truncate">
                    {fullName || "Người dùng"}
                  </p>
                  <p className="text-xs text-[#8A9A7A] truncate">{email}</p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="space-y-1.5">
              {navLinks.map((link, index) => {
                const isActive = isActivePath(link.href);
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group/mobile ${
                      isActive
                        ? "bg-[#1A4331] text-white shadow-md"
                        : "text-[#1A4331] hover:bg-[#F8F5F0]"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
                        isActive
                          ? "bg-white/15"
                          : "bg-[#F8F5F0] group-hover/mobile:bg-[#1A4331]/5"
                      }`}
                    >
                      <link.icon
                        className={`h-5 w-5 ${
                          isActive ? "text-[#D2A676]" : "text-[#8A9A7A]"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-bold block">
                        {link.name}
                      </span>
                      <span
                        className={`text-[11px] font-medium mt-0.5 block ${
                          isActive ? "text-white/60" : "text-[#8A9A7A]"
                        }`}
                      >
                        {link.description}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform group-hover/mobile:translate-x-0.5 ${
                        isActive ? "text-white/40" : "text-[#1A4331]/20"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Actions */}
            {isAuthenticated && (
              <>
                <div className="my-5 h-px bg-[#1A4331]/8" />
                <div className="space-y-1.5">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-[#1A4331] hover:bg-[#F8F5F0] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCircle className="h-5 w-5 text-[#8A9A7A]" />
                    Thông tin cá nhân
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <RequireLoginDialog
        isOpen={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title="Yêu cầu đăng nhập"
        description="Vui lòng đăng nhập để xem giỏ hàng của bạn nhé!"
      />
    </>
  );
}
