import { Sparkles, CalendarDays, Users, ShoppingBasket, ArrowUpRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

type FooterLink = {
    label: string;
    href: string;
    icon: React.ElementType;
    description: string;
};

const FOOTER_LINKS: FooterLink[] = [
    {
        label: "Events",
        href: "/events",
        icon: CalendarDays,
        description: "House schedule & announcements",
    },
    {
        label: "All Members",
        href: "/all-members",
        icon: Users,
        description: "Everyone in the house",
    },
    {
        label: "Meal Bazar Costs",
        href: "/meal-bazar-costs",
        icon: ShoppingBasket,
        description: "Track bazar spending",
    },
];

const Footer: React.FC = () => {
    return (
        <footer className="relative bg-[#0B0F0E]/95 backdrop-blur-md border-t border-white/10">
            {/* subtle top accent line */}
            <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500" />

            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1.7fr] gap-8 md:gap-6">
                    {/* Branding */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
                                <Sparkles size={15} />
                            </span>
                            <span className="text-sm font-semibold text-gray-100">
                                The Hexa House Meal Manager
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                            Smart monthly meal management system for modern bachelor living —
                            track meals, costs, and members in one place.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Quick Links
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {FOOTER_LINKS.map(({ label, href, icon: Icon, description }) => (
                                <Link
                                    key={href}
                                    to={href}
                                    className="group flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 shadow-sm hover:border-teal-500/40 hover:bg-white/[0.06] hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                        <Icon size={15} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="flex items-center gap-1 text-[13px] font-medium text-gray-200 group-hover:text-teal-400 transition-colors">
                                            {label}
                                            <ArrowUpRight
                                                size={12}
                                                className="text-gray-500 group-hover:text-teal-500 transition-colors"
                                            />
                                        </span>
                                        <span className="block text-[11px] text-gray-500 truncate">
                                            {description}
                                        </span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                    <p className="text-[11px] text-gray-500">
                        © {new Date().getFullYear()} The Hexa Bachelors House • Built with care
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Version {import.meta.env.VITE_APP_VERSION || "1.0.0"}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;