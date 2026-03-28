import * as SecureStore from "expo-secure-store";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import { en } from "@/i18n/en";
import { pl, type Translations } from "@/i18n/pl";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Language = "pl" | "en";

interface LanguageContextValue {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const STORAGE_KEY = "app_language";

const TRANSLATIONS: Record<Language, Translations> = { pl, en };

const LanguageContext = createContext<LanguageContextValue>({
  language: "pl",
  t: pl,
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pl");

  // Load persisted preference on mount
  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((stored) => {
        if (stored === "pl" || stored === "en") {
          setLanguageState(stored);
        }
      })
      .catch(() => {});
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    SecureStore.setItemAsync(STORAGE_KEY, lang).catch(() => {});
  }, []);

  return (
    <LanguageContext.Provider
      value={{ language, t: TRANSLATIONS[language], setLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
