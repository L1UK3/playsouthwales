import LeagueSelector from "@/features/league-selector";
import { useLeagues } from "@/hooks/useLeagues";
import { useCallback, useState } from "react";
import styles from './LeaguesPage.module.css';
import { LeagueMap } from "@map";

/**
 * LeaguesPage component displays a list of participating leagues/stores.
 * @returns {JSX.Element} The rendered LeaguesPage.
 */
const LeaguesPage: React.FC = () => {
    const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
    const { data: leagues = [] } = useLeagues();

    const handleLeagueSelect = useCallback((id: number | null) => {
        setSelectedLeagueId(id);

        if (id !== null) {
            const cardElement = document.getElementById(`league-card-${id}`);
            if (cardElement) {
                cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, []);

    return (
        <div className={styles.splitView}>
            <div className={styles.listSection}>

                <LeagueSelector
                    leagues={leagues}
                    selectedLeagueId={selectedLeagueId}
                    setSelectedLeagueId={handleLeagueSelect}
                />


                {leagues.length === 0 ? (
                    <div className={styles.noLeagues}>
                        <p>No leagues found.</p>
                    </div>
                ) : null}
            </div>

            <div className={styles.mapSection}>
                <LeagueMap
                    leagues={leagues}
                    selectedLeagueId={selectedLeagueId}
                    onLeagueSelect={handleLeagueSelect}
                />
            </div>
        </div>
    );
};

export default LeaguesPage;
