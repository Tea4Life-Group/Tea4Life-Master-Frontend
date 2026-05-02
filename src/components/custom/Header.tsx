import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/custom/UserMenu";
import { RequireLoginDialog } from "@/components/custom/RequireLoginDialog";
import { useAuth } from "@/features/auth/useAuth";
import { getMediaUrl } from "@/lib/utils";
import keycloak from "@/lib/keycloak";
import { Menu, X, ShoppingCart, Store, UserCircle, LogOut, ShoppingBag, Home, Newspaper } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/features/store";
import { fetchCart, clearLastAction } from "@/features/cart/cartSlice";

const navLinks = [
  { name: "Trang chủ", href: "/", icon: Home },
  { 
    name: "Thực đơn", 
    href: "/shop", 
    isButton: true, 
    isHighlighted: true,
    icon: ShoppingBag,
    color: "bg-[#1A4331] text-white hover:bg-[#1A4331]/90 shadow-[#1A4331]/20",
  },
  { name: "Tin tức", href: "/news", icon: Newspaper },
  { 
    name: "Cửa hàng", 
    href: "/places", 
    isButton: true, 
    icon: Store,
    color: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20",
  },
];

export default function Header() {
  const dispatch = useAppDispatch();
  const { cart, lastAction } = useAppSelector((state) => state.cart);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState<string | null>(null);
  const bounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isAuthenticated, fullName, email, avatarUrl, initialized } =
    useAuth();

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

  const handleLogin = () => keycloak.login();
  const handleLogout = () =>
    keycloak.logout({ redirectUri: window.location.origin });

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/95 border-b border-border shadow-sm transition-all duration-300">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes shimmer {
              0% { transform: translateX(-150%) skewX(12deg); }
              100% { transform: translateX(150%) skewX(12deg); }
            }
            @keyframes pulse-ring {
              0% { transform: scale(0.95); opacity: 0.8; box-shadow: 0 0 0 0 rgba(210, 166, 118, 0.7); }
              70% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 10px rgba(210, 166, 118, 0); }
              100% { transform: scale(0.95); opacity: 0.8; box-shadow: 0 0 0 0 rgba(210, 166, 118, 0); }
            }
            @keyframes bounce-hard {
              0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
              50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
            }
          `
        }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-300" />
              <img
                src="/logo/logo.png"
                alt="Tea4Life Logo"
                className="relative h-12 w-12 object-contain rounded-xl shadow-sm border border-border/10"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#1A4331] leading-none tracking-tight">
                Tea4Life
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                Premium Tea
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:gap-2 md:flex p-1.5 rounded-full bg-secondary/20">
            {navLinks.map((link) => (
              link.isButton ? (
                <Link key={link.name} to={link.href} className="group/btn relative inline-block mx-1">
                  {/* Overdrive Background Pulse Ring */}
                  {link.isHighlighted && (
                    <div className="absolute inset-0 rounded-full animate-[pulse-ring_2s_infinite] bg-[#D2A676] opacity-30 blur-sm pointer-events-none" />
                  )}

                  <div className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full ${link.isHighlighted ? 'bg-gradient-to-r from-[#1A4331] to-[#123023] shadow-[0_4px_15px_rgba(26,67,49,0.5)] border-[1.5px] border-[#D2A676]/40' : link.color} text-sm font-bold hover:scale-110 active:scale-95 transition-all duration-300 overflow-hidden`}>
                    
                    {/* Continuous Shimmer Effect */}
                    {link.isHighlighted && (
                       <>
                         <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 z-0" />
                         <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_2.5s_infinite_0.5s] bg-gradient-to-r from-transparent via-[#D2A676]/30 to-transparent skew-x-12 z-0" />
                       </>
                    )}
                    
                    {link.icon && <link.icon className={`h-4 w-4 relative z-10 ${link.isHighlighted ? 'text-[#D2A676]' : ''}`} />}
                    <span className={`relative z-10 ${link.isHighlighted ? 'text-white tracking-wide' : ''}`}>
                      {link.name}
                    </span>
                  </div>
                </Link>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="relative px-5 py-2.5 rounded-full text-sm font-semibold text-muted-foreground hover:text-[#1A4331] hover:bg-white/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2">
                    {link.icon && <link.icon className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />}
                    {link.name}
                  </div>
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1A4331] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            ))}
          </nav>

          {/* Actions Area */}
          <div className="flex items-center gap-4">
            <div 
              className="relative group flex items-center py-2 h-full"
              onMouseEnter={() => {
                if (isAuthenticated) dispatch(fetchCart());
              }}
            >
              <Link
                to="/cart"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    setShowLoginDialog(true);
                  }
                }}
                className={`relative p-2 text-[#1A4331] group-hover:bg-[#1A4331] group-hover:text-[#F8F5F0] border-2 border-transparent group-hover:border-[#1A4331] transition-colors z-10 ${
                  isBouncing ? "animate-bounce" : ""
                }`}
              >
                <ShoppingCart className="h-6 w-6" />
                {cart && cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-[#8A9A7A] border-2 border-[#1A4331] text-[10px] font-bold text-[#F8F5F0]">
                    {cart.totalItems}
                  </span>
                )}
              </Link>
              
              {/* Bubble Feedback Message */}
              {bubbleMessage && (
                <div className="absolute top-12 -right-2 bg-[#8A9A7A] text-[#F8F5F0] text-[11px] font-bold px-3 py-1.5 shadow-[2px_2px_0px_#1A4331] border-2 border-[#1A4331] z-60 animate-in fade-in zoom-in slide-in-from-top-2 duration-300 pointer-events-none whitespace-nowrap uppercase tracking-tighter">
                  {bubbleMessage}
                </div>
              )}
              
              {/* Dropdown Popover */}
              {isAuthenticated && cart && cart.totalItems > 0 && (
                <div className="absolute top-12 right-0 mt-2 w-[320px] bg-white border-2 border-[#1A4331] shadow-[4px_4px_0px_#1A4331] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col pointer-events-auto cursor-default">
                  <div className="p-3 border-b-2 border-[#1A4331]/10 bg-[#F8F5F0]">
                    <p className="text-xs font-bold text-[#1A4331] opacity-70 uppercase tracking-wide">Sản phẩm mới thêm</p>
                  </div>
                  <div className="flex flex-col">
                    {cart.items.slice(0, 3).map(item => (
                      <div key={item.id} className="flex gap-3 p-3 border-b border-[#1A4331]/5 hover:bg-[#F8F5F0] transition-colors">
                        <img src={item.productImageUrl ? getMediaUrl(item.productImageUrl) : "/placeholder.svg"} alt={item.productName} className="w-12 h-12 object-cover border border-[#1A4331]/10 bg-white" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-[#1A4331] truncate">{item.productName}</p>
                          <p className="text-xs font-semibold text-[#8A9A7A] mt-1 flex justify-between">
                            <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.subTotal)}</span>
                            <span className="text-[#1A4331]">x{item.quantity}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {cart.totalItems > 3 && (
                    <div className="p-2 text-center bg-[#F8F5F0] border-t border-[#1A4331]/10">
                      <p className="text-[11px] font-bold text-[#8A9A7A]">Xem thêm {cart.totalItems - 3} món trong giỏ...</p>
                    </div>
                  )}
                  <div className="p-3">
                    <Link to="/cart" className="block w-full py-2 bg-[#1A4331] text-white text-center text-sm font-bold hover:bg-[#8A9A7A] transition-colors cursor-pointer border-2 border-transparent hover:border-[#1A4331]">
                      XEM THÊM GIỎ HÀNG
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* PHẦN THAY ĐỔI: Login Button vs UserMenu  */}
            <div className="hidden sm:block">
              {!initialized ? (
                <div className="h-8 w-8 animate-pulse bg-[#8A9A7A] border-2 border-[#1A4331]" />
              ) : isAuthenticated ? (
                <div className="pixel-border border-2 shadow-[2px_2px_0px_#1A4331]">
                  <UserMenu
                    user={{
                      name: fullName || "",
                      email: email || "",
                      avatar: getMediaUrl(avatarUrl),
                    }}
                  />
                </div>
              ) : (
                <Button
                  onClick={handleLogin}
                  className="bg-transparent border-2 border-[#1A4331] text-[#1A4331] hover:bg-[#1A4331] hover:text-[#F8F5F0] pixel-button"
                >
                  ĐĂNG NHẬP
                </Button>
              )}
            </div>

            <button
              className="md:hidden p-2 text-[#1A4331] pixel-button border-2 bg-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t-4 border-[#1A4331] py-4 md:hidden bg-[#F8F5F0]">
            <nav className="flex flex-col gap-4">
              {!isAuthenticated && (
                <Button
                  onClick={handleLogin}
                  className="mx-2 bg-[#1A4331] text-[#F8F5F0] pixel-button"
                >
                  ĐĂNG NHẬP NGAY
                </Button>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`mx-4 px-4 py-4 flex items-center gap-4 text-base font-bold rounded-2xl transition-all ${
                    link.isButton 
                      ? `${link.color} text-white shadow-lg shadow-primary/10` 
                      : "text-foreground hover:bg-[#1A4331]/5"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className={`p-2 rounded-xl scale-110 ${link.isButton ? "bg-white/10" : "bg-[#1A4331]/5 text-[#1A4331]"}`}>
                    {link.icon && <link.icon className="h-6 w-6" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="leading-none">{link.name}</span>
                    <span className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-widest">Khám phá ngay</span>
                  </div>
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <div className="h-1 bg-[#1A4331] mx-2 my-2 opacity-50" />
                  <div className="px-2 space-y-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 py-2 px-2 text-sm font-bold text-[#1A4331] hover:bg-[#1A4331] hover:text-[#F8F5F0] uppercase"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserCircle className="h-5 w-5" /> HỒ SƠ
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 py-2 px-2 text-sm font-bold text-red-600 w-full hover:bg-red-600 hover:text-white uppercase"
                    >
                      <LogOut className="h-5 w-5" /> ĐĂNG XUẤT
                    </button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      <RequireLoginDialog
        isOpen={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title="Yêu cầu đăng nhập"
        description="Vui lòng đăng nhập để xem giỏ hàng của bạn nhé!"
      />
    </header>
  );
}
