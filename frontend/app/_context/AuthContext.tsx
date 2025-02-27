"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface User {
  email: string;
  username: string;
  academic: string;
  age: number;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, "id"> & { password: string }) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser: User = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("https://fix-it-afxt.onrender.com/u/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      if (!res.ok) {
        throw new Error("Login failed");
      }
  
      const { token } = await res.json();

      const decodedUser: User = jwtDecode(token);
  
      setUser(decodedUser);
      localStorage.setItem("token", token);
  
      router.push("/");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  // const login = async (email: string, password: string) => {
  //   try {
  //     const res = await fetch("https://fix-it-afxt.onrender.com/u/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     if (!res.ok) {
  //       throw new Error("Login failed");
  //     }

  //     const userData = await res.json();
  //     setUser(userData);

  //     localStorage.setItem("token", userData.token);

  //     router.push("/");
  //   } catch (error) {
  //     console.error(
  //       error instanceof Error ? error.message : "An unknown error occurred"
  //     );
  //   }
  // };

  // Signup function
  const signup = async (userData: Omit<User, "id"> & { password: string }) => {
    try {
      const res = await fetch("https://fix-it-afxt.onrender.com/u/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        throw new Error("Signup failed");
      }

      router.push("/signin");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    router.push("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

