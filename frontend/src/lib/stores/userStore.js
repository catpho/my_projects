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

    getUser: async (userId, updateStore = false) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = { id: userDoc.id, ...userDoc.data() };

                // Only update store if explicitly requested (for current user)
                if (updateStore) {
                    userStore.set({ isLoading: false, currentUser: userData });
                }
                // console.log('userdata', userData)

                return userData;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user:', error);
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

    getCollabs: async (userId) => {
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
            console.error('Error fetching collabs:', error);
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