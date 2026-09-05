"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AuthModal } from "@/components/auth/auth-modal";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  requireAuth: (actionDescription: string, callback: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalActionDescription, setModalActionDescription] = useState("");
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const login = (token: string) => {
    // In a real app, save token to cookies/localStorage
    setIsAuthenticated(true);
    setIsModalOpen(false);
    
    // Execute pending action if any
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const requireAuth = (actionDescription: string, callback: () => void) => {
    if (isAuthenticated) {
      callback();
    } else {
      setModalActionDescription(actionDescription);
      setPendingCallback(() => callback);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPendingCallback(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, requireAuth }}>
      {children}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        actionDescription={modalActionDescription} 
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
