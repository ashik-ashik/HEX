/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import useAuth from '../hooks/useAuth'
import Header from './Header'

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
  const { user } = useAuth() as { user?: AnyObj }

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
      <div className="mx-auto max-w-sm rounded-sm border border-stone-200 bg-stone-50 p-6 text-sm text-stone-500">
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
  const owesMoney = balance < 0

  const initial = (current.name || current.email || 'U').charAt(0).toUpperCase()

  return (
    <>
        <Header />
        <div className="mx-auto w-full mt-20 mb-4 max-w-2xl overflow-hidden rounded-sm border border-stone-300 bg-[#FBF9F4] shadow-sm">
      {/* Header strip */}
      <div className="bg-[#0F4C43] px-6 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/80">
          Mess Ledger &middot; Member Statement
        </p>
      </div>

      <div className="px-6 pb-6 pt-5">
        {/* Identity */}
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={current.name || 'Profile'}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-[#0F4C43]/15"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0F4C43]/10 font-serif text-xl font-semibold text-[#0F4C43]">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate font-serif text-lg font-semibold text-stone-900">
              {current.name || current.email}
            </div>
            <div className="truncate text-xs text-stone-500">{user?.email || 'No email on file'}</div>
          </div>
        </div>

        {/* Balance — the signature element */}
        <div className="mt-5 rounded-sm border border-stone-300 bg-white px-5 py-4 text-center">
          <div className="text-[11px] font-medium uppercase tracking-widest text-stone-500">
            {owesMoney ? 'Balance due' : 'Balance receivable'}
          </div>
          <div
            className={`mt-1 font-mono text-3xl font-semibold tabular-nums ${
              owesMoney ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            ৳{currency(Math.abs(balance))}
          </div>
          <div className="mt-1 text-[11px] text-stone-400">
            {owesMoney ? 'to be paid to the mess' : 'to be refunded'}
          </div>
        </div>

        {/* Ledger */}
        <div className="mt-5">
          <LedgerRow label="Meals taken" value={mealCount.toString()} />
          <LedgerRow label="Meal deposit" value={`৳ ${currency(mealDeposit)}`} />
          <LedgerRow label="Utility deposit" value={`৳ ${currency(utilityDeposit)}`} />
          <LedgerRow label="Meal rate" value={`৳ ${currency(mealRate)}`} hint="per meal" />
          <LedgerRow label="My meal cost" value={`৳ ${currency(mealCost)}`} />
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
      </div>
    </div>
    </>
  )
}

export default MemberProfile