import "./theme.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { applyTheme, getStoredTheme } from "./utils/theme";
import { captureReferralFromUrl } from "./utils/referral";
import { ClerkProvider } from "@clerk/react";

import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducer";

applyTheme(getStoredTheme());
captureReferralFromUrl();

const store = configureStore({
  reducer: rootReducer,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
const clerkPublishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error("REACT_APP_CLERK_PUBLISHABLE_KEY is not set. Add it to the root .env file.");
}

const app = (
  <Provider store={store}>
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  </Provider>
);

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>{app}</ClerkProvider>
  </React.StrictMode>
);
