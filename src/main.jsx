import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { NotificationProvider } from "./context/notificationContext";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { ChatProvider } from "./context/ChatContext";
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })


ReactDOM.createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId="731691100570-faf3q9qdv2fri5d2m055d8bedp667vqp.apps.googleusercontent.com">
      <BrowserRouter>
        <NotificationProvider>
          <ChatProvider>
          <App />
            <Toaster position="top-left" />
          </ChatProvider>
        </NotificationProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
);
