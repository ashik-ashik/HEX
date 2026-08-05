import React, { useState } from 'react';
import  useAuth  from '../hooks/useAuth';



const AddPhoneNumberPop = () => {
  const { user } = useAuth() as { user: { email: string } | null };
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true);

  if (!isModalOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!user?.email) {
      setError('Unable to submit without a logged in user.');
      setStatus('error');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Phone number is required.');
      setStatus('error');
      return;
    }

    setStatus('sending');

    const body = new URLSearchParams({
        type: "addPhoneNumber",
      email: user.email,
      phone: phoneNumber.trim(),
    });

    try {
      const response = await fetch(import.meta.env.VITE_ADD_MEMBER_PHONE_NUMBER_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to save phone number.');
      }

      setStatus('success');
      setPhoneNumber('');
      setIsModalOpen(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to submit phone number. Please try again.'
      );
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
      <div className="w-full h-full overflow-auto sm:h-auto sm:max-w-lg sm:rounded-3xl bg-white shadow-2xl">
        <div className="flex h-full flex-col justify-between p-6 sm:h-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Add Phone Number</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add your phone number so that other members can contact you.
              </p>
            </div>
            <button
              type="button"
              onClick={setIsModalOpen.bind(null, false)}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex-1 sm:mt-8">
            <label className="block text-sm font-medium text-slate-700">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              maxLength={11}
              placeholder="Like 015XXXXXXXX"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white text-xs"
            />

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {status === 'sending' ? 'Saving...' : 'Save Phone Number'}
              </button>
              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : status === 'success' ? (
                <p className="text-sm text-emerald-600">Phone number added successfully.</p>
              ) : null}
            </div>
          </form>

          <div className="mt-6 text-xs text-slate-500 sm:mt-8">
            <p>
              Your phone number will be kept private and will not be shared with non-members users  .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPhoneNumberPop;
