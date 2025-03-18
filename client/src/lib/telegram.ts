declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void;
        expand(): void;
        close(): void;
      };
    };
  }
}

export function initTelegramApp() {
  if (window.Telegram) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }
}
