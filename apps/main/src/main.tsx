import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import keycloak from "./lib/keycloak.ts";
import { store, setAuthFailure, clearAuth } from "@/features/store";
import { initKeycloakSession } from "@/lib/auth-init";
import "./index.css";
import LoadingScreen from "./components/custom/LoadingScreen.tsx";
import { initializeAuthStatus } from "./features/auth/authThunk.ts";

const root = createRoot(document.getElementById("root")!);

const bootstrap = async () => {
  root.render(<LoadingScreen title="Tea4Life" subtitle="Đang khởi tạo..." />);

  try {
    await initKeycloakSession();

    if (keycloak.authenticated) {
      await store.dispatch(initializeAuthStatus());
    } else {
      store.dispatch(clearAuth());
    }
  } catch (err) {
    console.error("[Tea4Life] Khởi tạo thất bại:", err);
    store.dispatch(setAuthFailure());
  } finally {
    root.render(
      <StrictMode>
        <Provider store={store}>
          <App />
        </Provider>
      </StrictMode>,
    );
  }
};
bootstrap();
