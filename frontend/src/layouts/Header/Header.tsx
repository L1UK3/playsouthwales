import React from 'react';
import type { HeaderProps } from './HeaderProps';

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
    return (
        <header>
            <div className="top-nav">
                <h1>Play! Wales | {activeTab === 'schedule' ? 'Schedule' : 'Leagues'}</h1>
                <div className="tab-toggle">
                    <button
                        className={activeTab === 'schedule' ? 'active' : ''}
                        onClick={() => onTabChange('schedule')}
                    >Schedule</button>
                    <button
                        className={activeTab === 'leagues' ? 'active' : ''}
                        onClick={() => onTabChange('leagues')}
                    >Leagues</button>
                </div>
                <div className="config-tabs">
                    <button className="admin-button">Admin</button>
                    <button className="settings-button">⚙️</button>
                </div>
            </div>
        </header>
    );
};

export default Header;
