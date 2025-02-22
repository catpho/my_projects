//@ts-nocheck
import { writable } from 'svelte/store';
import { db } from '$lib/firebase/firebase.client';
import {
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    getDoc,
    getDocs,
    doc,
    serverTimestamp, query,
    where
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '$lib/firebase/firebase.client';
/**
 * @typedef {import('./components').Note} Note
 */

/** @type {{ isLoading: boolean, notes: Note[], currentNote: Note | null }} */
// Note store state
export const noteStore = writable({
    isLoading: true,
    notes: [],
    currentNote: null
});


// Handlers for note-related operations
export const noteHandlers = {
    // Fetch all notes
    getNotes: async () => {
        try {

            const notesRef = collection(db, 'notes');
            const notes = notesRef.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            noteStore.set({ isLoading: false, notes, currentNote: null });
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    },

    getUserNotes: async (userId) => {
        try {

            if (!userId) {
                throw new Error("User is not authenticated.");
            }

            const notesRef = collection(db, 'notes');
            const q = query(notesRef, where('userId', '==', userId)); // Query only the user's notes
            const snapshot = await getDocs(q);
            const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            noteStore.update((state) => ({ ...state, isLoading: false, notes, currentNote: null }));
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    },

    // Fetch a single note by ID
    getNote: async (noteId) => {
        try {

            const userId = auth.currentUser ? auth.currentUser.uid : null;

            if (!userId) {
                throw new Error("User is not authenticated.");
            }

            const noteRef = doc(db, 'notes', noteId);
            const noteDoc = await getDoc(noteRef);
            if (noteDoc.exists()) {
                noteStore.update(state => ({
                    ...state,
                    isLoading: false,
                    currentNote: { id: noteDoc.id, ...noteDoc.data() }
                }));

                if (noteData.userId !== userId) {
                    throw new Error("You do not have permission to view this note.");
                }
            } else {
                console.warn(`Note with ID ${noteId} does not exist.`);
                noteStore.update(state => ({
                    ...state,
                    isLoading: false,
                    currentNote: null
                }));
            }
        } catch (error) {
            console.error('Error fetching note:', error);
        }
    },

    searchNote: async (searchQuery) => {
        try {
            const userId = auth.currentUser ? auth.currentUser.uid : null;
            if (!userId) {
                throw new Error("User is not authenticated.");
            }

            // Query Firestore for notes belonging to the user that match the search query
            const notesRef = collection(db, 'notes');
            const q = query(
                notesRef,
                where("userId", "==", userId) // Ensure only user-owned notes are retrieved
            );

            const querySnapshot = await getDocs(q);
            const notes = [];

            querySnapshot.forEach((doc) => {
                const noteData = doc.data();
                // Perform client-side filtering for search terms
                if (
                    noteData.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    noteData.content.toLowerCase().includes(searchQuery.toLowerCase())
                ) {
                    notes.push({ id: doc.id, ...noteData });
                }
            });

            noteStore.update(state => ({
                ...state,
                isLoading: false,
                currentNotes: notes // Update store with filtered notes
            }));


        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    },
    // Add a new note
    createNote: async (noteData, userId) => {
        try {

            const notesRef = collection(db, 'notes');
            const newNoteRef = await addDoc(notesRef, {
                ...noteData,
                userId,
                imageUrls: [],
                noteCreatedAt: serverTimestamp(),
                lastUpdated: serverTimestamp(),

                // Initialize with an empty imageUrls array
            });

            await noteHandlers.getUserNotes(userId);
            return newNoteRef.id;

        } catch (error) {
            console.error('Error creating note:', error);
            throw error;
        }
    },

    // Upload note images and update the note with URLs
    uploadImages: async (noteId, imageFiles) => {
        try {
            const storage = getStorage();
            const imageUrls = await Promise.all(
                imageFiles.map(async (file) => {
                    const storageRef = ref(storage, `note_images/${noteId}/${file.name}`);
                    await uploadBytes(storageRef, file);
                    return getDownloadURL(storageRef);
                })
            );

            const noteRef = doc(db, 'notes', noteId);

            await updateDoc(noteRef, { imageUrls });
            return imageUrls;
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        }
    },

    // Update an existing note
    updateNote: async (noteId, noteData, userId) => {
        try {
            const noteRef = doc(db, 'notes', noteId);
            const noteDoc = await getDoc(noteRef);
            if (!noteDoc.exists() || noteDoc.data().userId !== userId) {
                throw new Error("You do not have permission to update this note.");
            }
            await updateDoc(noteRef, noteData);
            await noteHandlers.getUserNotes(userId);
            return noteId;
        } catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    },

    // Delete a note
    deleteNote: async (noteId, userId) => {

        const confirmation = window.confirm('Are you sure you want to delete this note?');
        if (confirmation) {
            try {
                const noteRef = doc(db, 'notes', noteId);
                const noteDoc = await getDoc(noteRef);
                if (!noteDoc.exists() || noteDoc.data().userId !== userId) {
                    throw new Error("You do not have permission to delete this note.");
                }
                await deleteDoc(noteRef);

                const userRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    let userData = userDoc.data();
                    let updatedPersonalNotes = userData.myNotes.filter(note => note.id !== noteId);

                    // Update the user's myNotes in Firestore
                    await updateDoc(userRef, { myNotes: updatedPersonalNotes });

                    // Optionally, update the local myNotes state for UI update
                    myNotes = updatedPersonalNotes;
                }

                await noteHandlers.getUserNotes(userId);
                alert('Note successfully deleted.');
            } catch (error) {
                console.error('Error deleting note:', error);
            }
        }
    },

    // Fetch a note image URL
    fetchImageUrl: async (noteId) => {
        try {
            const storage = getStorage();
            const storageRef = ref(storage, `note_images/${noteId}`);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error('Error fetching image URL:', error);
            throw error;
        }
    }
};