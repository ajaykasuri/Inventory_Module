import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { store } from "./store";
import { bootstrap } from "./store/authSlice";
import "./styles/base.css";
import "./styles/landing.css";
import "./styles/app.css";

// Restore the session (if any) before the user sees a protected page.
store.dispatch(bootstrap());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
