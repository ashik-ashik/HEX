
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';


// NOTE: mount <Toaster /> once at the App root with the shared config:
// <Toaster
//   position="top-right"
//   containerStyle={{ position: "fixed", top: 100, right: 20, zIndex: 9999 }}
//   toastOptions={{
//     className: "text-xs px-3 py-2 rounded-lg shadow-md",
//     style: { background: "#1f2937", color: "#fff" },
//   }}
// />

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const PUBLIC_UNIVERSITIES: string[] = [
  "Other",

  "Aviation and Aerospace University, Bangladesh",

  "Bangladesh Agricultural University",
  "Bangladesh Digital University",
  "Bangladesh Maritime University",
  "Bangladesh Medical University",
  "Bangladesh Open University",
  "Bangladesh University of Engineering and Technology (BUET)",
  "Bangladesh University of Professionals",
  "Bangladesh University of Textiles",
  "Begum Rokeya University, Rangpur",
  "Bogura Science and Technology University",

  "Chandpur Science and Technology University",
  "Chittagong Medical University",
  "Chittagong University of Engineering and Technology (CUET)",
  "Chittagong Veterinary and Animal Sciences University (CVASU)",
  "Comilla University",

  "Dhaka University",
  "Dhaka University of Engineering and Technology (DUET)",

  "Gazipur Agricultural University",

  "Hajee Mohammad Danesh Science and Technology University",
  "Habiganj Agricultural University",

  "Islamic Arabic University",
  "Islamic University, Bangladesh",

  "Jagannath University",
  "Jahangirnagar University",
  "Jamalpur Science and Technology University",
  "Jashore University of Science and Technology",
  "Jatiya Kabi Kazi Nazrul Islam University",

  "Khulna Agricultural University",
  "Khulna Medical University",
  "Khulna University",
  "Khulna University of Engineering and Technology (KUET)",
  "Kishoreganj University",
  "Kurigram Agricultural University",

  "Lakshmipur Science and Technology University",

  "Mawlana Bhashani Science and Technology University",
  "Meherpur University",

  "Naogaon University",
  "Narayanganj Science and Technology University",
  "National University",
  "Netrokona University",
  "Noakhali Science and Technology University",

  "Pabna University of Science and Technology",
  "Patuakhali Science and Technology University",
  "Pirojpur Science and Technology University",

  "Rabindra University, Bangladesh",
  "Rajshahi Medical University",
  "Rajshahi University",
  "Rajshahi University of Engineering and Technology (RUET)",
  "Rangamati Science and Technology University",

  "Shahjalal University of Science and Technology",
  "Sher-e-Bangla Agricultural University",
  "Sunamganj Science and Technology University",
  "Sylhet Agricultural University",
  "Sylhet Medical University",

  "Thakurgaon University",

  "University of Barishal",
  "University of Chittagong",
  "University of Dhaka",
  "University of Frontier Technology, Bangladesh",
  "University of Rajshahi",
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

interface ProfileFormState {
  phone: string;
  university: string;
  universityOther: string;
  department: string;
  session: string;
  degree: string;
  degreeOther: string;
  district: string;
  bloodGroup: string;
  presentAddress: string;
}

const initialFormState: ProfileFormState = {
  phone: '',
  university: '',
  universityOther: '',
  department: '',
  session: '',
  degree: '',
  degreeOther: '',
  district: '',
  bloodGroup: '',
  presentAddress: '',
};

const inputClass =
  'mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white';

const labelClass = 'block text-sm font-medium text-slate-700';

const UpdateProfilePage = () => {
  const {
    user,
    setUsersList,
    usersList,
  } = useAuth() as {
    user: { email: string };
    setUsersList: (users: any[]) => void;
    usersList: any[];
  };

  const navigate = useNavigate();

  const [form, setForm] = useState<ProfileFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validate = (): string | null => {
    if (!user?.email) {
      return 'Unable to submit without a logged in user.';
    }

    if (!form.phone.trim()) {
      return 'Phone number is required.';
    }

    if (!form.university) {
      return 'Please select your university.';
    }

    if (form.university === 'Other' && !form.universityOther.trim()) {
      return 'Please enter your university name.';
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

    if (form.degree === 'Other' && !form.degreeOther.trim()) {
      return 'Please enter your last educational degree.';
    }

    if (!form.district) {
      return 'Please select your home district.';
    }

    return null;
  };

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

    const updatedProfile = {
      phone: form.phone.trim(),

      university:
        form.university === 'Other'
          ? form.universityOther.trim()
          : form.university,

      department: form.department.trim(),

      session: form.session.trim(),

      degree:
        form.degree === 'Other'
          ? form.degreeOther.trim()
          : form.degree,

      homeDistrict: form.district,

      bloodGroup: form.bloodGroup,
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
    });

    try {
      const response = await fetch(
        import.meta.env.VITE_UPDATE_MEMBER_PROFILE_API,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile.');
      }

      const result = await response.json();

      if (result.status === 'success') {
        toast.success(
          result.message ?? 'Profile updated successfully.',
          {
            id: toastId,
          }
        );

        // ---------------------------------------------------------------
        // Update the current user in usersList
        // ---------------------------------------------------------------

        const updatedUsersList = usersList.map((existingUser) => {
          if (existingUser.email === user?.email) {
            return {
              ...existingUser,
              ...updatedProfile,
            };
          }

          return existingUser;
        });

        setUsersList(updatedUsersList);

        // Reset form after successful update
        setForm(initialFormState);
      } else {
        toast.error(
          result.message ?? 'Unable to update profile.',
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
      navigate('/member-profile');
    }
  };

  return (
    <>
      <div className="min-h-screen w-full bg-slate-50 px-0 py-8 sm:py-12 lg:px-4">
        {/* Toast Container */}
        <Toaster
          position="top-right"
          containerStyle={{
            position: 'fixed',
            top: 100,
            right: 20,
            zIndex: 9999,
          }}
          toastOptions={{
            className:
              'text-xs px-3 py-2 rounded-lg shadow-md',

            style: {
              background: '#1f2937',
              color: '#fff',
            },

            success: {
              className:
                'bg-green-600 text-white text-xs px-3 py-2 rounded-lg shadow-md',

              iconTheme: {
                primary: '#fff',
                secondary: '#16a34a',
              },
            },

            error: {
              className:
                'bg-red-600 text-white text-xs px-3 py-2 rounded-lg shadow-md',

              iconTheme: {
                primary: '#fff',
                secondary: '#dc2626',
              },
            },

            loading: {
              className:
                'bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg shadow-md',
            },
          }}
        />

        <div className="mx-auto w-full max-w-xl rounded-xl bg-white p-4 shadow-sm sm:p-8 lg:p-8">
          <div className="mb-4 flex items-center">
            <span
              className="inline-flex cursor-pointer gap-2 font-bold text-slate-500 hover:text-slate-700"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="text-slate-700 transition" />
              Back
            </span>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Complete Your Profile
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add a few details so other members can reach and recognize you.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-8"
          >
            {/* Contact information */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Contact Information
              </h3>

              <div className="mt-3">
                <label className={labelClass}>
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    updateField('phone', e.target.value)
                  }
                  maxLength={11}
                  placeholder="Like 015XXXXXXXX"
                  className={inputClass}
                />
              </div>
            </section>

            {/* Academic information */}
            <section>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    University Name/ College Name
                  </label>

                  <p className="text-xs text-blue-400">
                    If your university is not listed, select "Other"
                    and type your university name in the input field
                    that appears.
                  </p>

                  <select
                    value={form.university}
                    onChange={(e) =>
                      updateField('university', e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">
                      Select university
                    </option>

                    {PUBLIC_UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>
                        {uni}
                      </option>
                    ))}
                  </select>

                  {form.university === 'Other' && (
                    <input
                      type="text"
                      value={form.universityOther}
                      onChange={(e) =>
                        updateField(
                          'universityOther',
                          e.target.value
                        )
                      }
                      placeholder="Type your university name"
                      className={`${inputClass} mt-2`}
                    />
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Department
                  </label>

                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) =>
                      updateField('department', e.target.value)
                    }
                    placeholder="e.g. Computer Science"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Session
                  </label>

                  <input
                    type="text"
                    value={form.session}
                    onChange={(e) =>
                      updateField('session', e.target.value)
                    }
                    placeholder="e.g. 2021-22"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Last Educational Degree
                  </label>

                  <select
                    value={form.degree}
                    onChange={(e) =>
                      updateField('degree', e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">
                      Select degree
                    </option>

                    {LAST_DEGREES.map((degree) => (
                      <option
                        key={degree}
                        value={degree}
                      >
                        {degree}
                      </option>
                    ))}
                  </select>

                  {form.degree === 'Other' && (
                    <input
                      type="text"
                      value={form.degreeOther}
                      onChange={(e) =>
                        updateField(
                          'degreeOther',
                          e.target.value
                        )
                      }
                      placeholder="Type your last educational degree"
                      className={`${inputClass} mt-2`}
                    />
                  )}
                </div>
              </div>
            </section>

            {/* Personal information */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Personal Information
              </h3>

              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Home District
                  </label>

                  <select
                    value={form.district}
                    onChange={(e) =>
                      updateField('district', e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">
                      Select district
                    </option>

                    {HOME_DISTRICTS.map((district) => (
                      <option
                        key={district}
                        value={district}
                      >
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Blood Group{' '}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <select
                    value={form.bloodGroup}
                    onChange={(e) =>
                      updateField(
                        'bloodGroup',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">
                      Select blood group
                    </option>

                    {BLOOD_GROUPS.map((group) => (
                      <option
                        key={group}
                        value={group}
                      >
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Saving...'
                  : 'Save Profile'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-xs text-slate-500">
            <p>
              Your information will be kept private and will not
              be shared with non-member users.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default UpdateProfilePage;

