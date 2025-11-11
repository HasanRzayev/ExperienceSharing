import './setupProcessEnv';

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
// Ensure axios interceptors are registered once at app startup
import './services/axiosSetup';

// Set API base URL for .NET backend
if (!process.env.REACT_APP_API_BASE_URL) {
  process.env.REACT_APP_API_BASE_URL = "https://experiencesharingbackend.runasp.net/api";
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Performance monitoring - send to analytics in production
reportWebVitals((metric) => {
  // Send to analytics endpoint in production
  if (process.env.NODE_ENV === 'production') {
    // Example: send to Google Analytics
    // window.gtag('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_category: 'Web Vitals',
    //   event_label: metric.id,
    //   non_interaction: true,
    // });
    
    // For now, just log in production for debugging
    console.log(metric);
  } else {
    // Log in development
    console.log(metric);
  }
});

// Service worker disabled for now to reduce bundle size
// serviceWorkerRegistration.register();
