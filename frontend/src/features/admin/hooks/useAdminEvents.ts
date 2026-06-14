import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent as apiCreateEvent, updateEvent as apiUpdateEvent, deleteEvent as apiDeleteEvent, loadEvents } from '@services/api';
import type { Event } from '@/types/Event';

/**
 * Custom hook to handle events querying and mutations for league administration.
 * 
 * @param {number | null} selectedLeagueId - The ID of the currently selected league to manage.
 * @returns Object containing queries, loading indicators, and mutation triggers.
 */
export function useAdminEvents(selectedLeagueId: number | null, month?: number, year?: number) {
    const queryClient = useQueryClient();

    // Query events
    const { data: events = [], isLoading: isEventsLoading } = useQuery<Event[]>({
        queryKey: ['events', 'league', selectedLeagueId, year, month],
        queryFn: () => loadEvents(month, year, selectedLeagueId ?? undefined),
        enabled: selectedLeagueId !== null,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: apiCreateEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
        onError: (error: Error) => {
            console.error('Event Creation Failed', error);
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Event> }) => apiUpdateEvent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
        onError: (error: Error) => {
            console.error('Event Update Failed', error);
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: apiDeleteEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
        onError: (error: Error) => {
            console.error('Event Deletion Failed', error);
        }
    });

    return {
        events,
        isEventsLoading,
        createEvent: createMutation.mutateAsync,
        updateEvent: updateMutation.mutateAsync,
        deleteEvent: deleteMutation.mutateAsync,
        isSaving: createMutation.isPending || updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
