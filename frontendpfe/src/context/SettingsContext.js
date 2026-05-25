import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createTranslator } from "../i18n";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("appTheme") || "light");
  const [language, setLanguage] = useState(() => localStorage.getItem("appLanguage") || "fr");

  useEffect(() => {
    localStorage.setItem("appTheme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("appLanguage", language);
    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
  }, [language]);

  const value = useMemo(() => {
    const t = createTranslator(language);
    return {
      theme,
      setTheme,
      language,
      setLanguage,
      t,
      toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
    };
  }, [theme, language]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
