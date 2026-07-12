import React from 'react';
import { useLocation, Link } from '@tanstack/react-router';
import { SignInButton, UserButton, useAuth } from '@clerk/react';
import TabToggle from '@/components/TabToggle';
import { neobrutalism } from '@clerk/ui/themes'

import SettingsBox from '@/components/SettingsBox';

/**
 * Properties for the Header component, managing top-level navigation between different sections of the application.
 * 
 * @property {string} activeTab - The currently selected navigation tab ('schedule' or 'leagues').
 * @property {() => void} onTabChange - Callback function to handle switching between navigation tabs.
 * @property {() => void} onSettingsBox - Callback function to handle opening the settings dropdown.
 * @property {boolean} isSettingsOpen - Whether the settings dropdown is currently open.
 * @property {() => void} onCloseSettings - Callback function to close the settings dropdown.
 */
export interface HeaderProps {
    onSettingsBox?: () => void;
    isSettingsOpen?: boolean;
    onCloseSettings?: () => void;
}


/**
 * Wrapper for the header component
 * @param {HeaderProps} props - The properties passed to the component including activeTab and onTabChange.
 * @returns {JSX.Element} The header element.
 */
const Header: React.FC<HeaderProps> = ({
    onSettingsBox,
    isSettingsOpen = false,
    onCloseSettings = () => undefined
}) => {
    const location = useLocation();
    const path = location.pathname;
    const { isLoaded, isSignedIn } = useAuth();
    const title = path.includes('leagues') ? 'Leagues' :
        path.includes('rankings') ? 'Rankings' :
            path.includes('schedule') ? 'Schedule' :
                'Admin';

    const settingsRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!isSettingsOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                onCloseSettings();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSettingsOpen, onCloseSettings]);

    return (
        <header className="top-0 z-30 px-4 pt-4">
            <div className="flex gap-4 justify-between py-2.5 px-4 items-center bg-bg-card rounded-lg shadow-main relative border-2 border-border-color">
                <div className="text-sm sm:text-base md:text-xl text-text-main font-bold flex-1">
                    Play! South Wales <span className="hidden sm:inline">|</span> <span key={title} className="inline-block animate-swipe-left text-primary">{title}</span>
                </div>

                <div className="hidden sm:block">
                    <TabToggle tabs={[
                        { to: '/schedule', label: 'Schedule' },
                        { to: '/leagues', label: 'Leagues' },
                        { to: '/rankings', label: 'Rankings' },
                    ]} activeTab={path} />
                </div>

                <div className="flex gap-2.5 items-center justify-end flex-none sm:flex-1">
                    {isLoaded && isSignedIn && (
                        <>
                            <UserButton />
                            <Link
                                to="/admin"
                                className={`hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 border-2 border-border-color rounded-md bg-bg-main text-text-main text-sm font-bold cursor-pointer transition-colors duration-150 no-underline hover:bg-bg-card-hover hover:text-text-darker hover:border-text-muted ${path.startsWith('/admin') ? 'bg-primary! text-white! border-primary-hover! shadow-[0_4px_12px_rgba(227,53,13,0.3)]' : ''}`}
                            >
                                Admin
                            </Link>

                        </>
                    )}
                    {isLoaded && !isSignedIn && (
                        <SignInButton mode="modal" appearance={{
                            elements: {
                                footerAction: { display: 'none' }

                            },
                            theme: neobrutalism
                        }}>
                            <button type="button" className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 border-2 border-border-color rounded-md bg-bg-main text-text-main text-sm font-bold cursor-pointer transition-colors duration-150 no-underline hover:bg-bg-card-hover hover:text-text-darker hover:border-text-muted">
                                Sign In
                            </button>
                        </SignInButton>
                    )}
                    <div className="relative" ref={settingsRef}>
                        <button
                            className={`inline-flex items-center gap-1.5 py-1.5 px-3 border-2 border-border-color rounded-md bg-bg-main text-text-main text-sm font-bold cursor-pointer transition-colors duration-150 hover:bg-bg-card-hover hover:text-text-darker hover:border-text-muted ${isSettingsOpen ? 'bg-primary! text-white! border-primary-hover! shadow-[0_4px_12px_rgba(227,53,13,0.3)]' : ''}`}
                            onClick={onSettingsBox}>
                            &#9881;
                        </button>
                        {isSettingsOpen ? (
                            <div className="absolute top-[calc(100%+8px)] right-0 z-10 min-w-55 animate-[dropFadeDown_0.15s_ease_forwards]">
                                <SettingsBox onClose={onCloseSettings} />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
