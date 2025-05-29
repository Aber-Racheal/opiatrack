// 'use client'

// import { useState, ChangeEvent, FormEvent, useEffect } from "react";
// import CryptoJS from "crypto-js";
// import AuthForm from "../components/AuthForm";
// import { useRouter } from "next/navigation";

// export default function OfflineLogin() {
//   const router = useRouter();
//   const [pin, setPin] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // If there's no stored passcode, redirect to login
//     if (!localStorage.getItem("offline_passcode_hash")) {
//       router.push("/login");
//     }
//   }, []);

//   const handleSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     const storedHash = localStorage.getItem("offline_passcode_hash");
//     const enteredHash = CryptoJS.SHA256(pin).toString();

//     if (enteredHash === storedHash) {
//       // Fake login, allow access to offline dashboard
//       localStorage.setItem("offline_access_granted", "true");
//       router.push("/dashboard"); // your offline-friendly page
//     } else {
//       setError("Incorrect passcode.");
//     }
//   };

//   return (
//     <AuthForm title="Offline Login">
//       {error && <p className="text-red-500 mb-2">{error}</p>}
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="password"
//           inputMode="numeric"
//           maxLength={4}
//           placeholder="Enter your 4-digit PIN"
//           className="input"
//           value={pin}
//           onChange={(e: ChangeEvent<HTMLInputElement>) => setPin(e.target.value)}
//           required
//         />
//         <button type="submit" className="btn">Login Offline</button>
//       </form>
//     </AuthForm>
//   );
// }
