declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let initted = false;
let currentId = "";

function injectScript(id: string) {
  if (typeof document === "undefined") return;
  const existing = document.querySelector(
    `script[src*="gtag/js?id=${id}"]`,
  );
  if (existing) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
}

export function initGA(measurementId: string | undefined) {
  if (typeof window === "undefined") {
    return;
  }

  if (!measurementId) {
    console.warn("[GA] Missing Measurement ID");
    return;
  }

  if (initted && currentId === measurementId && typeof window.gtag === "function") {
    return;
  }

  injectScript(measurementId);

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer.push(args);
    };
  }

  window.gtag("consent", "update", {
    ad_storage: "granted",
    analytics_storage: "granted",
  });

  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });

  initted = true;
  currentId = measurementId;
  console.log("[GA] initialized with", measurementId);
}

export function trackPageview() {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;

  gtag("event", "page_view", {
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    page_title: document.title,
  });
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;

  gtag("event", name, params);
}

export {};
