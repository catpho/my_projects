//@ts-nocheck
import { derived } from 'svelte/store';
import { userStore } from './userStore';
import { requestStore } from './requestStore';

export const enrichedRequestStore = derived(
    [userStore, requestStore],
    ([$userStore, $requestStore]) => {
        const users = Array.isArray($userStore?.users) ? $userStore.users : [];
        const rawRequests = Array.isArray($requestStore?.requests) ? $requestStore.requests : [];
        const isLoading = $requestStore?.isLoading ?? false;

        // Convert Firestore Timestamp to Date if needed
        const requests = rawRequests.map(request => ({
            ...request,
            requestSentAt: request.requestSentAt?.toDate?.() ||
                new Date(request.requestSentAt)
        }));

        if (isLoading || !users.length || !requests.length) {
            return { isLoading, requests: [] };
        }

        const enrichedRequests = requests.map(request => {
            const sender = users.find(user => user?.id === request.fromUserA);
            console.log(`Looking for user ${request.fromUserA} in`, users);
            return {
                ...request,
                sender: {
                    id: sender?.id || request.fromUserA || 'unknown',
                    displayName: sender?.displayName || 'Unknown User',
                    photoURL: sender?.photoURL || null,
                    // Add any other sender properties you might need
                }
            };
        });
        console.log('requests:', enrichedRequests)
        return {
            isLoading,
            requests: enrichedRequests
        };
    },
    { isLoading: true, requests: [] }
);