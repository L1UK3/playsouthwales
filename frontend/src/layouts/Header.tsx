import React from 'react';
import { useLocation, Link } from '@tanstack/react-router';
import { SignInButton, UserButton, useAuth } from '@clerk/react';
import TabToggle from '@/components/TabToggle';
import { neobrutalism } from '@clerk/themes';
import { Moon, Sun } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

/**
 * Wrapper for the header component
 * @returns {JSX.Element} The header element.
 */
const Header: React.FC = () => {
    const location = useLocation();
    const path = location.pathname;
    const { isLoaded, isSignedIn } = useAuth();
    const { settings, toggleSetting } = useSettings();
    const title = path.includes('leagues')
        ? 'Leagues'
        : path.includes('rankings')
          ? 'Rankings'
          : path.includes('schedule')
            ? 'Schedule'
            : 'Admin';

    return (
        <header className="top-0 z-30 px-4 pt-4">
            <div className="flex gap-4 justify-between py-3 px-4 items-center bg-bg-card rounded-lg shadow-main relative border border-border-color">
                <div className="text-sm sm:text-base md:text-lg text-text-main font-extrabold tracking-[-0.02em] flex-1">
                    Play! South Wales{' '}
                    <span className="hidden sm:inline">|</span>{' '}
                    <span
                        key={title}
                        className="inline-block animate-swipe-left text-primary"
                    >
                        {title}
                    </span>
                </div>

                <div className="hidden sm:block">
                    <TabToggle
                        tabs={[
                            { to: '/schedule', label: 'Schedule' },
                            { to: '/leagues', label: 'Leagues' },
                            { to: '/rankings', label: 'Rankings' },
                        ]}
                        activeTab={path}
                    />
                </div>

                <div className="flex gap-2.5 items-center justify-end flex-none sm:flex-1">
                    {isLoaded && isSignedIn && (
                        <>
                            <UserButton />
                            <Link
                                to="/admin"
                                className={`hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 border border-border-color rounded-md bg-bg-main text-text-main text-sm font-semibold cursor-pointer transition-colors duration-150 no-underline hover:bg-bg-card-hover hover:text-text-darker hover:border-text-muted ${path.startsWith('/admin') ? 'bg-primary! text-white! border-primary-hover!' : ''}`}
                            >
                                Admin
                            </Link>
                        </>
                    )}
                    {isLoaded && !isSignedIn && (
                        <SignInButton
                            mode="modal"
                            appearance={{
                                elements: {
                                    footerAction: { display: 'none' },
                                },
                                theme: neobrutalism,
                            }}
                        >
                            <button
                                type="button"
                                className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 border border-border-color rounded-md bg-bg-main text-text-main text-sm font-semibold cursor-pointer transition-colors duration-150 no-underline hover:bg-bg-card-hover hover:text-text-darker hover:border-text-muted"
                            >
                                Sign In
                            </button>
                        </SignInButton>
                    )}
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 border border-border-color rounded-md bg-bg-main text-text-main text-sm font-semibold cursor-pointer transition-colors duration-150 hover:bg-bg-card-hover hover:text-text-darker hover:border-text-muted"
                        onClick={() => toggleSetting('darkMode')}
                        aria-label={
                            settings.darkMode
                                ? 'Switch to light mode'
                                : 'Switch to dark mode'
                        }
                        aria-pressed={settings.darkMode}
                        title={
                            settings.darkMode
                                ? 'Switch to light mode'
                                : 'Switch to dark mode'
                        }
                    >
                        {settings.darkMode ? (
                            <Sun aria-hidden="true" className="h-5 w-5" />
                        ) : (
                            <Moon aria-hidden="true" className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
