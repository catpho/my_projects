// @ts-nocheck
import { writable, derived } from 'svelte/store';
import { db } from '$lib/firebase/firebase.client';
import { collection, doc, getDocs, query, where, addDoc, updateDoc, getDoc } from 'firebase/firestore';

// Create request store
export const requestStore = writable({
    isLoading: false,
    requests: []
});

// Request handlers
export const requestHandlers = {
    sendRequest: async (fromUserA, toUserB) => {
        try {
            const requestsRef = collection(db, 'requests');
            const requestData = await addDoc(requestsRef, {
                fromUserA,
                toUserB,
                status: 'Pending',
                requestSentAt: new Date().toISOString()
            });
            return requestData.id;
        } catch (error) {
            console.error('Error sending request:', error);
            return null;
        }
    },

    getRequests: async (userId) => {
        try {
            requestStore.update(store => ({ ...store, isLoading: true }));

            const requestsRef = collection(db, 'requests');
            const q = query(
                requestsRef,
                where('toUserB', '==', userId),
                where('status', '==', 'Pending')
            );
            const querySnapshot = await getDocs(q);

            const requests = [];
            querySnapshot.forEach((doc) => {
                requests.push({ id: doc.id, ...doc.data() });
            });

            requestStore.set({ isLoading: false, requests });
            return requests;
        } catch (error) {
            console.error('Error fetching requests:', error);
            requestStore.set({ isLoading: false, requests: [] });
            return [];
        }
    },

    acceptRequest: async (requestId) => {
        try {
            const requestRef = doc(db, 'requests', requestId);
            await updateDoc(requestRef, { status: 'Accepted' });
            return true;
        } catch (error) {
            console.error('Error accepting request:', error);
            return false;
        }
    },

    rejectRequest: async (requestId) => {
        try {
            const requestRef = doc(db, 'requests', requestId);
            await updateDoc(requestRef, { status: 'Rejected' });
            return true;
        } catch (error) {
            console.error('Error rejecting request:', error);
            return false;
        }
    }
};