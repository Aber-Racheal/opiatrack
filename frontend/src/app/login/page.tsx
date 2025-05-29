'use client';

import { useState, ChangeEvent, FormEvent } from "react";
import AuthForm from "../components/AuthForm";
import { useRouter } from "next/navigation";
import { addToStore, STORE_NAMES } from "@/lib/idb";

interface LoginForm {
  username: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ username: "", password: "" });
  const [error, setError] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        setError("Invalid credentials. Please try again.");
        return;
      }

      const data = await res.json();
      const token = data.access;

      // Save to localStorage (for immediate use)
      localStorage.setItem("token", token);

      // Also save to IndexedDB for service worker access
      await addToStore(STORE_NAMES.AUTH, {
        id: "user-token",
        token,
      });

      router.push("/setPasscode"); 
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again later.");
    }
  };

  return (
    <AuthForm title="Login">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="username" onChange={handleChange} placeholder="Username" className="input" required />
        <input type="password" name="password" onChange={handleChange} placeholder="Password" className="input" required />
        <button type="submit" className="btn">Login</button>
      </form>
    </AuthForm>
  );
}
