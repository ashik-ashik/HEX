/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import useAuth from '../hooks/useAuth'
import Header from './Header'
import {
  Calendar,
  Mail,
  ShieldCheck,
  Phone,
  MapPin,
  GraduationCap,
  Building2,
  BookOpen,
  Layers,
  Droplet,
  Pencil,
  LogOut,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Footer from './Footer'
// import AddPhoneNumberPop from './UpdateMemberProfile'

type AnyObj = { [k: string]: any }

interface Props {
  members: AnyObj[]
  bazarData?: AnyObj[]
  mealData?: AnyObj[]
  mealDates?: AnyObj[]
  grandTotalMeals?: number
  grandDeposit?: number
  isLoading?: boolean
  isError?: boolean
  totalBazar?: number
  utilityDeposits?: AnyObj[]
}

const currency = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const LedgerRow: React.FC<{ label: string; value: string; hint?: string }> = ({
  label,
  value,
  hint,
}) => (
  <div className="flex items-baseline justify-between border-b border-dashed border-stone-300 py-2.5 last:border-b-0">
    <span className="text-[11px] font-bold uppercase tracking-widest text-stone-700">
      {label}
      {hint && <span className="ml-1.5 normal-case tracking-normal text-orange-600">{hint}</span>}
    </span>
    <span className="font-mono text-sm tabular-nums text-stone-800">{value}</span>
  </div>
)

// A single labeled fact in the info grid — icon + small caption + value.
const InfoField: React.FC<{
  icon: React.ElementType
  label: string
  value?: string | null
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5 px-4 py-3">
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F4C43]/8 text-[#0F4C43]">
      <Icon className="h-3.5 w-3.5" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-stone-400">{label}</p>
      <p className="truncate text-[11px] font-medium text-stone-800">
        {value && value.length > 0 ? value : <span className="text-stone-300">Not provided</span>}
      </p>
    </div>
  </div>
)

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="px-4 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0F4C43]/70">
    {children}
  </p>
)

const MemberProfile: React.FC<Props> = ({
  members = [],
  bazarData = [],
  mealData = [],
  grandTotalMeals = 0,
  isLoading = false,
  isError = false,
  totalBazar = 0,
  utilityDeposits = [],
}) => {
  const { user, usersList, logout } = useAuth() as { user?: AnyObj; usersList: AnyObj[]; logout: () => void | Promise<void> }

  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [editing, setEditing] = useState(false)

  const handleLogoutClick = async () => {
    if (!confirmingLogout) {
      setConfirmingLogout(true)
      return
    }
    try {
      setLoggingOut(true)
      await logout()
    } finally {
      setLoggingOut(false)
      setConfirmingLogout(false)
      window.location.href = '/' // redirect to home after logout
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-sm animate-pulse rounded-sm border border-stone-200 bg-stone-50 p-6">
        <div className="h-16 w-16 rounded-full bg-stone-200" />
        <div className="mt-4 h-4 w-1/2 rounded bg-stone-200" />
        <div className="mt-2 h-3 w-1/3 rounded bg-stone-200" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-sm rounded-sm border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Couldn&apos;t load this profile. Please try again.
      </div>
    )
  }

  // find current member by name or email
  const current = members.find((m) => {
    if (!user) return false
    if (m.name && user.displayName) return String(m.name) === String(user.displayName)
    if (m.email && user.email) return String(m.email).toLowerCase() === String(user.email).toLowerCase()
    return false
  })

  if (!current) {
    return (
      <div className="mx-auto max-w-xl mt-24 rounded-sm border border-stone-700 bg-stone-50 px-6 py-12 text-sm text-stone-500">
        No profile found for the current user.
      </div>
    )
  }

  const memberId = user?.displayName ?? current.name

  const memberMeals = mealData.find((m) => m.name === memberId)
  const mealCount = Number(memberMeals?.total) || 0

  const memberBazar = bazarData
    .filter((b) => b.person === memberId)
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0)

  const memberUtilityDeposit = utilityDeposits.find((u) => u.member === memberId)
  const utilityDeposit = Number(memberUtilityDeposit?.total) || 0

  const mealDeposit = Number(current.total) || 0
  const mealRate = grandTotalMeals > 0 ? totalBazar / grandTotalMeals : 0
  const mealCost = mealRate * mealCount
  const balance = mealDeposit - mealCost
  const isSettled = Math.abs(balance) < 1 // within ৳1, treat as settled
  const owesMoney = balance < 0

  const depositUsedPct = mealDeposit > 0 ? Math.min(100, (mealCost / mealDeposit) * 100) : mealCost > 0 ? 100 : 0

  const initial = (current.name || current.email || 'U').charAt(0).toUpperCase()
  const currentUser = usersList.find((u) => u.email?.toLowerCase() === user?.email?.toLowerCase()) || current


  // A member is "active" as long as no leaveDate has been recorded.
  const hasLeaveDate = typeof currentUser?.leaveDate === 'string' && currentUser.leaveDate.trim().length > 0
  const membershipEnd = hasLeaveDate ? currentUser.leaveDate : new Date().toISOString()

  // Duration between joinDate and either leaveDate (if the member has left) or today.
  const getDuration = (start: string | Date, end: string | Date) => {
    const startDate = new Date(start)
    const endDate = new Date(end)

    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    if (totalDays < 0) return '0 days'
    if (totalDays < 30) return `${totalDays} day${totalDays !== 1 ? 's' : ''}`

    let years = endDate.getFullYear() - startDate.getFullYear()
    let months = endDate.getMonth() - startDate.getMonth()
    let days = endDate.getDate() - startDate.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0)
      days += lastMonth.getDate()
    }
    if (months < 0) {
      years--
      months += 12
    }

    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}${days > 0 ? ` ${days} day${days !== 1 ? 's' : ''}` : ''}`
    }
    return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` ${months} month${months !== 1 ? 's' : ''}` : ''}${
      days > 0 ? ` ${days} day${days !== 1 ? 's' : ''}` : ''
    }`
  }

  const membershipDuration = getDuration(currentUser?.lastLoginAt, membershipEnd)

  const formattedDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })

  const canSeeLedger =
    currentUser?.role === 'manager' || currentUser?.role === 'assist_manager' || currentUser?.role === 'member'

  return (
    <>
      <Header />
      <div className="w-full bg-black/50 pt-20 pb-6 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-sm border border-stone-300 bg-[#FBF9F4] shadow-sm transition-shadow hover:shadow-md">
          {/* Header strip */}
          <div className="bg-[#0F4C43] px-6 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/80">
              Mess Ledger &middot; Member Statement
            </p>
          </div>

          <div className="lg:px-6 px-1 pb-6 pt-5">
            {/* Profile Card */}
            <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="relative h-24 bg-gradient-to-br from-[#0F4C43] via-[#155e52] to-[#0a332d]">
                <div
                  className="absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '18px 18px',
                  }}
                />
                <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-emerald-300/10 blur-xl" />

                {/* Edit — a real button, tucked in the corner so it never collides with the avatar or badges */}
                <Link to="/edit-profile"
                  type="button"
                  className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Link>
              </div>

              {/* Avatar — overlapping the banner */}
              <div className="flex justify-center">
                <div className="relative -mt-12 shrink-0">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={current.name || 'Profile'}
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#0F4C43] to-[#0a332d] font-serif text-3xl font-semibold text-white ring-4 ring-white shadow-lg">
                      {initial}
                    </div>
                  )}
                  <span
                    className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white shadow-sm ${
                      hasLeaveDate ? 'bg-stone-400' : 'bg-emerald-500'
                    }`}
                  >
                    {!hasLeaveDate && (
                      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                    )}
                  </span>
                </div>
              </div>

              {/* Identity block — centered */}
              <div className="flex flex-col items-center px-5 pb-4 pt-3 text-center">
                <h2 className="truncate font-serif text-xl font-semibold text-stone-900">{current?.name}</h2>

                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
                  {currentUser?.role && (
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        currentUser.role === 'manager'
                          ? 'border-[#0F4C43]/20 bg-[#0F4C43]/5 text-[#0F4C43]'
                          : currentUser.role === 'assist_manager'
                          ? 'border-orange-200 bg-orange-50 text-orange-700'
                          : 'border-stone-200 bg-stone-50 text-stone-600'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          currentUser.role === 'manager'
                            ? 'bg-[#0F4C43]'
                            : currentUser.role === 'assist_manager'
                            ? 'bg-orange-500'
                            : 'bg-stone-400'
                        }`}
                      />
                      {currentUser.role === 'assist_manager' ? 'Assistant Manager' : currentUser.role}
                    </span>
                  )}

                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      hasLeaveDate
                        ? 'border-stone-200 bg-stone-50 text-stone-500'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${hasLeaveDate ? 'bg-stone-400' : 'bg-emerald-500'}`} />
                    {hasLeaveDate ? 'Left' : 'Active'}
                  </span>
                </div>
              </div>

              {/* Contact & personal info — grouped, one icon per fact */}
              <div className="border-t border-stone-200">
                <SectionLabel>Contact</SectionLabel>
                <div className="grid grid-cols-2 divide-y divide-stone-100 sm:grid-cols-2 sm:divide-y-0">
                  <InfoField icon={Mail} label="Email" value={currentUser?.email} />
                  <InfoField
                    icon={Phone}
                    label="Phone"
                    value={currentUser?.phoneNumber ? `0${currentUser.phoneNumber}` : undefined}
                  />
                  <InfoField icon={MapPin} label="Home District" value={currentUser?.homeDistrict} />
                  <InfoField icon={Droplet} label="Blood Group" value={currentUser?.bloodGroup} />
                </div>

                <SectionLabel>Academic</SectionLabel>
                <div className="grid grid-cols-1 divide-y divide-stone-100 sm:grid-cols-2 sm:divide-y-0">
                  <InfoField icon={GraduationCap} label="University" value={currentUser?.university} />
                  <InfoField icon={Building2} label="Department" value={currentUser?.department} />
                </div>
                <div className="grid border-t divide-stone-100 grid-cols-2 sm:divide-y-0">
                  <InfoField icon={BookOpen} label="Degree" value={currentUser?.degree} />
                  <InfoField icon={Layers} label="Session" value={currentUser?.session} />
                </div>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-3 divide-x divide-stone-200 border-t border-stone-200 bg-stone-50/60">
                <div className="flex flex-col items-center gap-1 px-2 py-3.5">
                  <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-stone-400">
                    <Calendar className="h-3 w-3" />
                    Member Since
                  </p>
                  <p className="text-xs font-semibold text-stone-700">
                    {currentUser.lastLoginAt !== '' ? currentUser.lastLoginAt : 'Unknown'}
                  </p>
                  
                </div>
                <div className="flex flex-col items-center gap-1 px-2 py-3.5">
                  <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-stone-400">
                    <Calendar className="h-3 w-3" />
                    Duration
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {hasLeaveDate ? `Member for ${membershipDuration}` : `${membershipDuration}`}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 px-2 py-3.5">
                  <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-stone-400">
                    <ShieldCheck className="h-3 w-3" />
                    Status
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                    <span className={`h-1.5 w-1.5 rounded-full ${hasLeaveDate ? 'bg-stone-400' : 'bg-emerald-500'}`} />
                    {hasLeaveDate ? 'Left the mess' : 'Active'}
                  </div>
                  {hasLeaveDate && (
                    <p className="text-[11px] text-stone-500">Since {formattedDate(currentUser.leaveDate)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Balance — the signature element */}
            {canSeeLedger && (
              <>
                <div className="mt-5 rounded-sm border border-stone-300 bg-white px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-widest text-stone-500">
                      {isSettled ? 'Balance' : owesMoney ? 'Balance due' : 'Balance receivable'}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                        isSettled
                          ? 'bg-stone-200 text-stone-600'
                          : owesMoney
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isSettled ? 'Settled up' : owesMoney ? 'Due' : 'Receivable'}
                    </span>
                  </div>
                  <div
                    className={`mt-1 font-mono text-3xl font-semibold tabular-nums ${
                      isSettled ? 'text-stone-700' : owesMoney ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    ৳{currency(Math.abs(balance))}
                  </div>
                  <div className="mt-1 text-[11px] text-stone-400">
                    {isSettled ? 'no outstanding amount' : owesMoney ? 'to be paid to the mess' : 'to be refunded'}
                  </div>

                  {/* Deposit utilization */}
                  <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                      <div
                        className={`h-full rounded-full transition-all ${owesMoney ? 'bg-rose-400' : 'bg-emerald-400'}`}
                        style={{ width: `${depositUsedPct}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-wide text-stone-400">
                      {depositUsedPct.toFixed(0)}% of deposit used toward meal cost
                    </div>
                  </div>
                </div>

                {/* Ledger */}
                <div className="mt-5 p-2">
                  <LedgerRow label="Meals taken" value={mealCount.toString()} />
                  <LedgerRow label="Meal rate" value={`৳ ${currency(mealRate)}`} hint="per meal" />
                  <LedgerRow label="Meal deposit" value={`৳ ${currency(mealDeposit)}`} />
                  <LedgerRow label="My meal cost" value={`৳ ${currency(mealCost)}`} />
                  <LedgerRow label="Utility deposit" value={`৳ ${currency(utilityDeposit)}`} />
                  <LedgerRow label="Bazar spent" value={`৳ ${currency(memberBazar)}`} />
                </div>

                {/* Mess-wide footer */}
                <div className="mt-5 flex justify-between gap-3 rounded-sm bg-stone-100 px-4 py-3 text-center">
                  <div className="flex-1">
                    <div className="font-mono text-sm font-semibold text-stone-800">{members.length}</div>
                    <div className="text-[10px] uppercase tracking-wide text-stone-500">Members</div>
                  </div>
                  <div className="flex-1 border-x border-stone-200">
                    <div className="font-mono text-sm font-semibold text-stone-800">{grandTotalMeals}</div>
                    <div className="text-[10px] uppercase tracking-wide text-stone-500">Total meals</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-sm font-semibold text-stone-800">৳{currency(totalBazar)}</div>
                    <div className="text-[10px] uppercase tracking-wide text-stone-500">Total bazar</div>
                  </div>
                </div>
              </>
            )}

            {/* Logout */}
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={handleLogoutClick}
                onBlur={() => setConfirmingLogout(false)}
                disabled={loggingOut}
                className={`flex items-center gap-1.5 rounded-sm px-10 py-2 text-[11px] font-semibold uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C43] disabled:cursor-not-allowed disabled:opacity-60 ${
                  confirmingLogout
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'border border-red-400 text-red-700 hover:bg-red-900 hover:text-white'
                }`}
              >
                <LogOut className="h-3.5 w-3.5" />
                {loggingOut ? 'Logging out…' : confirmingLogout ? 'Confirm logout' : 'Log out'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit profile modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setEditing(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            {/* NOTE: adjust the prop name below (onClose) to match whatever
               close callback UpdateMemberProfile actually accepts. */}
            {/* <AddPhoneNumberPop onClose={() => setEditing(false)} /> */}
          </div>
        </div>
      )}
      <Footer />
    </>
  )
}

export default MemberProfile