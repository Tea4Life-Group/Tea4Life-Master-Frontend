# Tea4Life Frontend - Project Context

## 1. Project Overview
- **Project Name:** Tea4Life Frontend Website
- **Objective:** Build an E-commerce platform and Admin Dashboard specifically for the "Tea4Life" milk tea and tea brand.
- **Brand Positioning:** "Premium" style, combining modern aesthetics with nostalgic and natural touches.

## 2. Tech Stack
- **Framework:** React 19 + Vite + TypeScript.
- **Styling:** Tailwind CSS v4, utilizing Radix UI for headless accessible components.
- **State Management:** Redux Toolkit (@reduxjs/toolkit).
- **Routing:** React Router v7.
- **Maps Location:** GoongJS / Mapbox-GL.
- **Animation & Design:** Framer-style component animations (CSS + custom SVGs), focusing on high-end UX details (Micro-Interactions, Glassmorphism).

## 3. Folder Structure
- `src/pages/public-route-pages`: Pages for visitors (Landing, Shop, Product Details, News, Stores).
- `src/pages/customer-route-pages`: Pages requiring user authentication (Profile, Checkout, Onboarding).
- `src/pages/admin-route-pages`: Admin system (Users, Products, Roles, Vouchers...).
- `src/components/custom`: UI components with distinctive designs (e.g., LoadingScreen).

## 4. Design Guidelines
- **Brand Colors:**
  - Forest Green: `#1A4331` (Used for primary text, focal backgrounds).
  - Muted Green: `#8A9A7A` (Used for borders, secondary text).
  - Gold/Brown: `#D2A676` (Accent color, milk tea/boba tone).
  - Background: `#F8F5F0` or `#E5F6DF`.
- **Aesthetics:** Prioritize **Glassmorphism**, natural gradients, and soft shadows. All actions must feature gentle, floating dropping animations conveying a serene, nature-inspired vibe.

## 5. AI Workflow
- **UX/UI First:** Any added features must prioritize user experience and maintain a premium, WOW-inducing standard.
- **Multi-language Synchronization:** (Must adhere to UI copy rules if the project scales i18n).
- **Desktop/Mobile Parity:** Layout components must be strictly responsive.

## 6. API Calling Patterns
- **API File Locations:** API hook and axios definition files are centralized in `src/services/...`.
- **Calling inside UI Components:** 
  - Standardized on using `useState`, `useEffect`, `useCallback` with `try/catch` blocks instead of third-party auto-fetch libraries like React Query.
  - MUST use a delay of `500ms` within the `finally` block to clear the `loading` state, ensuring smooth UX and preventing flash-loading.
  - Extract the data-fetching logic into a reusable `useCallback`.
  - Recommended Pattern:
    ```ts
    const fetchData = useCallback(async () => {
      setLoading(true);
      try {
        const response = await apiFunction({...pagination});
        const pageData = response.data.data;
        setData(pageData.content);
        setTotalElements(pageData.totalElements);
      } catch (error) {
        handleError(error, "Default Error Message.");
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }, [pagination]);
    ```
- **Error Handling:** ALWAYS call `handleError(error, "Error message")` from `@/lib/utils` rather than manually logging to console or invoking toast directly.
- **Pagination:** Utilize the custom hook `usePaginationState()` (which returns `pagination`, `onPageChange`, `onSizeChange`) to supply pagination metrics into Table components.

## 7. Custom Implementation Highlights
- **Product Quick Order Flow:** Replaced direct API add-to-cart clicks with a unified `QuickOrderModal` UI. It integrates from list pages (like Shop or Related Products) to show a split 2-column layout (Image on left, Scrollable Options/Toppings on right) on desktop. This overrides default Shadcn UI constraints (`sm:!max-w-[90vw] md:!max-w-4xl lg:!max-w-5xl`) and provides a more immersive "Quick Add" experience without needing to navigate to the detailed product page.
