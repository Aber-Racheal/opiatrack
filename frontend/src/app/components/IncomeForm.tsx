'use client';

import { useState } from 'react';
import { addToStore, STORE_NAMES } from '@/lib/idb';  // Import IndexedDB helpers
import { Income } from '@/types/income';  // Import the Income type
import { useRouter } from 'next/navigation';  // For navigation after form submission

const IncomeForm = () => {
  const [amount, setAmount] = useState<number>(0);
  const [source, setSource] = useState<string>('');
  const [dateReceived, setDateReceived] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string>('');
  const router = useRouter();  // To navigate after successful form submission

  // Helper function to save income to IndexedDB
  const saveIncome = async (income: Income) => {
    try {
      // Save to IndexedDB directly without any need for casting
      await addToStore<Income>(STORE_NAMES.INCOME, income);
      console.log('Income saved to IndexedDB');
    } catch (err) {
      console.error('Failed to save income:', err);
    }
  };

  // Submit form logic
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate form inputs
    if (!amount || !source || !dateReceived) {
      setError('All fields are required');
      return;
    }

    const newIncome: Income = {
      amount,
      source,
      date_received: dateReceived,
      is_synced: false,  // Set to false until it's synced with the backend
    };

    try {
      // Save income to IndexedDB
      await saveIncome(newIncome);

      // If online, try syncing income to the backend
      if (navigator.onLine) {
        // Assuming syncIncome is a function you already have for syncing to the backend
        await syncIncome(newIncome);
      }

      // Navigate to the dashboard or another page after successful submission
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred while saving income');
    }
  };

  return (
    <div>
      <h2>Add New Income</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="source">Source of Income</label>
          <input
            type="text"
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
        </div>

        <div>
          <label htmlFor="dateReceived">Date Received</label>
          <input
            type="date"
            id="dateReceived"
            value={dateReceived}
            onChange={(e) => setDateReceived(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit">Save Income</button>
      </form>
    </div>
  );
};

export default IncomeForm;
function syncIncome(newIncome: Income) {
    throw new Error('Function not implemented.');
}

