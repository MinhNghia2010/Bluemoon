"use client";

import { useState, useEffect } from "react";
import { DarkModeToggle } from "./shared/DarkModeToggle";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Apply dark mode from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('bluemoon-theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username, password);
      toast.success(`Welcome back!`);
    } catch (err: any) {
      setError(err.message || "Invalid username or password");
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-page">
      {/* Dark Mode Toggle - Fixed Top Right */}
      <div className="fixed top-8 right-8 z-50">
        <DarkModeToggle />
      </div>

      {/* Centered Login Card */}
      <div className="w-full max-w-[450px] mx-auto px-6">
        <div className="bg-bg-white rounded-lg p-12 shadow-lg border border-border-light">
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/images/Logo.png"
              alt="BlueMoon Logo"
              className="size-12"
            />
            <div>
              <p className="text-2xl font-semibold text-text-primary">
                BlueMoon
              </p>
              <p className="text-sm text-text-secondary">v2.0</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Login
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Apartment Fee Management System
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                className="input-default text-sm h-11 bg-input-bg border-0 focus:ring-2 focus:ring-brand-primary text-text-primary"
                placeholder="Enter username"
                disabled={isLoading}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="input-default text-sm h-11 bg-input-bg border-0 focus:ring-2 focus:ring-brand-primary text-text-primary"
                placeholder="Enter password"
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-xs text-error mb-4">{error}</p>
            )}

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-light">
            <p className="text-sm text-text-secondary text-center">
              Demo credentials:{" "}
              <span className="text-brand-primary font-medium">
                admin / admin123
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
