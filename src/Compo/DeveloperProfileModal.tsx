import { useEffect } from "react";
import { X, Mail, Github, Linkedin, Facebook, Twitter } from "lucide-react";

interface DeveloperProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEVELOPER = {
  photo: "https://i.postimg.cc/prYV9dWT/ash.png",
  name: "Md. Ashik Ali", // update with the actual name if different
  designation: "MERN Stack Developer",
  educationLine1: "MSS, BSS in Social Work",
  educationLine2: "Pabna University of Science and Technology",
  email: "ashikali0204@gmail.com", // update with the actual email
  socials: [
    { icon: Github, href: "https://github.com/ashik-ashik", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/ashikali0/", label: "LinkedIn" },
    { icon: Facebook, href: "https://www.facebook.com/ashiknow3", label: "Facebook" },
    { icon: Twitter, href: "https://x.com/ashiknow", label: "Twitter" },
  ],
};

const DeveloperProfileModal = ({ isOpen, onClose }: DeveloperProfileModalProps) => {
  // Lock background scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950 font-[Poppins] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Developer profile"
    >
      {/* Decorative background texture */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.04]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:24px_24px]" />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close developer profile"
        className="fixed top-5 right-5 z-[110] flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-amber-400 hover:border-amber-400 transition-colors duration-200"
      >
        <X size={20} />
      </button>

      <div className="relative min-h-full flex items-center justify-center px-6 py-16">
        <div className="relative w-full max-w-md">
          {/* Corner accents – card / badge motif */}
          <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-teal-500/40 rounded-tl-lg" />
          <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-amber-500/40 rounded-br-lg" />

          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm px-8 py-10 flex flex-col items-center text-center shadow-2xl shadow-black/40">
            {/* Ink-stamp style tag */}
            <div className="mb-6 flex items-center gap-2 rounded-full border border-teal-500/50 bg-teal-500/10 px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-teal-300 font-semibold">
                Verified Developer
              </span>
            </div>

            {/* Profile photo */}
            <div className="relative mb-5">
              <div className="w-32 h-32 rounded-full p-[3px] bg-gradient-to-br from-amber-400 via-teal-400 to-amber-400">
                <img
                  src={DEVELOPER.photo}
                  alt={DEVELOPER?.name}
                  className="w-full h-full rounded-full object-cover border-2 border-slate-900"
                />
              </div>
            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold text-slate-50 tracking-wide">
              {DEVELOPER?.name}
            </h2>

            {/* Designation badge */}
            <span className="mt-2 inline-block rounded-full bg-amber-500/10 border border-amber-500/40 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-300">
              {DEVELOPER.designation}
            </span>

            {/* Divider */}
            <div className="w-16 h-px bg-slate-700 my-6" />

            {/* Education */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-200">
                {DEVELOPER.educationLine1}
              </p>
              <p className="text-xs text-slate-400">
                {DEVELOPER.educationLine2}
              </p>
            </div>

            {/* Email */}
            <a
              href={`mailto:${DEVELOPER.email}`}
              className="mt-6 flex items-center gap-2 text-sm text-slate-300 hover:text-amber-400 transition-colors duration-200"
            >
              <Mail size={15} />
              {DEVELOPER.email}
            </a>

            {/* Social icons */}
            <div className="mt-7 flex items-center gap-3">
              {DEVELOPER.socials.map(({ icon: Icon, href, label }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-700 text-slate-300 hover:text-slate-900 hover:bg-teal-400 hover:border-teal-400 transition-colors duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperProfileModal;