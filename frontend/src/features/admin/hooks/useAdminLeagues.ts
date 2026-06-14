import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLeague as apiCreateLeague, updateLeague as apiUpdateLeague, deleteLeague as apiDeleteLeague } from '@services/api';
import type { League } from '@/types/League';

/**
 * Custom hook to handle league mutations (create, update, delete) for league administration.
 * 
 * @returns Object containing mutation triggers and loading/saving indicators.
 */
export function useAdminLeagues() {
    const queryClient = useQueryClient();

    // Create league mutation
    const createMutation = useMutation({
        mutationFn: apiCreateLeague,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leagues'] });
        },
        onError: (error: Error) => {
            console.error('League Creation Failed', error);
        }
    });

    // Update league mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<League> }) => apiUpdateLeague(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leagues'] });
        },
        onError: (error: Error) => {
            console.error('League Update Failed', error);
        }
    });

    // Delete league mutation
    const deleteMutation = useMutation({
        mutationFn: apiDeleteLeague,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leagues'] });
        },
        onError: (error: Error) => {
            console.error('League Deletion Failed', error);
        }
    });

    return {
        createLeague: createMutation.mutateAsync,
        updateLeague: updateMutation.mutateAsync,
        deleteLeague: deleteMutation.mutateAsync,
        isSaving: createMutation.isPending || updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
