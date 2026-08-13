
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  GraduationCap,
  HeartPulse,
  MapPin,
  Phone,
  Save,
  UserRound,
  BookOpen,
  CalendarDays,
  Building2,
  Droplets,
  BedSingle,
} from 'lucide-react';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const LAST_DEGREES: string[] = [
  'SSC / Dakhil',
  'HSC / Alim',
  'Diploma',
  "Honours / Bachelor's",
  "Master's",
  'MPhil',
  'PhD',
  'Other',
];

const HOME_DISTRICTS: string[] = [
  'Bagerhat',
  'Bandarban',
  'Barguna',
  'Barisal',
  'Bhola',
  'Bogura',
  'Brahmanbaria',
  'Chandpur',
  'Chattogram',
  'Chuadanga',
  'Comilla',
  "Cox's Bazar",
  'Dhaka',
  'Dinajpur',
  'Faridpur',
  'Feni',
  'Gaibandha',
  'Gazipur',
  'Gopalganj',
  'Habiganj',
  'Jamalpur',
  'Jashore',
  'Jhalokati',
  'Jhenaidah',
  'Joypurhat',
  'Khagrachhari',
  'Khulna',
  'Kishoreganj',
  'Kurigram',
  'Kushtia',
  'Lakshmipur',
  'Lalmonirhat',
  'Madaripur',
  'Magura',
  'Manikganj',
  'Meherpur',
  'Moulvibazar',
  'Munshiganj',
  'Mymensingh',
  'Naogaon',
  'Narail',
  'Narayanganj',
  'Narsingdi',
  'Natore',
  'Netrokona',
  'Nilphamari',
  'Noakhali',
  'Pabna',
  'Panchagarh',
  'Patuakhali',
  'Pirojpur',
  'Rajbari',
  'Rajshahi',
  'Rangamati',
  'Rangpur',
  'Satkhira',
  'Shariatpur',
  'Sherpur',
  'Sirajganj',
  'Sunamganj',
  'Sylhet',
  'Tangail',
  'Thakurgaon',
  'Chapainawabganj',
];

const BLOOD_GROUPS: string[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'Unknown',
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProfileFormState {
  phone: string;
  university: string;
  department: string;
  session: string;
  degree: string;
  degreeOther: string;
  district: string;
  bloodGroup: string;
  room: string;
}

const initialFormState: ProfileFormState = {
  phone: '',
  university: '',
  department: '',
  session: '',
  degree: '',
  degreeOther: '',
  district: '',
  bloodGroup: '',
  room: ''
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const UpdateProfilePage = () => {
  const { user, setUsersList, usersList } = useAuth() as {
    user: { email: string };
    setUsersList: (users: any[]) => void;
    usersList: any[];
  };


  const navigate = useNavigate();

  const [form, setForm] =
    useState<ProfileFormState>(initialFormState);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // -------------------------------------------------------------------------
  // Current user
  // -------------------------------------------------------------------------

  const currentUser = usersList?.find(
    (u) => u.email === user?.email
  );

  // -------------------------------------------------------------------------
  // Load existing profile information
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!currentUser) return;

    const existingDegree =
      currentUser.degree ??
      currentUser.lastDegree ??
      '';

    const degreeExistsInList =
      LAST_DEGREES.includes(existingDegree);

    setForm({
      phone:
        currentUser.phone ??
        currentUser.phoneNumber ??
        '',

      university:
        currentUser.university ??
        currentUser.universityName ??
        '',

      department:
        currentUser.department ??
        '',

      session:
        currentUser.session ??
        '',

      degree: degreeExistsInList
        ? existingDegree
        : existingDegree
          ? 'Other'
          : '',

      degreeOther: degreeExistsInList
        ? ''
        : existingDegree,

      district:
        currentUser.homeDistrict ??
        currentUser.district ??
        '',

      bloodGroup:
        currentUser.bloodGroup ??
        '',
      room:
        currentUser.room ??
        '',
    });
  }, [currentUser]);

  // -------------------------------------------------------------------------
  // Update field
  // -------------------------------------------------------------------------

  const updateField = <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  const validate = (): string | null => {
    if (!user?.email) {
      return 'Unable to submit without a logged in user.';
    }

    if (!form.phone.trim()) {
      return 'Phone number is required.';
    }

    if (!form.university.trim()) {
      return 'University / College name is required.';
    }

    if (!form.department.trim()) {
      return 'Department name is required.';
    }

    if (!form.session.trim()) {
      return 'Session is required.';
    }

    if (!form.degree) {
      return 'Please select your last educational degree.';
    }

    if (
      form.degree === 'Other' &&
      !form.degreeOther.trim()
    ) {
      return 'Please enter your last educational degree.';
    }

    if (!form.district) {
      return 'Please select your home district.';
    }
    if (!form.room) {
      return 'Please select your ROOM.';
    }

    return null;
  };

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    const toastId = toast.loading('Saving profile...');

    const finalDegree =
      form.degree === 'Other'
        ? form.degreeOther.trim()
        : form.degree;

    const updatedProfile = {
      phone: form.phone.trim(),

      university: form.university.trim(),

      department: form.department.trim(),

      session: form.session.trim(),

      degree: finalDegree,

      homeDistrict: form.district,

      bloodGroup: form.bloodGroup,
      room: form.room,
    };

    const body = new URLSearchParams({
      type: 'addPhoneNumber',

      email: user.email || '',

      phoneNumber: updatedProfile.phone,

      university: updatedProfile.university,

      department: updatedProfile.department,

      session: updatedProfile.session,

      degree: updatedProfile.degree,

      homeDistrict: updatedProfile.homeDistrict,

      bloodGroup: updatedProfile.bloodGroup,
      room: updatedProfile.room,
    });

    try {
      const response = await fetch(
        import.meta.env.VITE_UPDATE_MEMBER_PROFILE_API,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded',
          },

          body: body.toString(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile.');
      }

      const result = await response.json();
      console.log(result)

      if (result === 'success') {
        toast.success(
          result.message ??
            'Profile updated successfully.',
          {
            id: toastId,
          }
        );

        // ---------------------------------------------------------------
        // Update current user inside usersList
        // ---------------------------------------------------------------

        const updatedUsersList = usersList.map(
          (existingUser) => {
            if (
              existingUser.email === user?.email
            ) {
              return {
                ...existingUser,

                ...updatedProfile,

                phoneNumber:
                  updatedProfile.phone,
              };
            }

            return existingUser;
          }
        );

        setUsersList(updatedUsersList);

        // Navigate after successful update
        setTimeout(() => {
          navigate('/member-profile');
        }, 500);
      } else {
        toast.error(
          result.message ??
            'Unable to update profile.',
          {
            id: toastId,
          }
        );
      }
    } catch (submitError) {
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to update profile. Please try again.',
        {
          id: toastId,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // UI classes
  // -------------------------------------------------------------------------

  const inputClass =
    'peer w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10';

  const labelClass =
    'mb-2.5 block text-sm font-semibold text-slate-700';

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-3 py-6 sm:px-6 sm:py-10 lg:px-8">

        {/* --------------------------------------------------------------- */}
        {/* Toast */}
        {/* --------------------------------------------------------------- */}

        <Toaster
          position="top-right"
          containerStyle={{
            position: 'fixed',
            top: 90,
            right: 20,
            zIndex: 9999,
          }}
          toastOptions={{
            className:
              'text-xs rounded-xl shadow-lg',
          }}
        />

        <div className="mx-auto w-full max-w-3xl">

          {/* ============================================================= */}
          {/* Page Header */}
          {/* ============================================================= */}

          <div className="mb-6">

            <button
              type="button"
              onClick={() =>
                navigate('/member-profile')
              }
              className="group mb-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition-all duration-200 hover:bg-white hover:text-indigo-600 hover:shadow-sm"
            >
              <ArrowLeft
                size={17}
                className="transition-transform duration-200 group-hover:-translate-x-1"
              />

              Back to Profile
            </button>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-blue-700 p-6 shadow-xl shadow-indigo-200/50 sm:p-8">

              {/* Decorative elements */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />

              <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-blue-400/10" />

              <div className="relative flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-inner ring-1 ring-white/20 backdrop-blur-md">
                  <UserRound size={29} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-100">
                    Member Profile
                  </p>

                  <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    Edit Your Profile
                  </h1>

                  <p className="mt-1.5 text-sm text-indigo-100">
                    Update your information and keep your profile
                    current.
                  </p>
                </div>
              </div>

              <div className="relative mt-6 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur-sm">
                <CheckCircle2
                  size={17}
                  className="shrink-0 text-emerald-300"
                />

                <p className="text-xs font-medium text-indigo-50">
                  Your existing information has been loaded
                  automatically.
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* Form */}
          {/* ============================================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* =========================================================== */}
            {/* Contact Information */}
            {/* =========================================================== */}

            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">

              <div className="relative border-b border-slate-100 px-5 py-5 sm:px-7">

                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-500" />

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <Phone size={20} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Contact Information
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      How other members can contact you
                    </p>
                  </div>

                </div>
              </div>

              <div className="p-5 sm:p-7">

                <label className={labelClass}>
                  Phone Number
                  <span className="ml-1 text-rose-500">
                    *
                  </span>
                </label>

                <div className="group relative">

                  <Phone
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500"
                  />

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      updateField(
                        'phone',
                        e.target.value
                      )
                    }
                    maxLength={11}
                    placeholder="015XXXXXXXX"
                    className={`${inputClass} pl-11 pr-11`}
                  />

                  {form.phone && (
                    <Check
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
                    />
                  )}

                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Enter your active 11-digit mobile number.
                </p>

              </div>
            </section>

            {/* =========================================================== */}
            {/* Academic Information */}
            {/* =========================================================== */}

            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">

              <div className="relative border-b border-slate-100 px-5 py-5 sm:px-7">

                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-500 to-violet-500" />

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                    <GraduationCap size={21} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Academic Information
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Your educational background
                    </p>
                  </div>

                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-7">

                {/* ------------------------------------------------------- */}
                {/* University */}
                {/* ------------------------------------------------------- */}

                <div className="sm:col-span-2">

                  <label className={labelClass}>
                    University / College Name
                    <span className="ml-1 text-rose-500">
                      *
                    </span>
                  </label>

                  <div className="group relative">

                    <Building2
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500"
                    />

                    <input
                      type="text"
                      value={form.university}
                      onChange={(e) =>
                        updateField(
                          'university',
                          e.target.value
                        )
                      }
                      placeholder="Enter your university or college name"
                      className={`${inputClass} pl-11 pr-11`}
                    />

                    {form.university && (
                      <Check
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
                      />
                    )}

                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Enter the full name of your university or
                    college.
                  </p>

                </div>

                {/* ------------------------------------------------------- */}
                {/* Department */}
                {/* ------------------------------------------------------- */}

                <div>

                  <label className={labelClass}>
                    Department
                    <span className="ml-1 text-rose-500">
                      *
                    </span>
                  </label>

                  <div className="group relative">

                    <BookOpen
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500"
                    />

                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) =>
                        updateField(
                          'department',
                          e.target.value
                        )
                      }
                      placeholder="e.g. Computer Science"
                      className={`${inputClass} pl-11`}
                    />

                  </div>

                </div>

                {/* ------------------------------------------------------- */}
                {/* Session */}
                {/* ------------------------------------------------------- */}

                <div>

                  <label className={labelClass}>
                    Session
                    <span className="ml-1 text-rose-500">
                      *
                    </span>
                  </label>

                  <div className="group relative">

                    <CalendarDays
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500"
                    />

                    <input
                      type="text"
                      value={form.session}
                      onChange={(e) =>
                        updateField(
                          'session',
                          e.target.value
                        )
                      }
                      placeholder="e.g. 2021-22"
                      className={`${inputClass} pl-11`}
                    />

                  </div>

                </div>

                {/* ------------------------------------------------------- */}
                {/* Degree */}
                {/* ------------------------------------------------------- */}

                <div className="sm:col-span-2">

                  <label className={labelClass}>
                    Last Educational Degree
                    <span className="ml-1 text-rose-500">
                      *
                    </span>
                  </label>

                  <div className="group relative">

                    <GraduationCap
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      value={form.degree}
                      onChange={(e) => {
                        updateField(
                          'degree',
                          e.target.value
                        );

                        if (
                          e.target.value !== 'Other'
                        ) {
                          updateField(
                            'degreeOther',
                            ''
                          );
                        }
                      }}
                      className={`${inputClass} cursor-pointer appearance-none pl-11`}
                    >
                      <option value="">
                        Select your last educational degree
                      </option>

                      {LAST_DEGREES.map(
                        (degree) => (
                          <option
                            key={degree}
                            value={degree}
                          >
                            {degree}
                          </option>
                        )
                      )}
                    </select>

                  </div>

                  {form.degree === 'Other' && (
                    <div className="mt-3">

                      <input
                        type="text"
                        value={form.degreeOther}
                        onChange={(e) =>
                          updateField(
                            'degreeOther',
                            e.target.value
                          )
                        }
                        placeholder="Enter your educational degree"
                        className={inputClass}
                      />

                    </div>
                  )}

                </div>
              </div>
            </section>

            {/* =========================================================== */}
            {/* Personal Information */}
            {/* =========================================================== */}

            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">

              <div className="relative border-b border-slate-100 px-5 py-5 sm:px-7">

                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-rose-500 to-pink-500" />

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-100">
                    <HeartPulse size={20} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Personal Information
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Additional information about you
                    </p>
                  </div>

                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-7">

                {/* ------------------------------------------------------- */}
                {/* District */}
                {/* ------------------------------------------------------- */}

                <div>

                  <label className={labelClass}>
                    Home District
                    <span className="ml-1 text-rose-500">
                      *
                    </span>
                  </label>

                  <div className="group relative">

                    <MapPin
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500"
                    />

                    <input
                      type="text"
                      list="districtList"
                      value={form.district}
                      onChange={(e) =>
                        updateField(
                          'district',
                          e.target.value
                        )
                      }
                      placeholder="Type or select district"
                      className={`${inputClass} pl-11`}
                    />

                  </div>

                  <datalist id="districtList">
                    {HOME_DISTRICTS.map(
                      (district) => (
                        <option
                          key={district}
                          value={district}
                        />
                      )
                    )}
                  </datalist>

                </div>

                {/* ------------------------------------------------------- */}
                {/* Blood Group */}
                {/* ------------------------------------------------------- */}

                <div>

                  <label className={labelClass}>
                    Blood Group
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <div className="group relative">

                    <Droplets
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-rose-500"
                    />

                    <select
                      value={form.bloodGroup}
                      onChange={(e) =>
                        updateField(
                          'bloodGroup',
                          e.target.value
                        )
                      }
                      className={`${inputClass} cursor-pointer appearance-none pl-11`}
                    >
                      <option value="">
                        Select blood group
                      </option>

                      {BLOOD_GROUPS.map(
                        (group) => (
                          <option
                            key={group}
                            value={group}
                          >
                            {group}
                          </option>
                        )
                      )}
                    </select>

                  </div>

                </div>

                <div>

                  <label className={labelClass}>
                    Select Room
                  </label>

                  <div className="group relative">

                    <BedSingle
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-rose-500"
                    />

                    <select
                      value={form.room}
                      onChange={(e) =>
                        updateField(
                          'room',
                          e.target.value
                        )
                      }
                      required
                      className={`${inputClass} cursor-pointer appearance-none pl-11 capitalize`}
                    >
                      <option value="">
                        Select room
                      </option>

                      {['west: If you pay ৳ 2100','east: If you pay ৳ 3100', 'dynning: If you pay ৳ 1600'].map(
                        (group) => (
                          <option
                            key={group}
                            value={group.split(":")[0]}
                          >
                            {group}
                          </option>
                        )
                      )}
                    </select>

                  </div>

                </div>

              </div>
            </section>

            {/* =========================================================== */}
            {/* Save Card */}
            {/* =========================================================== */}

            <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 shadow-sm sm:p-7">

              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-100/50" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={18} />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      Profile ready to update
                    </h3>

                  </div>

                  <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                    Review your information before saving
                    your profile changes.
                  </p>

                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save
                        size={17}
                        className="transition-transform duration-200 group-hover:scale-110"
                      />
                      Save Changes
                    </>
                  )}
                </button>

              </div>
            </div>

          </form>

          {/* ============================================================= */}
          {/* Privacy */}
          {/* ============================================================= */}

          <div className="px-3 py-6 text-center">

            <p className="text-xs leading-5 text-slate-400">
              Your profile information is private and will
              only be available to authorized members.
            </p>

          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default UpdateProfilePage;
