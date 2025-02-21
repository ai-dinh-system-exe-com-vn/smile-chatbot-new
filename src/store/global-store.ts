import { create } from "zustand";

// Helper function to safely get localStorage values
const getLocalStorageValue = (key: string): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key) || "";
  }
  return "";
};

// Helper function to safely set localStorage values
const setLocalStorageValue = (key: string, value: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};

interface GlobalState {
  globalApiKey: string;
  globalPersona: string;
  globalCustomInstructions: string;
  setGlobalApiKey: (apiKey: string) => void;
  setGlobalPersona: (persona: string) => void;
  setGlobalCustomInstructions: (instructions: string) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  // Global settings with initial values from localStorage
  globalApiKey: getLocalStorageValue("apiKey"),
  globalPersona: getLocalStorageValue("persona"),
  globalCustomInstructions: getLocalStorageValue("customInstructions"),

  // Global setting setters that sync with localStorage
  setGlobalApiKey: (apiKey: string) => {
    setLocalStorageValue("apiKey", apiKey);
    set({ globalApiKey: apiKey });
  },

  setGlobalPersona: (persona: string) => {
    setLocalStorageValue("persona", persona);
    set({ globalPersona: persona });
  },

  setGlobalCustomInstructions: (instructions: string) => {
    setLocalStorageValue("customInstructions", instructions);
    set({ globalCustomInstructions: instructions });
  },
}));