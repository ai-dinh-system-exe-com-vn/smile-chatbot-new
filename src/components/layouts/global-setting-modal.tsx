"use client";

import { useGlobalStore } from "@/store/global-store";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { Modal } from "../ui/modal";

export function GlobalSettingModal() {
  const [apiKey, setApiKey] = useState("");
  const [persona, setPersona] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useQueryState(
    "isOpenGlobalSettingModal",
    parseAsBoolean.withDefault(false)
  );
  const [isInitialSetup, setIsInitialSetup] = useState(false);

  const {
    globalApiKey,
    globalPersona,
    globalCustomInstructions,
    setGlobalApiKey,
    setGlobalPersona,
    setGlobalCustomInstructions,
  } = useGlobalStore();

  useEffect(() => {
    const savedApiKey = localStorage.getItem("apiKey");
    if (!savedApiKey) {
      setIsInitialSetup(true);
      setIsOpen(true);
    } else {
      setIsInitialSetup(false);
    }
  }, []);

  // Initialize with global API key
  useEffect(() => {
    if (globalApiKey) {
      setApiKey(globalApiKey);
    }
  }, [globalApiKey]);

  useEffect(() => {
    if (globalPersona) {
      setPersona(globalPersona);
    }
  }, [globalPersona]);

  useEffect(() => {
    if (globalCustomInstructions) {
      setCustomInstructions(globalCustomInstructions);
    }
  }, [globalCustomInstructions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      const trimmedKey = apiKey.trim();
      setGlobalApiKey(trimmedKey);
      setGlobalPersona(persona);
      setGlobalCustomInstructions(customInstructions);
    }
  };

  // Only show if open, and for initial setup only if no API key exists
  if (!isOpen || (isInitialSetup && localStorage.getItem("apiKey"))) {
    return null;
  }

  return (
    <>
      {/* Black overlay only for initial setup */}
      {isInitialSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (!isInitialSetup) {
            setGlobalPersona(persona);
            setGlobalCustomInstructions(customInstructions);
            setIsOpen(false);
          }
        }}
        title={isInitialSetup ? "Configuration" : "Settings"}
        showCloseButton={!isInitialSetup}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">API Key</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input input-bordered w-full pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <BsEyeSlash className="w-5 h-5 opacity-50 hover:opacity-100 transition-opacity" />
                ) : (
                  <BsEye className="w-5 h-5 opacity-50 hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
            <label className="label">
              <span className="label-text-alt">
                Your API key is stored locally and never sent to our servers
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Global Persona Information
              </span>
            </label>
            <p className="text-sm text-base-content/70 mb-2">
              Add details about yourself to help tailor the conversation
            </p>
            <textarea
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="Example: You're a software developer working on web applications..."
              className="textarea textarea-bordered min-h-[100px] w-full"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Global Custom Instructions
              </span>
            </label>
            <p className="text-sm text-base-content/70 mb-2">
              Add specific instructions for how responses should be formatted
            </p>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Example: Please provide code examples in TypeScript..."
              className="textarea textarea-bordered min-h-[100px] w-full"
            />
          </div>

          <div className="modal-action">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!apiKey.trim()}
            >
              Save Changes
            </button>
          </div>

          <div className="text-xs text-base-content/70 mt-4">
            <p>
              Your settings are stored securely in your browser's local storage.
              The API key is only used to make requests to OpenAI's API directly
              from your browser.
            </p>
          </div>
        </form>
      </Modal>
    </>
  );
}
