import { EventFormModal, LeagueFormModal } from "@/features/admin";
import { useLeagues, useEventTypes, useEvents } from "@/hooks";
import LeagueSelector from "@/features/league-selector";
import { useCallback, useState, useMemo } from "react";
import SuspenseLoader from "@/components/SuspenseLoader";
import { createLeagueMap, filterAndGroupEvents, ListView, NavBar } from "@calendar";
import { MONTH_NAMES } from "@/constants";

const AdminPage: React.FC = () => {
    const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [isEditingLeague, setIsEditingLeague] = useState<boolean>(false);
    const [isEditingEvent, setIsEditingEvent] = useState<boolean>(false);

    const { data: events = [], isLoading: isEventsLoading } = useEvents(currentDate);
    const { data: leagues = [], isLoading: isLeaguesLoading } = useLeagues();
    const { data: eventTypes = {}, isLoading: isEventTypesLoading } = useEventTypes();

    const activeLeague = leagues.find(l => l.leagueId === selectedLeagueId);

    const leagueMap = useMemo(() => createLeagueMap(leagues), [leagues]);

    const groupedEvents = useMemo(() => {
        const filters = {
            league: selectedLeagueId ? String(selectedLeagueId) : '',
            type: '',
            game: ''
        };
        return filterAndGroupEvents(events, filters);
    }, [events, selectedLeagueId]);

    const handlePrevMonth = useCallback(() => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }, []);

    const handleNextMonth = useCallback(() => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }, []);

    const handleGoToToday = useCallback(() => {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();

        setCurrentDate(new Date(todayYear, todayMonth, 1));
    }, []);


    const handleAddLeagueTrigger = useCallback(() => {
        setIsEditingLeague(true);
    }, []);

    const handleEditLeagueTrigger = useCallback(() => {
        setIsEditingLeague(true);
    }, []);

    const handleDeleteLeagueTrigger = useCallback(() => {
    }, []);

    const handleAddEventTrigger = useCallback(() => {
        setIsEditingEvent(true);
    }, []);

    const handleEditEventTrigger = useCallback(() => {
        setIsEditingEvent(true);
    }, []);

    const handleDeleteEventTrigger = useCallback(() => {
    }, []);

    if (isLeaguesLoading || isEventTypesLoading || isEventsLoading) {
        return <SuspenseLoader message="Loading admin manager..." />;
    }

    return (
        <div className="max-w-6xl mx-auto pb-10 flex flex-col gap-8 animate-swipe-up">
            <div className="flex flex-col gap-2 [&_h2]:text-[28px] [&_h2]:font-extrabold [&_h2]:text-text-darker [&_h2]:tracking-tight [&_p]:text-text-muted [&_p]:text-[15px]" style={{ animationDelay: '0ms' }}>
                <h2>League Manager</h2>
            </div>

            <div>
                <LeagueSelector
                    leagues={leagues}
                    selectedLeagueId={selectedLeagueId}
                    setSelectedLeagueId={setSelectedLeagueId}
                    showAdminControls={true}
                    onAdd={handleAddLeagueTrigger}
                    onEdit={handleEditLeagueTrigger}
                    onDelete={handleDeleteLeagueTrigger}
                    columns={4}
                />
            </div>

            {activeLeague && (
                <div key={activeLeague.leagueId} className="animate-swipe-down bg-bg-card border border-border-color rounded-lg p-8 shadow-main flex flex-col gap-6">
                    <div className="flex justify-between items-center border-b border-border-color pb-4">
                        <h3>Scheduled Events ({activeLeague.name})</h3>
                        <button type="button" className="btn btn-primary" onClick={handleAddEventTrigger}>
                            Schedule New Event
                        </button>
                    </div>

                    <NavBar
                        monthName={MONTH_NAMES[currentDate.getMonth()]}
                        year={currentDate.getFullYear()}
                        onGoToToday={handleGoToToday}
                        onPrevMonth={handlePrevMonth}
                        onNextMonth={handleNextMonth}
                    />

                    {events.length === 0 ? (
                        <div className="text-center py-12 px-5 text-text-muted [&_h4]:text-lg [&_h4]:font-bold [&_h4]:mb-2 [&_p]:text-[15px]">
                            <h4>No Events Scheduled</h4>
                            <p>There are no events matching your filters. Click "Add New Event" to create one.</p>
                        </div>
                    ) : (
                        <ListView
                            events={groupedEvents}
                            leagueMap={leagueMap}
                            types={eventTypes}
                            onEdit={handleEditEventTrigger}
                            onDelete={handleDeleteEventTrigger}
                        />
                    )}
                </div>
            )}

            <LeagueFormModal isOpen={isEditingLeague} onClose={() => setIsEditingLeague(false)} />
            <EventFormModal isOpen={isEditingEvent} onClose={() => setIsEditingEvent(false)} />
        </div>
    );
};

export default AdminPage;
