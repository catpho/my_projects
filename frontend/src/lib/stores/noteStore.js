//@ts-nocheck
import { writable } from 'svelte/store';
import { db } from '$lib/firebase/firebase.client';
import {
addDoc,
deleteDoc,
updateDoc,
getDoc,
getDocs,
collection,
doc,
serverTimestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
const snapshot = await getDocs(notesRef);
const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
noteStore.set({ isLoading: false, notes,currentNote: null });
} catch (error) {
console.error('Error fetching notes:', error);
}
},

// Fetch a single note by ID
getNote: async (noteId) => {
try {
const noteRef = doc(db, 'notes', noteId);
const noteDoc = await getDoc(noteRef);
if (noteDoc.exists()) {
noteStore.update(state => ({
...state,
isLoading: false,
currentNote: { id: noteDoc.id, ...noteDoc.data() }
}));
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

// Add a new note
createNote: async (noteData) => {
try {
const notesRef = collection(db, 'notes');
const newNoteRef = await addDoc(notesRef, {
...noteData,
imageUrls: [],
noteCreatedAt: serverTimestamp(),
lastUpdated: serverTimestamp()
 // Initialize with an empty imageUrls array
});
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
updateNote: async (noteId, noteData) => {
try {
const noteRef = doc(db, 'notes', noteId);
await updateDoc(noteRef, noteData);
return noteId;
} catch (error) {
console.error('Error updating note:', error);
throw error;
}
},

// Delete a note
deleteNote: async (noteId) => {
const confirmation = window.confirm('Are you sure you want to delete this note?');
if (confirmation) {
try {
const noteRef = doc(db, 'notes', noteId);
await deleteDoc(noteRef);
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