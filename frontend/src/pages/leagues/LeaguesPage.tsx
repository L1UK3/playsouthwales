import React from 'react';
import type { League } from '../../types';

interface LeaguesPageProps {
    leagues: League[];
}

const LeaguesPage: React.FC<LeaguesPageProps> = ({ leagues }) => {
    return (
        <div className="tab-content active">
            <div className="leagues-container">
                {leagues.map(league => (
                    <div key={league.leagueId} className="league-card">
                        <h3>{league.name}</h3>
                        {league.website && (
                            <a href={league.website} target="_blank" rel="noopener noreferrer">
                                Website
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaguesPage;
