import { EventFormModal, LeagueFormModal, LeaderboardFormModal } from "@/features/admin";
import { useLeagues, useEventTypeMap, useEvents, useDocumentMetadata } from "@/hooks";
import LeagueSelector from "@/features/league-selector";
import { useCallback, useState, useMemo } from "react";
import SuspenseLoader from "@/components/SuspenseLoader";
import { createLeagueMap, filterAndGroupEvents, ListView, NavBar } from "@calendar";
import { MONTH_NAMES } from "@/constants";
import { createEvent, createLeague, deleteEvent, deleteLeague, loadLocalLeaderboard, updateEvent, updateLeague, updateLeaderboard, syncPokedata, syncSets } from "@/services/api";
import type { League } from "@/types/League";
import type { Event } from "@/types/Event";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import type { LeaderboardEntry } from "@/features/admin/components/LeaderboardFormModal";

const AdminPage: React.FC = () => {
    useDocumentMetadata({
        title: 'Admin Dashboard',
        description: 'Admin area for managing events and leagues.'
    });

    const { getToken } = useAuth();
    const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
    const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
    const [isEditingLeague, setIsEditingLeague] = useState<boolean>(false);
    const [isEditingEvent, setIsEditingEvent] = useState<boolean>(false);
    const [isEditingLeaderboard, setIsEditingLeaderboard] = useState<boolean>(false);
    const [editingLeague, setEditingLeague] = useState<League | null>(null);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [leaderboardDraft, setLeaderboardDraft] = useState<{ data?: LeaderboardEntry[] } | null>(null);

    const { data: events = [], isLoading: isEventsLoading } = useEvents(currentDate, true);
    const { data: leagues = [], isLoading: isLeaguesLoading } = useLeagues();
    const { data: eventTypes = {}, isLoading: isEventTypesLoading } = useEventTypeMap();

    const activeLeague = leagues.find(l => l.leagueId === selectedLeagueId);

    // Separate championship series leagues from regular leagues
    const championshipLeagues = useMemo(() => leagues.filter(l => l.isChampionshipSeries), [leagues]);
    const regularLeagues = useMemo(() => leagues.filter(l => !l.isChampionshipSeries), [leagues]);

    const leagueMap = useMemo(() => createLeagueMap(leagues), [leagues]);

    const groupedEvents = useMemo(() => {
        const filters = {
            league: selectedLeagueId ? String(selectedLeagueId) : '',
            eventType: '',
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

    const queryClient = useQueryClient();

    const [isSyncingPokedata, setIsSyncingPokedata] = useState<boolean>(false);
    const [isSyncingSets, setIsSyncingSets] = useState<boolean>(false);

    const handleSyncPokedata = useCallback(async () => {
        setIsSyncingPokedata(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("No login token");
            const res = await syncPokedata(token);
            alert(`PokeData sync completed successfully! Sync stats: ${JSON.stringify(res.metrics)}`);
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-events'] });
        } catch (error: any) {
            console.error("PokeData sync failed", error);
            alert(`PokeData sync failed: ${error.message ?? error}`);
        } finally {
            setIsSyncingPokedata(false);
        }
    }, [getToken, queryClient]);

    const handleSyncSets = useCallback(async () => {
        setIsSyncingSets(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("No login token");
            const res = await syncSets(token);
            alert(`TCG sets sync completed successfully! Sync stats: ${JSON.stringify(res.metrics)}`);
            queryClient.invalidateQueries({ queryKey: ['sets'] });
        } catch (error: any) {
            console.error("TCG sets sync failed", error);
            alert(`TCG sets sync failed: ${error.message ?? error}`);
        } finally {
            setIsSyncingSets(false);
        }
    }, [getToken, queryClient]);


    // League mutations
    const createLeagueMutation = useMutation({
        mutationFn: async (data: Omit<League, 'leagueId'>) => {
            const token = await getToken();
            if (!token) throw new Error("No Token User Authenticated")
            return createLeague(data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leagues'] });
        },
        onError: (error: Error) => {
            console.error('League Creation Failed', error);
        }
    });

    const updateLeagueMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<League> }) => {
            const token = await getToken();
            if (!token) throw new Error("No Login Token")
            return updateLeague(id, data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leagues'] });
        },
        onError: (error: Error) => {
            console.error('League Update Failed', error);
        }
    });

    const deleteLeagueMutation = useMutation({
        mutationFn: async (data: { id: number }) => {
            const token = await getToken();
            if (!token) throw new Error("No Login Token")
            return deleteLeague(data.id, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leagues'] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-events'] });
        },
        onError: (error: Error) => {
            console.error('League Deletion Failed', error);
        }
    });

    // Event mutations
    const createEventMutation = useMutation({
        mutationFn: async (data: Omit<Event, 'id'>) => {
            const token = await getToken();
            if (!token) throw new Error("No Login Token")
            return createEvent(data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-events'] });
        },
        onError: (error: Error) => {
            console.error('Event Creation Failed', error);
        }
    });

    const updateEventMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number | string; data: Partial<Event> }) => {
            const token = await getToken();
            if (!token) throw new Error("No Login Token")
            return updateEvent(id, data, token)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-events'] });
        },
        onError: (error: Error) => {
            console.error('Event Update Failed', error);
        }
    });

    const updateLeaderboardMutation = useMutation({
        mutationFn: async ({ leagueId, data }: { leagueId: number; data: LeaderboardEntry[] }) => {
            const token = await getToken();
            if (!token) throw new Error('No Login Token');
            return updateLeaderboard(leagueId, data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
            queryClient.invalidateQueries({ queryKey: ['leagues'] }); // Invalidate leagues to refresh hasStandings
        },
        onError: (error: Error) => {
            console.error('Leaderboard Update Failed', error);
        }
    });

    const deleteEventMutation = useMutation({
        mutationFn: async (data: { id: number | string; excludeDate?: string }) => {
            const token = await getToken();
            if (!token) throw new Error("No Login Token")
            return deleteEvent(data.id, token, data.excludeDate);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-events'] });
        },
        onError: (error: Error) => {
            console.error('Event Deletion Failed', error);
        }
    });

    // triggers for buttons

    // opens league creation modal (regular)
    const handleAddLeagueTrigger = useCallback(() => {
        setEditingLeague(null);
        setIsEditingLeague(true);
    }, []);

    // opens championship series creation modal — pre-sets isChampionshipSeries = true
    const handleAddChampionshipLeagueTrigger = useCallback(() => {
        setEditingLeague({ leagueId: 0, name: '', isChampionshipSeries: true } as League);
        setIsEditingLeague(true);
    }, []);

    // opens league editing modal
    const handleEditLeagueTrigger = useCallback((league: League) => {
        setEditingLeague(league);
        setIsEditingLeague(true);
    }, []);

    // confirms deletion of a league and deletes it
    const handleDeleteLeagueTrigger = useCallback((league: League) => {
        if (window.confirm(`Are you sure you want to delete ${league.name}?`)) {
            deleteLeagueMutation.mutate({ id: league.leagueId });
        }
    }, [deleteLeagueMutation]);

    // opens event creation modal
    const handleAddEventTrigger = useCallback(() => {
        setEditingEvent(null);
        setIsEditingEvent(true);
    }, []);

    // opens event editing modal
    const handleEditEventTrigger = useCallback((event: Event) => {
        setEditingEvent(event);
        setIsEditingEvent(true);
    }, []);

    // confirms deletion of an event and deletes it
    const handleDeleteEventTrigger = useCallback((event: Event) => {
        const msg = event.isRecurring
            ? `Are you sure you want to delete the ENTIRE weekly series for "${event.name}"?`
            : `Are you sure you want to delete "${event.name}"?`;
        if (window.confirm(msg)) {
            deleteEventMutation.mutate({ id: event.id });
        }
    }, [deleteEventMutation]);

    // excludes a single occurrence of a recurring event
    const handleExcludeEventTrigger = useCallback((event: Event) => {
        if (window.confirm(`Are you sure you want to exclude the occurrence on ${event.date} for "${event.name}"?`)) {
            deleteEventMutation.mutate({ id: event.id, excludeDate: event.date });
        }
    }, [deleteEventMutation]);

    // restores an excluded occurrence of a recurring event
    const handleUnexcludeEventTrigger = useCallback((event: Event) => {
        if (window.confirm(`Are you sure you want to restore the occurrence on ${event.date} for "${event.name}"?`)) {
            const newExcludedDates = (event.excludedDates ?? []).filter((d: string) => d !== event.date);
            updateEventMutation.mutate({ id: event.id, data: { excludedDates: newExcludedDates } });
        }
    }, [updateEventMutation]);

    // opens leaderboard management modal
    const handleManageStandingsTrigger = useCallback(async () => {
        if (!activeLeague) return;
        try {
            const existing = await loadLocalLeaderboard(activeLeague.leagueId);
            setLeaderboardDraft(existing ?? { data: [] });
        } catch (error) {
            console.error('Failed to load leaderboard data', error);
            setLeaderboardDraft({ data: [] });
        }
        setIsEditingLeaderboard(true);
    }, [activeLeague]);

    // handles league submission, creating or updating
    const handleLeagueSubmit = useCallback((data: Omit<League, 'leagueId'>) => {
        if (editingLeague && editingLeague.leagueId !== 0) {
            updateLeagueMutation.mutate({ id: editingLeague.leagueId, data });
        } else {
            createLeagueMutation.mutate(data);
        }
        setIsEditingLeague(false);
    }, [editingLeague, createLeagueMutation, updateLeagueMutation]);

    // handles event submission, creating or updating
    const handleEventSubmit = useCallback((data: Omit<Event, 'id'>) => {
        if (editingEvent) {
            updateEventMutation.mutate({ id: editingEvent.id, data });
        } else {
            createEventMutation.mutate(data);
        }
        setIsEditingEvent(false);
    }, [editingEvent, createEventMutation, updateEventMutation]);

    // handles leaderboard submission
    const handleLeaderboardSubmit = useCallback(async (data: LeaderboardEntry[]) => {
        if (!activeLeague) {
            throw new Error('No league selected');
        }
        await updateLeaderboardMutation.mutateAsync({ leagueId: activeLeague.leagueId, data });
        setIsEditingLeaderboard(false);
    }, [activeLeague, updateLeaderboardMutation]);

    if (isLeaguesLoading || isEventTypesLoading || isEventsLoading) {
        return <SuspenseLoader message="Loading admin manager..." />;
    }

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 animate-swipe-up sm:px-6 sm:py-6 lg:px-8 lg:py-6">
            <h1 className="sr-only">Play! South Wales Admin Dashboard</h1>
            <div className="rounded-lg border-2 border-border-color bg-bg-card p-4 shadow-main sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-col gap-1.5 [&_h2]:text-[clamp(1.35rem,2vw,1.85rem)] [&_h2]:font-extrabold [&_h2]:text-text-darker [&_h2]:tracking-tight [&_p]:text-text-muted [&_p]:text-[14px]">
                        <h2>League Manager</h2>
                        <p>Pick a league to manage its events, update standings, or create a new series.</p>
                    </div>
                    <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:min-w-[24rem]">
                        <div className="rounded-md border border-border-color/70 bg-bg-main px-3 py-2 text-[12px] text-text-muted">
                            Select a league first to unlock event actions.
                        </div>
                        <div className="rounded-md border border-border-color/70 bg-bg-main px-3 py-2 text-[12px] text-text-muted">
                            Sync tools update site data from the official sources.
                        </div>
                    </div>
                </div>
            </div>

            {/* Championship Series — always pinned, always visible */}
            <div className="bg-bg-card border-2 border-amber-500/30 rounded-lg p-4 shadow-main flex flex-col gap-4 sm:p-5">
                <div className="flex flex-col gap-3 border-b-2 border-border-color pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-0.5">
                        <h3 className="text-base font-bold flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                            Championship Series
                        </h3>
                        <p className="text-[12px] text-text-muted">Worlds, Regionals &amp; Special Events</p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-secondary min-h-11 text-amber-600 border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/5 text-sm w-full sm:w-auto"
                        onClick={handleAddChampionshipLeagueTrigger}
                    >
                        Create Championship Series
                    </button>
                </div>
                {championshipLeagues.length > 0 ? (
                    <LeagueSelector
                        leagues={championshipLeagues}
                        selectedLeagueId={selectedLeagueId}
                        setSelectedLeagueId={setSelectedLeagueId}
                        showAdminControls={false}
                        onEdit={handleEditLeagueTrigger}
                        onDelete={undefined}
                        columns={4}
                        showInfo={false}
                    />
                ) : (
                    <div className="rounded-md border border-dashed border-border-color/70 bg-bg-main px-4 py-8 text-center text-text-muted text-sm">
                        <p className="font-medium">No championship series added yet.</p>
                        <p className="mt-1 text-[12px] text-text-muted/70">Create one for Worlds, Regionals, or any other flagship event.</p>
                    </div>
                )}
            </div>

            <div className="rounded-lg border-2 border-border-color bg-bg-card p-4 shadow-main sm:p-5">
                <LeagueSelector
                    leagues={regularLeagues}
                    selectedLeagueId={selectedLeagueId}
                    setSelectedLeagueId={setSelectedLeagueId}
                    showAdminControls={true}
                    onAdd={handleAddLeagueTrigger}
                    onEdit={handleEditLeagueTrigger}
                    onDelete={handleDeleteLeagueTrigger}
                    columns={4}
                    showInfo={false}
                />
            </div>

            <div className="bg-bg-card border-2 border-border-color rounded-lg p-4 shadow-main flex flex-col gap-5 sm:p-5">
                <div className="flex flex-col gap-2 border-b-2 border-border-color pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-bold">System Synchronizations</h3>
                        <p className="text-[12px] text-text-muted">Use these when official data changes upstream.</p>
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        className="btn btn-secondary min-h-11 cursor-pointer w-full"
                        onClick={handleSyncPokedata}
                        disabled={isSyncingPokedata}
                    >
                        {isSyncingPokedata ? "Syncing official events..." : "Sync Official Events"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary min-h-11 cursor-pointer w-full"
                        onClick={handleSyncSets}
                        disabled={isSyncingSets}
                    >
                        {isSyncingSets ? "Syncing set legality..." : "Sync Set Legality"}
                    </button>
                </div>
            </div>


            {activeLeague && (
                <div key={activeLeague.leagueId} className="animate-swipe-down bg-bg-card border-2 border-border-color rounded-lg p-4 shadow-main flex flex-col gap-5 sm:p-5">
                    <div className="flex flex-col gap-3 border-b-2 border-border-color pb-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-base font-bold">
                                {activeLeague.isChampionshipSeries
                                    ? `Championship Events (${activeLeague.name})`
                                    : `Scheduled Events (${activeLeague.name})`}
                            </h3>
                            <p className="text-[12px] text-text-muted">Edit the schedule, standings, or individual entries for this league.</p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 sm:justify-end">
                            <button
                                type="button"
                                className="btn btn-secondary min-h-11 cursor-pointer w-full"
                                onClick={handleManageStandingsTrigger}
                            >
                                Edit Standings
                            </button>
                            <button type="button" className="btn btn-primary min-h-11 w-full" onClick={handleAddEventTrigger}>
                                {activeLeague.isChampionshipSeries ? 'Add Championship Event' : 'Schedule New Event'}
                            </button>
                        </div>
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
                            <p>There are no events matching your filters. Click "{activeLeague.isChampionshipSeries ? 'Add Championship Event' : 'Add New Event'}" to create one.</p>
                        </div>
                    ) : (
                        <ListView
                            events={groupedEvents}
                            leagueMap={leagueMap}
                            types={eventTypes}
                            onEdit={handleEditEventTrigger}
                            onDelete={handleDeleteEventTrigger}
                            onExclude={handleExcludeEventTrigger}
                            onUnexclude={handleUnexcludeEventTrigger}
                        />
                    )}
                </div>
            )}

            {!activeLeague && (
                <div className="bg-bg-card border-2 border-border-color rounded-lg p-5 shadow-main text-center text-text-muted">
                    <h3 className="text-base font-bold text-text-darker">Select a league to continue</h3>
                    <p className="mt-2 text-[14px]">Use the league cards above to open event tools and standings for that league.</p>
                </div>
            )}

            <LeagueFormModal
                key={isEditingLeague ? `league-${editingLeague?.leagueId ?? 'new'}` : 'closed-league'}
                isOpen={isEditingLeague}
                onClose={() => setIsEditingLeague(false)}
                onSubmit={handleLeagueSubmit}
                initialData={editingLeague}
            />
            <EventFormModal
                key={isEditingEvent ? `event-${editingEvent?.id ?? 'new'}` : 'closed-event'}
                isOpen={isEditingEvent}
                onClose={() => setIsEditingEvent(false)}
                onSubmit={handleEventSubmit}
                initialData={editingEvent}
                leagueId={selectedLeagueId ?? 0}
                isChampionshipLeague={activeLeague?.isChampionshipSeries ?? false}
            />
            <LeaderboardFormModal
                key={isEditingLeaderboard ? `leaderboard-${activeLeague?.leagueId ?? 'new'}` : 'closed-leaderboard'}
                isOpen={isEditingLeaderboard}
                onClose={() => setIsEditingLeaderboard(false)}
                onSubmit={handleLeaderboardSubmit}
                leagueId={activeLeague?.leagueId ?? 0}
                initialData={leaderboardDraft}
            />
        </div>
    );
};

export default AdminPage;