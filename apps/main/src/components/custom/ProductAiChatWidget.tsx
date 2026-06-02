import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { Bot, CheckCircle, Loader2, MessageCircle, Send, ShoppingCart, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  chatWithProductAiApi,
  getProductAiChatConfigApi,
  getProductAiChatHistoryApi,
} from "@/services/productApi";
import type { ProductSummaryResponse } from "@/types/product/ProductSummaryResponse";
import type { ProductAiCartSuggestionResponse } from "@/types/product/ProductAiCartSuggestionResponse";
import type { CartItemOptionSelectionRequest } from "@/types/cart/CartItemOptionSelectionRequest";
import { addCartItemApi } from "@/services/cartApi";
import { getMediaUrl } from "@/lib/utils";
import { useAuth } from "@/features/auth/useAuth";
import { useAppDispatch } from "@/features/store";
import { fetchCart, setLastAction } from "@/features/cart/cartSlice";
import { toast } from "sonner";

type ChatRole = "assistant" | "user";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  recommendedProducts?: ProductSummaryResponse[];
  cartSuggestions?: ProductAiCartSuggestionResponse[];
  cartActionRequested?: boolean;
  cartAdded?: boolean;
}

interface GuestConversationState {
  messages: ChatMessage[];
  maxQuestionsPerDay?: number;
  remainingQuestionsToday?: number | null;
}

const MAX_INPUT_LENGTH = 400;
const HISTORY_PAGE_SIZE = 5;
const GUEST_STORAGE_KEY = "tea4life_product_ai_guest_session_v1";
const AI_CHAT_VISIBILITY_EVENT = "tea4life:ai-chat-visibility";
const DEFAULT_ERROR =
  "Xin lỗi bạn, mình đang hơi bận một chút. Bạn thử lại sau vài giây nhé.";
const INTRO_MESSAGE =
  "Mình là Tea4Life AI. Bạn cứ nói khẩu vị, mức giá hoặc nhu cầu, mình sẽ gợi ý sản phẩm phù hợp từ menu hiện có.";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function createMessage(
  role: ChatRole,
  content: string,
  recommendedProducts?: ProductSummaryResponse[],
  cartSuggestions?: ProductAiCartSuggestionResponse[],
  cartActionRequested = false,
  cartAdded = false,
): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    recommendedProducts,
    cartSuggestions,
    cartActionRequested,
    cartAdded,
  };
}

function buildDefaultConversation(): ChatMessage[] {
  return [createMessage("assistant", INTRO_MESSAGE)];
}

function parseStoredGuestConversation(
  raw: string | null,
): GuestConversationState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as GuestConversationState;
    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) {
      return null;
    }

    const sanitizedMessages = parsed.messages
      .filter(
        (item) =>
          item &&
          typeof item.content === "string" &&
          (item.role === "assistant" || item.role === "user"),
      )
      .map((item) => ({
        id:
          item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: item.role,
        content: item.content,
        recommendedProducts:
          Array.isArray(item.recommendedProducts) &&
          item.recommendedProducts.length > 0
            ? item.recommendedProducts
            : undefined,
        cartSuggestions:
          Array.isArray(item.cartSuggestions) && item.cartSuggestions.length > 0
            ? item.cartSuggestions
            : undefined,
        cartActionRequested: Boolean(item.cartActionRequested),
        cartAdded: Boolean(item.cartAdded),
      }));

    if (sanitizedMessages.length === 0) {
      return null;
    }

    return {
      messages: sanitizedMessages,
      maxQuestionsPerDay:
        typeof parsed.maxQuestionsPerDay === "number"
          ? parsed.maxQuestionsPerDay
          : undefined,
      remainingQuestionsToday:
        typeof parsed.remainingQuestionsToday === "number" ||
        parsed.remainingQuestionsToday === null
          ? parsed.remainingQuestionsToday
          : undefined,
    };
  } catch {
    return null;
  }
}

export default function ProductAiChatWidget() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, email } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [chatboxDisplayName, setChatboxDisplayName] = useState("Tea4Life AI");
  const [maxQuestionsPerDay, setMaxQuestionsPerDay] = useState<number>(20);
  const [remainingQuestionsToday, setRemainingQuestionsToday] = useState<
    number | null
  >(null);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [nextHistoryPage, setNextHistoryPage] = useState(2);
  const [isLoadingMoreHistory, setIsLoadingMoreHistory] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(
    buildDefaultConversation(),
  );

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollShellRef = useRef<HTMLDivElement | null>(null);
  const loadedScopeRef = useRef<string | null>(null);
  const sendingRef = useRef(false);
  const loadingMoreHistoryRef = useRef(false);
  const isPrependingHistoryRef = useRef(false);
  const userInitiatedScrollRef = useRef(false);
  const lastViewportScrollTopRef = useRef(0);
  const conversationScope = useMemo(
    () => (isAuthenticated ? `auth:${email || "unknown"}` : "guest"),
    [isAuthenticated, email],
  );

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await getProductAiChatConfigApi();
        const data = res.data.data;
        if (!data) return;
        if (data.chatboxDisplayName?.trim()) {
          setChatboxDisplayName(data.chatboxDisplayName.trim());
        }
        if (typeof data.maxQuestionsPerUserPerDay === "number") {
          setMaxQuestionsPerDay(data.maxQuestionsPerUserPerDay);
        }
      } catch {
        // ignore
      }
    };

    void loadConfig();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    document.body.dataset.aiChatOpen = isOpen ? "true" : "false";
    window.dispatchEvent(
      new CustomEvent(AI_CHAT_VISIBILITY_EVENT, {
        detail: { isOpen },
      }),
    );
  }, [isOpen]);

  const getViewportElement = useCallback(() => {
    if (!scrollShellRef.current) return null;
    return scrollShellRef.current.querySelector(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLDivElement | null;
  }, []);

  useEffect(() => {
    if (!isOpen || isPrependingHistoryRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isOpen]);

  const mapHistoryItemsToMessages = useCallback(
    (
      historyItems: {
        question: string;
        answer: string;
        recommendedProducts: ProductSummaryResponse[];
      }[],
    ): ChatMessage[] => {
      const hydrated: ChatMessage[] = [];
      for (const item of historyItems) {
        const question = item.question?.trim();
        const answer = item.answer?.trim();

        if (question) {
          hydrated.push(createMessage("user", question));
        }
        if (answer) {
          hydrated.push(
            createMessage(
              "assistant",
              answer,
              item.recommendedProducts && item.recommendedProducts.length > 0
                ? item.recommendedProducts
                : undefined,
            ),
          );
        }
      }
      return hydrated;
    },
    [],
  );

  const hydrateHistoryForAuthenticatedUser = useCallback(async (): Promise<
    ChatMessage[] | null
  > => {
    try {
      const res = await getProductAiChatHistoryApi({
        page: 1,
        size: HISTORY_PAGE_SIZE,
      });
      const pageData = res.data.data;
      const historyItems = pageData?.content || [];
      if (historyItems.length === 0) {
        setHistoryHasMore(false);
        setNextHistoryPage(2);
        return null;
      }

      setHistoryHasMore(Boolean(pageData?.hasMore));
      setNextHistoryPage(2);

      const hydrated = buildDefaultConversation();
      hydrated.push(...mapHistoryItemsToMessages(historyItems));
      return hydrated.length > 1 ? hydrated : null;
    } catch {
      setHistoryHasMore(false);
      setNextHistoryPage(2);
      return null;
    }
  }, [mapHistoryItemsToMessages]);

  const bootstrapConversation = useCallback(async () => {
    setIsBootstrapping(true);
    userInitiatedScrollRef.current = false;

    try {
      if (isAuthenticated) {
        const historyMessages = await hydrateHistoryForAuthenticatedUser();
        if (historyMessages) {
          setMessages(historyMessages);
          return;
        }

        setHistoryHasMore(false);
        setNextHistoryPage(2);
        setMessages(buildDefaultConversation());
        return;
      }

      const storedGuestConversation = parseStoredGuestConversation(
        sessionStorage.getItem(GUEST_STORAGE_KEY),
      );

      if (storedGuestConversation) {
        setMessages(storedGuestConversation.messages);
        if (typeof storedGuestConversation.maxQuestionsPerDay === "number") {
          setMaxQuestionsPerDay(storedGuestConversation.maxQuestionsPerDay);
        }
        if (storedGuestConversation.remainingQuestionsToday !== undefined) {
          setRemainingQuestionsToday(
            storedGuestConversation.remainingQuestionsToday ?? null,
          );
        }
        return;
      }

      setMessages(buildDefaultConversation());
      setHistoryHasMore(false);
      setNextHistoryPage(2);
    } finally {
      setIsBootstrapping(false);
    }
  }, [hydrateHistoryForAuthenticatedUser, isAuthenticated]);

  const handleLoadMoreHistory = useCallback(async () => {
    if (
      !isAuthenticated ||
      isLoadingMoreHistory ||
      loadingMoreHistoryRef.current ||
      !historyHasMore
    ) {
      return;
    }

    const viewportBeforeLoad = getViewportElement();
    const previousScrollHeight = viewportBeforeLoad?.scrollHeight ?? 0;
    const previousScrollTop = viewportBeforeLoad?.scrollTop ?? 0;

    loadingMoreHistoryRef.current = true;
    setIsLoadingMoreHistory(true);
    try {
      const res = await getProductAiChatHistoryApi({
        page: nextHistoryPage,
        size: HISTORY_PAGE_SIZE,
      });
      const pageData = res.data.data;
      const olderItems = pageData?.content || [];

      if (olderItems.length > 0) {
        const olderMessages = mapHistoryItemsToMessages(olderItems);
        isPrependingHistoryRef.current = true;
        setMessages((prev) => {
          const intro = prev[0];
          const body = prev.slice(1);
          return [intro, ...olderMessages, ...body];
        });

        requestAnimationFrame(() => {
          const viewportAfterLoad = getViewportElement();
          if (viewportAfterLoad) {
            const deltaHeight =
              viewportAfterLoad.scrollHeight - previousScrollHeight;
            viewportAfterLoad.scrollTop = previousScrollTop + deltaHeight;
          }
          isPrependingHistoryRef.current = false;
        });
      }

      setHistoryHasMore(Boolean(pageData?.hasMore));
      setNextHistoryPage((prev) => prev + 1);
    } catch {
      // ignore
    } finally {
      if (!isPrependingHistoryRef.current) {
        isPrependingHistoryRef.current = false;
      }
      loadingMoreHistoryRef.current = false;
      setIsLoadingMoreHistory(false);
    }
  }, [
    getViewportElement,
    historyHasMore,
    isAuthenticated,
    isLoadingMoreHistory,
    mapHistoryItemsToMessages,
    nextHistoryPage,
  ]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    const viewport = getViewportElement();
    if (!viewport) return;

    lastViewportScrollTopRef.current = viewport.scrollTop;

    const onScroll = () => {
      const currentScrollTop = viewport.scrollTop;
      const isScrollingUp = currentScrollTop < lastViewportScrollTopRef.current;
      lastViewportScrollTopRef.current = currentScrollTop;

      const hasOverflow = viewport.scrollHeight - viewport.clientHeight > 64;
      if (!hasOverflow || isBootstrapping || isPrependingHistoryRef.current) {
        return;
      }

      if (isScrollingUp) {
        userInitiatedScrollRef.current = true;
      }

      if (userInitiatedScrollRef.current && currentScrollTop <= 40) {
        void handleLoadMoreHistory();
      }
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      viewport.removeEventListener("scroll", onScroll);
    };
  }, [
    getViewportElement,
    handleLoadMoreHistory,
    isAuthenticated,
    isBootstrapping,
    isOpen,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    if (loadedScopeRef.current === conversationScope) return;

    loadedScopeRef.current = conversationScope;
    void bootstrapConversation();
  }, [bootstrapConversation, conversationScope, isOpen]);

  useEffect(() => {
    if (isOpen) return;
    userInitiatedScrollRef.current = false;
    lastViewportScrollTopRef.current = 0;
  }, [isOpen]);

  useEffect(() => {
    if (isAuthenticated) return;

    try {
      const payload: GuestConversationState = {
        messages,
        maxQuestionsPerDay,
        remainingQuestionsToday,
      };
      sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [isAuthenticated, maxQuestionsPerDay, messages, remainingQuestionsToday]);

  const handleSelectProduct = (productId: string) => {
    setIsOpen(false);
    setDraft("");
    navigate(`/shop/products/${productId}`, {
      state: { openQuickOrder: true, source: "ai-chat" },
    });
  };

  const toCartOptionPayload = (
    suggestion: ProductAiCartSuggestionResponse,
  ): CartItemOptionSelectionRequest[] => {
    return (suggestion.selectedOptions || []).map((option) => ({
      productOptionId: String(option.productOptionId),
      productOptionName: option.productOptionName,
      productOptionValueId: String(option.productOptionValueId),
      productOptionValueName: option.productOptionValueName,
      extraPrice: option.extraPrice || 0,
    }));
  };

  const addSuggestionsToCart = async (
    suggestions: ProductAiCartSuggestionResponse[],
  ) => {
    for (const suggestion of suggestions) {
      await addCartItemApi({
        productId: String(suggestion.productId),
        productName: suggestion.productName,
        productImageUrl: suggestion.productImageUrl,
        selectedOptions: toCartOptionPayload(suggestion),
        unitPrice: suggestion.unitPrice || 0,
        quantity: Math.max(1, suggestion.quantity || 1),
      });
    }

    dispatch(setLastAction("add"));
    dispatch(fetchCart());
  };

  const handleAddSuggestionToCart = async (
    suggestion: ProductAiCartSuggestionResponse,
  ) => {
    if (!isAuthenticated) {
      toast.warning("Bạn cần đăng nhập để thêm món vào giỏ hàng nhé!");
      return;
    }

    try {
      await addSuggestionsToCart([suggestion]);
      toast.success("Đã thêm món vào giỏ hàng");
    } catch {
      toast.error("Không thể thêm món vào giỏ hàng lúc này.");
    }
  };

  const handleSend = async () => {
    const message = draft.trim();
    if (!message || isSending || isBootstrapping || sendingRef.current) return;

    sendingRef.current = true;
    setDraft("");
    setIsSending(true);
    setMessages((prev) => [...prev, createMessage("user", message)]);

    try {
      const response = await chatWithProductAiApi({ message });
      const payload = response.data;

      if (payload.errorCode || !payload.data) {
        throw new Error(payload.errorMessage || DEFAULT_ERROR);
      }

      let answer = payload.data.answer?.trim() || DEFAULT_ERROR;
      const products =
        payload.data.recommendedProducts &&
        payload.data.recommendedProducts.length > 0
          ? payload.data.recommendedProducts
          : undefined;
      const cartSuggestions =
        payload.data.cartSuggestions && payload.data.cartSuggestions.length > 0
          ? payload.data.cartSuggestions
          : undefined;
      let cartAdded = false;

      if (payload.data.cartActionRequested && cartSuggestions?.length) {
        if (!isAuthenticated) {
          answer +=
            "\n\nBạn cần đăng nhập để mình thêm các món này vào giỏ hàng nhé.";
        } else {
          try {
            await addSuggestionsToCart(cartSuggestions);
            cartAdded = true;
            const totalQuantity = cartSuggestions.reduce(
              (total, item) => total + Math.max(1, item.quantity || 1),
              0,
            );
            answer += `\n\nMình đã thêm ${totalQuantity} món vào giỏ hàng cho bạn.`;
            toast.success("AI đã thêm món vào giỏ hàng");
          } catch {
            answer +=
              "\n\nMình đã chọn món rồi, nhưng chưa thêm được vào giỏ hàng lúc này.";
            toast.error("Không thể thêm món AI đã chọn vào giỏ hàng.");
          }
        }
      }

      const displayName = payload.data.chatboxDisplayName?.trim();
      if (displayName) {
        setChatboxDisplayName(displayName);
      }
      if (typeof payload.data.maxQuestionsPerUserPerDay === "number") {
        setMaxQuestionsPerDay(payload.data.maxQuestionsPerUserPerDay);
      }
      setRemainingQuestionsToday(payload.data.remainingQuestionsToday ?? null);

      setMessages((prev) => [
        ...prev,
        createMessage(
          "assistant",
          answer,
          products,
          cartSuggestions,
          Boolean(payload.data.cartActionRequested),
          cartAdded,
        ),
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        createMessage("assistant", DEFAULT_ERROR),
      ]);
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div
      className={`fixed right-5 z-[45] ${isOpen ? "bottom-5" : "bottom-24"}`}
    >
      {!isOpen ? (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-14 rounded-full bg-linear-to-r from-[#1A4331] to-[#2A6A4F] px-5 text-white shadow-[0_10px_30px_rgba(26,67,49,0.35)] hover:from-[#215740] hover:to-[#32785b]"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Tư vấn AI
        </Button>
      ) : (
        <div className="w-[calc(100vw-2rem)] max-w-[390px] overflow-hidden rounded-2xl border border-[#1A4331]/20 bg-[#FFFCF6] shadow-[0_22px_48px_rgba(26,67,49,0.25)]">
          <div className="bg-linear-to-r from-[#1A4331] to-[#2F7A5B] p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-[#F7D8A8]" />
                <div>
                  <p className="text-sm font-semibold">{chatboxDisplayName}</p>
                  <p className="text-xs text-white/80">Trợ lý AI thông minh</p>
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full text-white hover:bg-white/15 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div ref={scrollShellRef}>
            <ScrollArea className="h-[380px] bg-[#FFFCF6] px-4 py-3">
              <div className="space-y-3">
                {isAuthenticated && isLoadingMoreHistory && (
                  <div className="flex justify-center">
                    <div className="inline-flex items-center rounded-full border border-[#1A4331]/15 bg-white px-3 py-1 text-xs text-[#5C7C69]">
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Đang tải thêm lịch sử...
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    <div
                      className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === "assistant"
                          ? "rounded-tl-sm border border-[#1A4331]/10 bg-white text-[#214734]"
                          : "ml-auto rounded-tr-sm bg-[#1A4331] text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>

                    {msg.role === "assistant" &&
                      msg.cartSuggestions &&
                      msg.cartSuggestions.length > 0 && (
                        <div className="space-y-2 rounded-xl border border-[#1A4331]/10 bg-white p-3">
                          {msg.cartSuggestions.map((suggestion) => (
                            <div
                              key={`${suggestion.productId}-${suggestion.productName}`}
                              className="rounded-lg border border-[#1A4331]/10 p-2"
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                  onClick={() =>
                                    handleSelectProduct(suggestion.productId)
                                  }
                                >
                                  <img
                                    src={
                                      getMediaUrl(suggestion.productImageUrl) ||
                                      "https://placehold.co/90x90/F8F5F0/1A4331?text=Tea"
                                    }
                                    alt={suggestion.productName}
                                    className="h-12 w-12 rounded-md object-cover"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-[#1A4331]">
                                      {suggestion.quantity > 1
                                        ? `${suggestion.quantity} x `
                                        : ""}
                                      {suggestion.productName}
                                    </p>
                                    <p className="text-xs font-semibold text-[#2F7A5B]">
                                      {formatPrice(suggestion.unitPrice || 0)}
                                    </p>
                                  </div>
                                </button>
                                {msg.cartAdded ? (
                                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E6F4EC] text-[#1A4331]">
                                    <CheckCircle className="h-4 w-4" />
                                  </span>
                                ) : (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    className="h-9 w-9 shrink-0 border-[#1A4331]/20 text-[#1A4331]"
                                    onClick={() =>
                                      void handleAddSuggestionToCart(suggestion)
                                    }
                                  >
                                    <ShoppingCart className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              {suggestion.selectedOptions?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {suggestion.selectedOptions.map((option) => (
                                    <span
                                      key={`${suggestion.productId}-${option.productOptionId}-${option.productOptionValueId}`}
                                      className="rounded-full bg-[#F7F4EC] px-2 py-1 text-[11px] font-medium text-[#5C7C69]"
                                    >
                                      {option.productOptionName}:{" "}
                                      {option.productOptionValueName}
                                      {option.extraPrice > 0
                                        ? ` +${formatPrice(option.extraPrice)}`
                                        : ""}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                    {msg.role === "assistant" &&
                      (!msg.cartSuggestions ||
                        msg.cartSuggestions.length === 0) &&
                      msg.recommendedProducts &&
                      msg.recommendedProducts.length > 0 && (
                        <div className="space-y-2 rounded-xl border border-[#1A4331]/10 bg-white p-3">
                          <div className="space-y-2">
                            {msg.recommendedProducts.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                className="flex w-full items-center gap-3 rounded-lg border border-[#1A4331]/10 p-2 text-left transition hover:border-[#1A4331]/30 hover:bg-[#F7F4EC]"
                                onClick={() => handleSelectProduct(product.id)}
                              >
                                <img
                                  src={
                                    getMediaUrl(product.imageUrl) ||
                                    "https://placehold.co/90x90/F8F5F0/1A4331?text=Tea"
                                  }
                                  alt={product.name}
                                  className="h-12 w-12 rounded-md object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-[#1A4331]">
                                    {product.name}
                                  </p>
                                  <p className="truncate text-xs text-[#668571]">
                                    {product.productCategoryName}
                                  </p>
                                </div>
                                <p className="text-xs font-semibold text-[#2F7A5B]">
                                  {formatPrice(product.basePrice)}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))}

                {(isBootstrapping || isSending) && (
                  <div className="flex items-center gap-2 text-xs text-[#5C7C69]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {isBootstrapping
                      ? `${chatboxDisplayName} đang tải lịch sử hội thoại...`
                      : `${chatboxDisplayName} đang soạn gợi ý...`}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          </div>

          <div className="border-t border-[#1A4331]/10 bg-white p-2.5">
            {maxQuestionsPerDay > 0 && (
              <p className="mb-1.5 text-xs text-[#6E8D7A]">
                Giới hạn mỗi ngày: {maxQuestionsPerDay} câu
                {remainingQuestionsToday !== null
                  ? ` · Còn lại hôm nay: ${remainingQuestionsToday}`
                  : ""}
              </p>
            )}
            <div className="flex items-end gap-2">
              <Textarea
                value={draft}
                onChange={(event) =>
                  setDraft(event.target.value.slice(0, MAX_INPUT_LENGTH))
                }
                onKeyDown={handleKeyDown}
                className="min-h-[44px] flex-1 resize-none border-[#1A4331]/20 bg-[#FFFCF6] text-sm"
              />
              <Button
                type="button"
                onClick={() => void handleSend()}
                disabled={isSending || isBootstrapping || !draft.trim()}
                className="h-12 shrink-0 bg-[#1A4331] px-4 text-white hover:bg-[#215740]"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Gửi
              </Button>
            </div>
            <p className="mt-1 text-xs text-[#7A9887]">
              {draft.length}/{MAX_INPUT_LENGTH}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
