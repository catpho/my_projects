// @ts-nocheck
import { writable } from 'svelte/store';
import { db } from '$lib/firebase/firebase.client';
import { auth } from '$lib/firebase/firebase.client';
import { addDoc, deleteDoc, updateDoc, getDoc, getDocs, collection, doc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';


export const userStore = writable({
    isLoading: true,
    users: [], // Store user data as an array
    currentUser: null
});

onAuthStateChanged(auth, (user) => {
    userStore.set({
        isLoading: false,
        currentUser: user
    });
});

// CRUD operations for users
export const userHandlers = {
    getUsers: async () => {
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            const users = [];
            snapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });
            userStore.set({ isLoading: false, users });
            console.log('Users fetched successfully');
        } catch (error) {
            console.error('Error fetching users:', error);
            userStore.set({ isLoading: false, users: [] });
        }
    },

    getUser: async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                userStore.set({ isLoading: false, currentUser: { id: userDoc.id, ...userData } });
                console.log('User fetched successfully');
                console.log('data', userDoc.data());
                return userDoc.data();
            } else {
                userStore.set({ isLoading: false, currentUser: null });
                console.log('User not found');
                return null;
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            userStore.set({ isLoading: false, currentUser: null });
            return null;
        }
    },

    searchUsers: async (searchTerm) => {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('displayName', '>=', searchTerm), where('displayName', '<=', searchTerm + '\uf8ff'));
            const querySnapshot = await getDocs(q);

            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });

            return users;
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    },

    createUser: async (userData) => {
        try {
            const usersRef = collection(db, 'users');
            const newUserRef = await addDoc(usersRef, userData);
            console.log('User created successfully with ID:', newUserRef.id);
            return newUserRef.id;
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    },

    //user data to set up is in layout where auth is also kept 
    updateUser: async (userId, userData) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, userData);
            console.log('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
        }
    },


    deleteUser: async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            await deleteDoc(userRef);
            console.log('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    },

    sendCollabRequest: async (fromUserA, toUserB) => {
        try {
            const userRef = doc(db, 'users', toUserB);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const updatedCollabRequests = [...userData.CollabRequests, { fromUserA, status: 'pending', timestamp: new Date().toISOString() }];
                await updateDoc(userRef, { CollabRequests: updatedCollabRequests });
                console.log('Collab request sent successfully');
            } else {
                console.log('User not found');
            }
        } catch (error) {
            console.error('Error sending Collab request:', error);
        }
    },


    acceptCollabRequest: async (userId, requestId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const request = userData.CollabRequests.find(req => req.fromUserA === requestId);
                if (request) {
                    // Add to Collabs list
                    const updatedCollabs = [...userData.collaborators, request.fromUserA];
                    const updatedCollabRequests = userData.CollabRequests.filter(req => req.fromUserA !== requestId);
                    await updateDoc(userRef, { Collabs: updatedCollabs, CollabRequests: updatedCollabRequests });

                    // Also update the requester's Collabs list
                    const requesterRef = doc(db, 'users', request.fromUserA);
                    const requesterDoc = await getDoc(requesterRef);
                    if (requesterDoc.exists()) {
                        const requesterData = requesterDoc.data();
                        const requesterUpdatedCollabs = [...requesterData.collaborators, userId];
                        await updateDoc(requesterRef, { Collabs: requesterUpdatedCollabs });
                    }

                    console.log('Collab request accepted successfully');
                }
            } else {
                console.log('User not found');
            }
        } catch (error) {
            console.error('Error accepting Collab request:', error);
        }
    },
    getCollaborators: async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                return userData.collaborators || [];
            } else {
                console.log('User not found');
                return [];
            }
        } catch (error) {
            console.error('Error fetching collaborators:', error);
            return [];
        }
    },
    getCollabRequests: async (userId) => {
        try {
            const requestsRef = collection(db, 'requests');
            const q = query(requestsRef, where('fromUserA', '==', userId), where('status', '==', 'Pending'));
            const querySnapshot = await getDocs(q);

            const requests = [];
            querySnapshot.forEach((doc) => {
                requests.push({ id: doc.id, ...doc.data() });
            });

            return requests;
        } catch (error) {
            console.error('Error fetching collab requests:', error);
            return [];
        }
    },

    sendMessage: async (fromUserA, toUserB, message) => {
        try {
            const messagesRef = collection(db, 'messages');
            await addDoc(messagesRef, {
                fromUserA,
                toUserB,
                message,
                timestamp: new Date().toISOString(),
                isRead: false
            });
            console.log('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    },

    addNotification: async (userId, notification) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const updatedNotifications = [...userData.notifications, notification];
                await updateDoc(userRef, { notifications: updatedNotifications });
                console.log('Notification added successfully');
            } else {
                console.log('User not found');
            }
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    },
};