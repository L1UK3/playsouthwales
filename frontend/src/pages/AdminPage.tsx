import { EventFormModal, LeagueFormModal } from "@/features/admin";
import { useLeagues, useEventTypeMap, useEvents, useDocumentMetadata } from "@/hooks";
import LeagueSelector from "@/features/league-selector";
import { useCallback, useState, useMemo } from "react";
import SuspenseLoader from "@/components/SuspenseLoader";
import { createLeagueMap, filterAndGroupEvents, ListView, NavBar } from "@calendar";
import { MONTH_NAMES } from "@/constants";
import { createEvent, createLeague, deleteEvent, deleteLeague, updateEvent, updateLeague } from "@/services/api";
import type { League } from "@/types/League";
import type { Event } from "@/types/Event";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";

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
    const [editingLeague, setEditingLeague] = useState<League | null>(null);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    const { data: events = [], isLoading: isEventsLoading } = useEvents(currentDate, true);
    const { data: leagues = [], isLoading: isLeaguesLoading } = useLeagues();
    const { data: eventTypes = {}, isLoading: isEventTypesLoading } = useEventTypeMap();

    const activeLeague = leagues.find(l => l.leagueId === selectedLeagueId);

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

    // League mutations
    const createLeagueMutation = useMutation({
        mutationFn: async (data: Omit<League, 'leagueId'>) => {
            const token = await getToken();
            console.log(token)
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
        }, // TODO: add token
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

    // opens league creation modal
    const handleAddLeagueTrigger = useCallback(() => {
        setEditingLeague(null);
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

    // handles league submission, creating or updating
    const handleLeagueSubmit = useCallback((data: Omit<League, 'leagueId'>) => {
        if (editingLeague) {
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

    if (isLeaguesLoading || isEventTypesLoading || isEventsLoading) {
        return <SuspenseLoader message="Loading admin manager..." />;
    }

    return (
        <div className="flex flex-col gap-6 animate-swipe-up">
            <h1 className="sr-only">Play! South Wales Admin Dashboard</h1>
            <div className="flex flex-col gap-1.5 [&_h2]:text-[22px] [&_h2]:font-extrabold [&_h2]:text-text-darker [&_h2]:tracking-tight [&_p]:text-text-muted [&_p]:text-[14px]">
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
                    showInfo={false}
                />
            </div>

            {activeLeague && (
                <div key={activeLeague.leagueId} className="animate-swipe-down bg-bg-card border-2 border-border-color rounded-lg p-5 shadow-main flex flex-col gap-5">
                    <div className="flex justify-between items-center border-b-2 border-border-color pb-3">
                        <h3 className="text-base font-bold">Scheduled Events ({activeLeague.name})</h3>
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
                            onExclude={handleExcludeEventTrigger}
                            onUnexclude={handleUnexcludeEventTrigger}
                        />
                    )}
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
            />
        </div>
    );
};

export default AdminPage;
