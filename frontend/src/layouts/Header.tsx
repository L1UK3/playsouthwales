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
                path.includes('admin') ? 'Admin' :
                    "Pairings";

    return (
        <header className="sticky top-0 z-100 px-6 pt-6">
            <div className="flex gap-5 flex-wrap justify-between py-3 px-5 items-center bg-bg-card rounded-lg shadow-main relative border-4 border-border-color max-md:flex-col max-md:items-stretch">
                <h1 className="text-2xl text-text-main flex-1">
                    Play! Wales | <span key={title} className="inline-block animate-swipe-left">{title}</span>
                </h1>

                <TabToggle tabs={[
                    { to: '/schedule', label: 'Schedule' },
                    { to: '/leagues', label: 'Leagues' },
                    { to: '/rankings', label: 'Rankings' },
                    { to: '/pairings', label: 'Pairings' }
                ]} activeTab={path} />

                <div className="flex-1 flex gap-2.5 items-center justify-end">
                    {isLoaded && isSignedIn && (
                        <>
                            <UserButton />
                            <Link
                                to="/admin"
                                className={`inline-flex items-center gap-1.5 py-2 px-4 border-2 border-border-color rounded-md bg-bg-main text-text-main text-sm font-bold cursor-pointer transition-all duration-200 no-underline hover:bg-bg-card-hover hover:text-text-darker hover:border-text-muted ${path.startsWith('/admin') ? 'bg-primary! text-white! border-primary-hover! shadow-[0_4px_12px_rgba(227,53,13,0.3)]' : ''}`}
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
                            <button type="button" className="inline-flex items-center gap-1.5 py-2 px-4 border-2 border-border-color rounded-md bg-bg-main text-text-main text-sm font-bold cursor-pointer transition-all duration-200 no-underline hover:bg-bg-card-hover hover:text-text-darker hover:border-text-muted">
                                Sign In
                            </button>
                        </SignInButton>
                    )}
                    <div className="relative">
                        <button
                            className={`inline-flex items-center gap-1.5 py-2 px-4 border-2 border-border-color rounded-md bg-bg-main text-text-main text-sm font-bold cursor-pointer transition-all duration-200 hover:bg-bg-card-hover hover:text-text-darker hover:border-text-muted ${isSettingsOpen ? 'bg-primary! text-white! border-primary-hover! shadow-[0_4px_12px_rgba(227,53,13,0.3)]' : ''}`}
                            onClick={onSettingsBox}>
                            &#9881;
                        </button>
                        {isSettingsOpen ? (
                            <div className="absolute top-[calc(100%+8px)] right-0 z-200 min-w-55 animate-[dropFadeDown_0.15s_ease_forwards]">
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
