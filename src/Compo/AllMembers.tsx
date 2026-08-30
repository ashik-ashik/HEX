/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, type ElementType } from "react";
import {
    Search,
    X,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    Building2,
    Droplet,
    Calendar,
    Clock,
    ShieldCheck,
    ChevronDown,
    ChevronRight,
    Users,
    Sparkles,
    Crown,
    Star,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import Header from "./Header";

type AnyObj = { [k: string]: any };

/** Roles that count as "currently in the house" — shown first, most recent first. */
const ACTIVE_ROLES = ["member", "manager", "assist_manager"];

const ROLE_META: Record<
    string,
    { label: string; badge: string; ring: string; accent: string; icon?: ElementType }
> = {
    manager: {
        label: "Manager",
        badge: "bg-orange-600 text-orange-50 ring-1 ring-orange-200",
        ring: "ring-orange-300",
        accent: "from-orange-400 to-orange-600",
        icon: Crown,
    },
    assist_manager: {
        label: "Assistant Manager",
        badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        ring: "ring-amber-300",
        accent: "from-amber-400 to-amber-600",
        icon: Star,
    },
    member: {
        label: "Member",
        badge: "bg-green-50 text-green-700 ring-1 ring-green-200",
        ring: "ring-teal-200",
        accent: "from-teal-400 to-teal-600",
    },
    guest: {
        label: "Guest",
        badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
        ring: "ring-blue-200",
        accent: "from-blue-400 to-blue-600",
    },
};

const getRoleMeta = (role?: string) =>
    ROLE_META[role ?? ""] ?? {
        label: role || "Member",
        badge: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
        ring: "ring-gray-200",
        accent: "from-gray-300 to-gray-400",
    };

const getRoleLabel = (role?: string) =>
    role === "assist_manager" ? "Assistant Manager" : role === "ex-member" ? "Ex-Member" : role || "Member";

const getInitials = (name?: string) =>
    (name || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join("");

/** Small avatar used on cards + modal header. Falls back to initials on load error / missing photo. */
const Avatar = ({
    user,
    size = "md",
}: {
    user: AnyObj;
    size?: "md" | "lg";
}) => {
    const [errored, setErrored] = useState(false);
    const dims = size === "lg" ? "h-24 w-24 text-2xl" : "h-14 w-14 text-base";
    const roleMeta = getRoleMeta(user.role);

    if (user.photoURL && !errored) {
        return (
            <img
                src={user.photoURL}
                alt={user?.name}
                onError={() => setErrored(true)}
                className={`${dims} rounded-full object-cover ring-4 ring-white shadow-lg shrink-0`}
            />
        );
    }

    return (
        <div
            className={`${dims} rounded-full bg-gradient-to-br ${roleMeta.accent} text-white font-semibold flex items-center justify-center ring-4 ring-white shadow-lg shrink-0 capitalize`}
        >
            {getInitials(user?.name)}
        </div>
    );
};

/** One labeled row used inside the details modal. */
const InfoRow = ({
    icon: Icon,
    label,
    value,
}: {
    icon: ElementType;
    label: string;
    value?: string;
}) => {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0">
            <div className="mt-0.5 h-9 w-9 shrink-0 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Icon size={17} />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">{label}</p>
                <p className="text-sm font-medium text-gray-800 break-words">{value || "—"}</p>
            </div>
        </div>
    );
};

/** A tiny stat used inside the card grid: icon + label + value, all compact. */
const CardStat = ({
    icon: Icon,
    label,
    value,
}: {
    icon: ElementType;
    label: string;
    value?: string;
}) => (
    <div className="min-w-0">
        <div className="flex items-center gap-1 text-gray-400">
            <Icon size={11} className="shrink-0" />
            <span className="text-[11px] leading-none">{label}</span>
        </div>
        <p className="text-[13px] font-medium text-gray-700 truncate mt-0.5">{value || "—"}</p>
    </div>
);

const MemberDetailsModal = ({
    user,
    onClose,
}: {
    user: AnyObj;
    onClose: () => void;
}) => {
    const isActive = ACTIVE_ROLES.includes(user.role);

    // Close on Escape as well as on outside click.
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Only close when the click both starts and ends on the backdrop itself,
    // never on the card — this also avoids accidental closes from text-selection drags.
    const backdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget) return;
        const target = e.currentTarget;
        const handleMouseUp = (upEvent: MouseEvent) => {
            if (upEvent.target === target) onClose();
            target.removeEventListener("mouseup", handleMouseUp as any);
        };
        target.addEventListener("mouseup", handleMouseUp as any, { once: true });
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-4"
            onMouseDown={backdropMouseDown}
        >
            <div className="no-scrollbar h-full w-full overflow-y-auto bg-white sm:h-auto sm:max-h-[92vh] sm:w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl sm:rounded-2xl sm:shadow-2xl">
                {/* Banner background */}
                <div className="relative h-40 sm:h-44 bg-gradient-to-br from-teal-500 to-teal-700 overflow-hidden">
                    <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-white/10 blur-xl" />

                    <div className="relative z-10 flex items-center justify-between px-6 pt-6">
                        <span className="text-xs capitalize font-semibold px-2.5 py-1 rounded-full bg-white/15 text-white backdrop-blur-sm">
                            {getRoleLabel(user.role)}
                        </span>
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="h-9 w-9 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 transition"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Avatar + name sit on top of the banner */}
                <div className="relative z-10 px-6 -mt-12">
                    <div className="flex items-end gap-4">
                        <Avatar user={user} size="lg" />
                        <div className="pb-1 min-w-0 pt-4">
                            <h2 className="text-xl font-bold text-gray-700 truncate uppercase">{user?.name}</h2>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                        isActive ? "bg-emerald-500" : "bg-gray-300"
                                    }`}
                                />
                                {isActive
                                    ? "Active Member"
                                    : user.role === "ex-member"
                                    ? "Former Member"
                                    : user.role === "guest"
                                    ? "Guest"
                                    : "Unknown Member"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sections */}
                <div className="relative z-10 px-6 pt-6 pb-8 grid grid-cols-1 md:grid-cols-2 gap-x-10">
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                            Contact Information
                        </h3>
                        <div>
                            <InfoRow icon={Mail} label="Email" value={user.email} />
                            <InfoRow icon={Phone} label="Phone Number" value={user.phoneNumber ? 0 + user.phoneNumber : '-'} />
                            <InfoRow icon={MapPin} label="Home District" value={user.homeDistrict} />
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                            Academic Information
                        </h3>
                        <div>
                            <InfoRow icon={GraduationCap} label="Degree" value={user.degree} />
                            <InfoRow icon={Building2} label="Department" value={user.department} />
                            <InfoRow icon={Building2} label="University" value={user.university} />
                            <InfoRow icon={Calendar} label="Session" value={user.session} />
                        </div>
                    </section>

                    <section className="md:col-span-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                            Personal &amp; Other
                        </h3>
                        <div className="md:grid md:grid-cols-2 md:gap-x-10">
                            <InfoRow icon={Droplet} label="Blood Group" value={user.bloodGroup} />
                            <InfoRow
                                icon={ShieldCheck}
                                label="Identity Verified"
                                value={user.emailVerified === "TRUE" ? "Verified" : undefined}
                            />
                            <InfoRow icon={Clock} label="Joined Date" value={user.lastLoginAt} />
                            <InfoRow icon={Calendar} label="Leave Date" value={user.leaveDate} />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const MemberCard = ({
    user,
    onDetails,
}: {
    user: AnyObj;
    onDetails: (user: AnyObj) => void;
}) => {
    const roleMeta = getRoleMeta(user.role);
    const RoleIcon = roleMeta.icon;
    const isActive = ACTIVE_ROLES.includes(user.role);

    return (
        <div className="group relative bg-white rounded-md shadow-lg shadow-gray-100 ring-1 ring-gray-100 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:ring-teal-100 transition-all duration-200">
            {/* Role accent strip */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${roleMeta.accent}`} />

            <div className="p-5 flex flex-col gap-4 flex-1">
                <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                        <div className={`rounded-full ring-2 ${roleMeta.ring} ring-offset-2`}>
                            <Avatar user={user} />
                        </div>
                        {RoleIcon && (
                            <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white shadow flex items-center justify-center ring-1 ring-gray-100">
                                <RoleIcon size={11} className="text-amber-500" />
                            </span>
                        )}
                        <span
                            className={`absolute -top-0.5 -left-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                                isActive ? "bg-emerald-500" : "bg-gray-300"
                            }`}
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-semibold text-gray-800 truncate capitalize">{user?.name}</h2>
                        <span
                            className={`inline-block capitalize mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${roleMeta.badge}`}
                        >
                            {getRoleLabel(user.role)}
                        </span>
                    </div>
                </div>

                {/* Compact info grid */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-4 border-t border-gray-100 pt-3">
                    <div className="col-span-2 min-w-0">
                        <div className="flex items-center gap-1 text-gray-400">
                            <Mail size={11} className="shrink-0" />
                            <span className="text-[11px] leading-none">Email</span>
                        </div>
                        <p className="text-[13px] font-medium text-gray-700 truncate mt-0.5">
                            {user.email || "—"}
                        </p>
                    </div>
                    <CardStat icon={MapPin} label="District" value={user.homeDistrict} />
                    <CardStat icon={Phone} label="Phone" value={user.phoneNumber ? 0 + user.phoneNumber : "-"} />
                </div>

                <button
                    onClick={() => onDetails(user)}
                    className="mt-auto group/btn w-full flex items-center justify-center gap-1 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-600 hover:text-white rounded-xl py-2.5 transition-colors active:scale-[0.98]"
                >
                    View Details
                    <ChevronRight
                        size={15}
                        className="transition-transform group-hover/btn:translate-x-0.5"
                    />
                </button>
            </div>
        </div>
    );
};

/** Full-width hero banner introducing the page. */
const MembersBanner = ({ total }: { total: number }) => (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-teal-600 via-teal-600 to-emerald-600">
        {/* Decorative shapes */}
        <div className="absolute -top-16 -left-10 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-1/2 right-1/4 h-24 w-24 -translate-y-1/2 rounded-full bg-white/10" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:py-16 flex flex-col items-start gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-white/15 text-white backdrop-blur-sm">
                <Sparkles size={13} />
                Meet the household
            </span>
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-white/15 items-center justify-center text-white backdrop-blur-sm">
                    <Users size={26} />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">All Members</h1>
                    <p className="text-teal-50/90 text-sm sm:text-base mt-1">
                        Everyone who's part of the house, in one place.
                    </p>
                </div>
            </div>
            <span className="mt-2 inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-teal-700 shadow-md">
                {total} Total Members
            </span>
        </div>
    </div>
);

const AllMembers = () => {
    const { usersList } = useAuth() as { usersList: AnyObj[] };
    const [query, setQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [selectedUser, setSelectedUser] = useState<AnyObj | null>(null);

    const roleOptions = useMemo(() => {
        const roles = new Set((usersList || []).map((u) => u.role).filter(Boolean));
        return Array.from(roles);
    }, [usersList]);

    const filteredUsers = useMemo(() => {
        if (!usersList) return [];
        const q = query.trim().toLowerCase();
        return usersList.filter((user) => {
            const matchesQuery =
                !q ||
                user?.name?.toLowerCase().includes(q) ||
                user.email?.toLowerCase().includes(q) ||
                user.homeDistrict?.toLowerCase().includes(q);
            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            return matchesQuery && matchesRole;
        });
    }, [usersList, query, roleFilter]);

    // Active members (member / manager / assist_manager) always come first, most
    // recently added shown first. Everyone else (guest, ex-member, etc.) follows,
    // also most recently added first.
    const orderedUsers = useMemo(() => {
        const active: AnyObj[] = [];
        const others: AnyObj[] = [];
        for (const user of filteredUsers) {
            if (ACTIVE_ROLES.includes(user.role)) active.push(user);
            else others.push(user);
        }
        active.reverse();
        others.reverse();
        return [...active, ...others];
    }, [filteredUsers]);

    return (
        <>
            {/* Hides scrollbars on the modal's scroll container while keeping it scrollable */}
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <Header />
            <section className="bg-white/70 backdrop-blur-sm py-12">
                <MembersBanner total={(usersList || []).length} />

                <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6 ">
                    {/* Search + filter bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by name, email or district..."
                                className="w-full bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 pl-11 pr-10 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    aria-label="Clear search"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div className="relative sm:w-56">
                            <Users
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full appearance-none bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 pl-11 pr-9 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                            >
                                <option value="all">All Members</option>
                                {roleOptions.map((role) => (
                                    <option key={role} value={role}>
                                        {getRoleMeta(role).label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={16}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    {orderedUsers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {orderedUsers.map((user) => (
                                <MemberCard key={user.uid} user={user} onDetails={setSelectedUser} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <Search size={22} />
                            </div>
                            <p className="text-gray-500 font-medium">No members found</p>
                            <p className="text-sm text-gray-400">Try a different search term</p>
                        </div>
                    )}
                </div>
            </section>

            {selectedUser && (
                <MemberDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}
        </>
    );
};

export default AllMembers;