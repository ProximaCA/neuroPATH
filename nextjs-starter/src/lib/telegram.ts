import { useEffect, useState } from 'react';

// Telegram Web App types
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
    query_id?: string;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    setParams(params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }): void;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  ready(): void;
  expand(): void;
  close(): void;
  sendData(data: string): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }, callback?: (buttonId: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  showScanQrPopup(params: {
    text?: string;
  }, callback?: (text: string) => boolean): void;
  closeScanQrPopup(): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Hook to use Telegram Web App
export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're running in Telegram Web App environment
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Initialize Telegram Web App
      tg.ready();
      tg.expand();
      
      setWebApp(tg);
      setUser(tg.initDataUnsafe.user || null);
      setIsLoading(false);
      
      // Set theme colors
      if (tg.themeParams.bg_color) {
        document.documentElement.style.setProperty('--tg-bg-color', tg.themeParams.bg_color);
      }
      if (tg.themeParams.text_color) {
        document.documentElement.style.setProperty('--tg-text-color', tg.themeParams.text_color);
      }
    } else {
      // Development mode - create mock user
      setUser({
        id: 123456789,
        first_name: 'Тест',
        last_name: 'Пользователь',
        username: 'test_user',
        language_code: 'ru'
      });
      setIsLoading(false);
    }
  }, []);

  return { webApp, user, isLoading };
}

// Utility functions
export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}

export function getTelegramUser(): TelegramUser | null {
  if (!isTelegramWebApp()) {
    // Return mock user for development
    return {
      id: 123456789,
      first_name: 'Тест',
      last_name: 'Пользователь',
      username: 'test_user',
      language_code: 'ru'
    };
  }
  
  return window.Telegram?.WebApp.initDataUnsafe.user || null;
}

export function validateTelegramWebAppData(initData: string): boolean {
  // In production, you should validate the hash against your bot token
  // For now, we'll just check if initData exists
  return !!initData;
}

// Theme utilities
export function applyTelegramTheme() {
  if (!isTelegramWebApp()) return;
  
  const tg = window.Telegram!.WebApp;
  const root = document.documentElement;
  
  // Apply Telegram theme colors to CSS variables
  if (tg.themeParams.bg_color) {
    root.style.setProperty('--background', tg.themeParams.bg_color);
  }
  if (tg.themeParams.text_color) {
    root.style.setProperty('--foreground', tg.themeParams.text_color);
  }
  if (tg.themeParams.button_color) {
    root.style.setProperty('--primary', tg.themeParams.button_color);
  }
  if (tg.themeParams.button_text_color) {
    root.style.setProperty('--primary-foreground', tg.themeParams.button_text_color);
  }
}

// Haptic feedback utilities
export function triggerHaptic(type: 'impact' | 'notification' | 'selection', style?: string) {
  if (!isTelegramWebApp()) return;
  
  const tg = window.Telegram!.WebApp;
  
  switch (type) {
    case 'impact':
      tg.HapticFeedback.impactOccurred(style as any || 'medium');
      break;
    case 'notification':
      tg.HapticFeedback.notificationOccurred(style as any || 'success');
      break;
    case 'selection':
      tg.HapticFeedback.selectionChanged();
      break;
  }
} 