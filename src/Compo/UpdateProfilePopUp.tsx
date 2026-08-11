import  { useState } from 'react';
import { Link } from 'react-router-dom';

const UpdateProfilePopUp = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-900">Complete Your Profile</h2>
        <p className="mt-2 text-sm text-slate-500">
          Please update your profile to continue using all features.
        </p>

        <Link
          to="/edit-profile"
          onClick={() => setIsOpen(false)}
          className="mt-5 inline-flex w-full justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Update Profile
        </Link>
      </div>
    </div>
  );
};

export default UpdateProfilePopUp;