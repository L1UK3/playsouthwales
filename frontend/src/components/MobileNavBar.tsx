import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useAuth, SignInButton } from '@clerk/react';
import { neobrutalism } from '@clerk/themes';
import { Calendar, MapPin, Trophy, ShieldAlert } from 'lucide-react';

const CLERK_SIGN_IN_APPEARANCE = {
    elements: {
        footerAction: { display: 'none' as const }
    },
    theme: neobrutalism
};

const MobileNavBar: React.FC = () => {
    const location = useLocation();
    const path = location.pathname;
    const { isLoaded, isSignedIn } = useAuth();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-100 bg-bg-card/90 backdrop-blur-md border-t-2 border-border-color py-2 px-4 flex justify-around items-center sm:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            <Link
                to="/schedule"
                className={`flex flex-col items-center gap-1 py-1 px-3 text-text-muted no-underline transition-colors duration-150 ${
                    path.startsWith('/schedule') ? 'text-primary!' : 'hover:text-text-main'
                }`}
            >
                <Calendar className="w-5 h-5 transition-transform duration-200 active:scale-95" />
                <span className="text-[10px] font-bold">Schedule</span>
            </Link>

            <Link
                to="/leagues"
                className={`flex flex-col items-center gap-1 py-1 px-3 text-text-muted no-underline transition-colors duration-150 ${
                    path.startsWith('/leagues') ? 'text-primary!' : 'hover:text-text-main'
                }`}
            >
                <MapPin className="w-5 h-5 transition-transform duration-200 active:scale-95" />
                <span className="text-[10px] font-bold">Leagues</span>
            </Link>

            <Link
                to="/rankings"
                className={`flex flex-col items-center gap-1 py-1 px-3 text-text-muted no-underline transition-colors duration-150 ${
                    path.startsWith('/rankings') ? 'text-primary!' : 'hover:text-text-main'
                }`}
            >
                <Trophy className="w-5 h-5 transition-transform duration-200 active:scale-95" />
                <span className="text-[10px] font-bold">Rankings</span>
            </Link>

            {isLoaded && isSignedIn && (
                <Link
                    to="/admin"
                    className={`flex flex-col items-center gap-1 py-1 px-3 text-text-muted no-underline transition-colors duration-150 ${
                        path.startsWith('/admin') ? 'text-primary!' : 'hover:text-text-main'
                    }`}
                >
                    <ShieldAlert className="w-5 h-5 transition-transform duration-200 active:scale-95" />
                    <span className="text-[10px] font-bold">Admin</span>
                </Link>
            )}

            {isLoaded && !isSignedIn && (
                <SignInButton mode="modal" appearance={CLERK_SIGN_IN_APPEARANCE}>
                    <button
                        type="button"
                        className="flex flex-col items-center gap-1 py-1 px-3 text-text-muted bg-transparent border-none cursor-pointer transition-colors duration-150 hover:text-text-main"
                    >
                        <ShieldAlert className="w-5 h-5 transition-transform duration-200 active:scale-95" />
                        <span className="text-[10px] font-bold">Admin</span>
                    </button>
                </SignInButton>
            )}
        </nav>
    );
};

export default MobileNavBar;
