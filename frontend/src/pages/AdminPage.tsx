import { EventFormModal, LeagueFormModal } from "@/features/admin";
import { useLeagues, useEventTypes, useEvents } from "@/hooks";
import LeagueSelector from "@/features/league-selector";
import { useCallback, useState, useMemo } from "react";
import SuspenseLoader from "@/components/SuspenseLoader";
import { createLeagueMap, filterAndGroupEvents, ListView, NavBar } from "@calendar";
import { MONTH_NAMES } from "@/constants";
import { createEvent, createLeague, deleteEvent, deleteLeague, updateEvent, updateLeague } from "@/services/api";
import type { League } from "@/types/League";
import type { Event } from "@/types/Event";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const AdminPage: React.FC = () => {
    const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
    const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
    const [isEditingLeague, setIsEditingLeague] = useState<boolean>(false);
    const [isEditingEvent, setIsEditingEvent] = useState<boolean>(false);
    const [editingLeague, setEditingLeague] = useState<League | null>(null);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

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

    const queryClient = useQueryClient();

    // League mutations
    const createLeagueMutation = useMutation({
        mutationFn: (data: Omit<League, 'leagueId'>) => createLeague(data), // TODO: add token
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leagues'] });
        },
        onError: (error: Error) => {
            console.error('League Creation Failed', error);
        }
    });

    const updateLeagueMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<League> }) => updateLeague(id, data), // TODO: add token
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leagues'] });
        },
        onError: (error: Error) => {
            console.error('League Update Failed', error);
        }
    });

    const deleteLeagueMutation = useMutation({
        mutationFn: (data: { id: number }) => deleteLeague(data.id), // TODO: add token
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leagues'] });
        },
        onError: (error: Error) => {
            console.error('League Deletion Failed', error);
        }
    });

    // Event mutations
    const createEventMutation = useMutation({
        mutationFn: (data: Omit<Event, 'id'>) => createEvent(data), // TODO: add token
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
        onError: (error: Error) => {
            console.error('Event Creation Failed', error);
        }
    });

    const updateEventMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Event> }) => updateEvent(id, data), // TODO: add token
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
        onError: (error: Error) => {
            console.error('Event Update Failed', error);
        }
    });

    const deleteEventMutation = useMutation({
        mutationFn: (data: { id: number }) => deleteEvent(data.id), // TODO: add token
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
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
        if (window.confirm(`Are you sure you want to delete "${event.name}"?`)) {
            deleteEventMutation.mutate({ id: event.id });
        }
    }, [deleteEventMutation]);

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
        <div className="max-w-6xl mx-auto pb-6 flex flex-col gap-5 animate-swipe-up">
            <div className="flex flex-col gap-1.5 [&_h2]:text-[22px] [&_h2]:font-extrabold [&_h2]:text-text-darker [&_h2]:tracking-tight [&_p]:text-text-muted [&_p]:text-[14px]" style={{ animationDelay: '0ms' }}>
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
                <div key={activeLeague.leagueId} className="animate-swipe-down bg-bg-card border border-border-color rounded-lg p-5 shadow-main flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-border-color pb-2.5">
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
                        />
                    )}
                </div>
            )}

            <LeagueFormModal
                key={isEditingLeague ? (editingLeague?.leagueId ?? 'new') : 'closed'}
                isOpen={isEditingLeague}
                onClose={() => setIsEditingLeague(false)}
                onSubmit={handleLeagueSubmit}
                initialData={editingLeague}
            />
            <EventFormModal
                key={isEditingEvent ? (editingEvent?.id ?? 'new') : 'closed'}
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
