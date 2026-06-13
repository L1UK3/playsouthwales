import { EventsPanel } from "@/features/admin";
import LeagueSelector from "@/features/league-selector";
import { useEventTypes } from "@/hooks/useEventTypes";
import { useLeagues } from "@/hooks/useLeagues";
import type { League } from "@/types/League";
import { useMemo, useState } from "react";
import styles from './AdminPage.module.css';

/**
 * AdminPage component orchestrates subcomponents and custom hooks for tournament administration.
 */
const AdminPage: React.FC = () => {
    const { data: leagues = [] } = useLeagues();
    const { data: eventTypes = {} } = useEventTypes();

    const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);

    const currentLeagueId = selectedLeagueId ?? (leagues[0]?.leagueId ?? null);

    const activeLeague = useMemo(() => {
        return leagues.find(l => l.leagueId === currentLeagueId) ?? null;
    }, [leagues, currentLeagueId]);

    const leagueMap = useMemo(() => {
        return leagues.reduce<Record<number, League>>((acc, l) => {
            acc[l.leagueId] = l;
            return acc;
        }, {});
    }, [leagues]);

    return (
        <div className={styles.dashboard}>
            <div className={styles.dashboardHeader}>
                <h2>League Manager</h2>
            </div>

            <LeagueSelector
                leagues={leagues}
                selectedLeagueId={currentLeagueId}
                setSelectedLeagueId={setSelectedLeagueId}
            />

            {activeLeague && (
                <EventsPanel
                    activeLeague={activeLeague}
                    leagueMap={leagueMap}
                    eventTypes={eventTypes}
                />
            )}
        </div>
    );
};

export default AdminPage;
