'use client'

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import CryptoJS from "crypto-js";
import AuthForm from "./AuthForm";

export default function SetPasscode() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (pin.length !== 4 || isNaN(Number(pin))) {
      setError("PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }

    const hashed = CryptoJS.SHA256(pin).toString();
    localStorage.setItem("offline_passcode_hash", hashed);

    router.push("/dashboard"); // or your main page
  };

  return (
    <AuthForm title="Set Offline Passcode">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="Enter 4-digit PIN"
          className="input"
          value={pin}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPin(e.target.value)}
          required
        />
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="Confirm PIN"
          className="input"
          value={confirmPin}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPin(e.target.value)}
          required
        />
        <button type="submit" className="btn">Save Passcode</button>
      </form>
    </AuthForm>
  );
}
