import { EventsPanel, LeagueFormModal, useAdminLeagues } from "@/features/admin";
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
    const [isLeagueModalOpen, setIsLeagueModalOpen] = useState(false);
    const [editingLeague, setEditingLeague] = useState<League | null>(null);

    const { createLeague, updateLeague, deleteLeague, isSaving: isSavingLeague } = useAdminLeagues();

    const activeLeague = useMemo(() => {
        return leagues.find(l => l.leagueId === selectedLeagueId) ?? null;
    }, [leagues, selectedLeagueId]);

    const leagueMap = useMemo(() => {
        return leagues.reduce<Record<number, League>>((acc, l) => {
            acc[l.leagueId] = l;
            return acc;
        }, {});
    }, [leagues]);

    const handleAddLeagueTrigger = () => {
        setEditingLeague(null);
        setIsLeagueModalOpen(true);
    };

    const handleEditLeagueTrigger = (league: League) => {
        setEditingLeague(league);
        setIsLeagueModalOpen(true);
    };

    const handleDeleteLeagueTrigger = async (league: League) => {
        if (window.confirm(`Are you sure you want to delete "${league.name}"? This will also delete all events scheduled for this store.`)) {
            try {
                await deleteLeague(league.leagueId);
                if (selectedLeagueId === league.leagueId) {
                    setSelectedLeagueId(null);
                }
            } catch (error) {
                console.error('Failed to delete league:', error);
            }
        }
    };

    const handleSaveLeague = async (leagueData: Omit<League, 'leagueId'>) => {
        try {
            if (editingLeague) {
                await updateLeague({ id: editingLeague.leagueId, data: leagueData });
            } else {
                await createLeague(leagueData);
            }
            setIsLeagueModalOpen(false);
        } catch (error) {
            console.error('Failed to save league:', error);
            throw error;
        }
    };

    return (
        <div className={`${styles.dashboard} animate-swipe-up`}>
            <div className={`${styles.dashboardHeader} ${styles.animateIn}`} style={{ animationDelay: '0ms' }}>
                <h2>League Manager</h2>
            </div>

            <div className={styles.animateIn} style={{ animationDelay: '80ms' }}>
                <LeagueSelector
                    leagues={leagues}
                    selectedLeagueId={selectedLeagueId}
                    setSelectedLeagueId={setSelectedLeagueId}
                    showAdminControls={true}
                    onAdd={handleAddLeagueTrigger}
                    onEdit={handleEditLeagueTrigger}
                    onDelete={handleDeleteLeagueTrigger}
                />
            </div>

            {activeLeague && (
                <div key={activeLeague.leagueId} className="animate-swipe-down">
                    <EventsPanel
                        activeLeague={activeLeague}
                        leagueMap={leagueMap}
                        eventTypes={eventTypes}
                    />
                </div>
            )}

            <LeagueFormModal
                isOpen={isLeagueModalOpen}
                onClose={() => setIsLeagueModalOpen(false)}
                editingLeague={editingLeague}
                onSave={handleSaveLeague}
                isSaving={isSavingLeague}
            />
        </div>
    );
};

export default AdminPage;
