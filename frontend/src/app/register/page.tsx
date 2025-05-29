'use client'

import { useState, ChangeEvent, FormEvent } from "react";
import AuthForm from "../components/AuthForm";
import { useRouter } from "next/navigation";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");  // Clear error on input change for better UX
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Frontend validation: check passwords match before sending
    if (form.password !== form.password2) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/users/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Register error response:", data);

        // Show all error messages from backend combined into one string
        const messages = Object.values(data)
          .flat()
          .join(" ");

        setError(messages || "Registration failed.");
        return;
      }

      // Success → redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <AuthForm title="Register">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="username"
          onChange={handleChange}
          placeholder="Username"
          className="input"
          required
          value={form.username}
        />
        <input
          type="email"
          name="email"
          onChange={handleChange}
          placeholder="Email"
          className="input"
          required
          value={form.email}
        />
        <input
          type="password"
          name="password"
          onChange={handleChange}
          placeholder="Password"
          className="input"
          required
          value={form.password}
        />
        <input
          type="password"
          name="password2"
          onChange={handleChange}
          placeholder="Confirm Password"
          className="input"
          required
          value={form.password2}
        />
        <button type="submit" className="btn">
          Register
        </button>
      </form>
    </AuthForm>
  );
}
