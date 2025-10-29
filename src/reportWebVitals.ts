import { ReportHandler } from "web-vitals";

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ getCLS, getFCP, getLCP, getTTFB, onINP }) => {
      getCLS(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
      // Use INP (Interaction to Next Paint) - replacement for FID
      onINP(onPerfEntry);
    });
  }
};

export default reportWebVitals;
