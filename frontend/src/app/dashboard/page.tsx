'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logoutUser } from '@/lib/auth';
// import IncomePage from '../components/IncomeForm';
// import ExpenseForm from '../components/ExpenseForm';
import toast, { Toaster } from 'react-hot-toast';
import IncomeForm from '../components/IncomeForm';
import CryptoJS from 'crypto-js';



export default function Dashboard() {
   console.log('Dashboard component rendering');
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [offlineAccessGranted, setOfflineAccessGranted] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Dashboard checkAuth: Online?', navigator.onLine);

      if (navigator.onLine) {
        const stored = getToken();
        console.log('Token from localStorage:', stored);
        if (!stored) {
          setCheckingAuth(false);
          console.log('No token found, redirecting to login...');
          router.push('/login');
          return;
        }
        setToken(stored);
        setCheckingAuth(false);
      } else {
        const passcodeHash = localStorage.getItem('offline_passcode_hash');
        const offlineAccess = localStorage.getItem('offline_access_granted');
        console.log('Offline passcodeHash:', passcodeHash);
        console.log('Offline access granted:', offlineAccess);

        if (!passcodeHash) {
          setCheckingAuth(false);
          toast.error('You must be online to log in/register and set your offline passcode.');
          console.log('No offline passcode hash found, redirecting to login...');
          setTimeout(() => router.push('/login'), 500);
          return;
        }

        if (offlineAccess === 'true') {
          setOfflineAccessGranted(true);
          setCheckingAuth(false);
          console.log('Offline access already granted.');
        } else {
          setOfflineMode(true);
          setCheckingAuth(false);
          console.log('Offline access NOT granted. Prompting for passcode.');
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (!confirmed) return;

    await logoutUser();
    localStorage.removeItem('offline_access_granted'); // Clear offline access
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleOfflineLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedHash = localStorage.getItem('offline_passcode_hash');
    const enteredHash = CryptoJS.SHA256(pin.trim()).toString();

    console.log('Attempt offline login. Entered hash:', enteredHash);
    console.log('Stored hash:', storedHash);

    if (enteredHash === storedHash) {
      localStorage.setItem('offline_access_granted', 'true');
      setOfflineAccessGranted(true);
      setOfflineMode(false);
      setError('');
      console.log('Offline passcode correct, access granted.');
    } else {
      setError('Incorrect passcode.');
      console.log('Incorrect offline passcode entered.');
    }
  };

  if (checkingAuth) return <p>Loading...</p>;

  if (offlineMode && !offlineAccessGranted) {
    // Offline passcode prompt
    return (
      <div className="p-4 max-w-sm mx-auto">
        <Toaster position="top-center" />
        <h2 className="text-xl font-bold mb-4">Offline Login</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <form onSubmit={handleOfflineLogin} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="Enter your 4-digit PIN"
            className="input"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />
          <button type="submit" className="btn w-full">
            Login Offline
          </button>
        </form>
      </div>
    );
  }

  if (!token && !offlineAccessGranted) {
    // No token and no offline access → show nothing or loading
    return <p>Redirecting to login...</p>;
  }

  // Logged in online or offline access granted
  return (
    <div className="p-4">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-bold mb-4">Welcome to your dashboard</h1>
 
      <IncomeForm />
      {/* <ExpenseForm />  */}
      {/* <IncomeList/> */}

      <button onClick={handleLogout} className="btn text-red-500 mt-6">
        Log Out
      </button>
    </div>
  );
}
