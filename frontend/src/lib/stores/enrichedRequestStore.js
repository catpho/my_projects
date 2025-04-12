//@ts-nocheck
import { derived } from 'svelte/store';
import { userStore } from './userStore';
import { requestStore } from './requestStore';

export const enrichedRequestStore = derived(
    [userStore, requestStore],
    ([$userStore, $requestStore]) => {
        // Initialize with default values if stores are not properly loaded
        const users = Array.isArray($userStore?.users) ? $userStore.users : [];
        const requests = Array.isArray($requestStore?.requests) ? $requestStore.requests : [];
        const isLoading = $requestStore?.isLoading ?? false;

        // Early return if no data
        if (!users.length || !requests.length) {
            return { isLoading, requests: [] };
        }

        // Safely map requests to enriched objects
        const enrichedRequests = requests.map(request => {
            if (!request) return null;

            const sender = users.find(user => user?.id === request?.fromUserA);

            return {
                ...request,
                sender: sender || {
                    id: request?.fromUserA || 'unknown',
                    displayName: 'Unknown User',
                    photoURL: null
                }
            };
        }).filter(Boolean); // Remove any null entries

        return {
            isLoading,
            requests: enrichedRequests
        };
    },
    { isLoading: true, requests: [] } // Initial value
);