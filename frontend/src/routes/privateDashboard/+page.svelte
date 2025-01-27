<script>
    //@ts-nocheck
    import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore"; 

    let notes = []; 
// Initialize Firebase Firestore (ensure Firebase is already initialized elsewhere in your app)
    const db = getFirestore();
    let showModal = false;  // State to control the visibility of the modal
    let noteData = {
        title: '',
        type: 'written', // Default to 'written'
        tags: [],
        access: 'Private',
        content:'',
        imageUrls: [] // You might need to initialize imageUrls too if it's part of the data
    };

    // Function to open the modal for creating a new note
    function openModal() {
        showModal = true;
    }

    // Function to close the modal
    function closeModal() {
        showModal = false;
    }

    // Function to save the new note (you'll need to integrate it with Firebase or another backend)
    async function saveNote() {
        // Add the logic to save the note to Firestore, such as calling the createNote function
        console.log("Saving new note:", noteData);
        // Close the modal after saving
        try {
            // Handle tags: if it's a string, split by commas, else assume it's already an array
            const tagsArray = noteData.tags.length > 0 ? noteData.tags : [];

            // Prepare the new note object
            const newNote = {
                title: noteData.title,
                type: noteData.type,  // 'written', 'spoken', etc.
                tags: tagsArray,      // Tags are now an array
                access: noteData.access,  // Public or Private
                content: noteData.content,
                noteCreatedAt: new Date(),  // Use JavaScript Date object for created timestamp
                lastUpdated: new Date(),    // Use JavaScript Date object for last updated timestamp
                imageUrls: noteData.imageUrls || [], // Optional: handle images if provided
            };

            // Add the new note to Firestore (you need to use Firebase Firestore methods here)
            const docRef = await addDoc(collection(db, "notes"), newNote);

            // Log the document ID to confirm it's been saved
            console.log("Document written with ID: ", docRef.id);

            // Optionally close the modal or reset the form
            closeModal();  // Assuming closeModal is a function to close the modal
        } catch (error) {
            console.error("Error saving note:", error);
        }
    }

    // Function to fetch notes from Firestore
    async function fetchNotes() {
        try {
        const querySnapshot = await getDocs(collection(db, "notes"));
        notes = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Timestamp fields to Date objects
                noteCreatedAt: data.noteCreatedAt ? data.noteCreatedAt.toDate() : null,
                lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : null,
            };
        });
        console.log("Fetched notes:", notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
    }
}

    // Fetch notes when the component is mounted
    fetchNotes();
</script>

<div>HEY YOU'VE REACHED PERSONAL PAGE</div>
<!-- Button to trigger the modal for creating a new note -->
<button on:click={openModal}>Add New Note</button>

<div class="notes-list">
    {#each notes as note}
        <div class="note-item">
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <ul>
                {#each note.tags as tag}
                    <li>{tag}</li>
                {/each}
            </ul>
            <p><strong>Access:</strong> {note.access}</p>
            <p><strong>Created At:</strong> {new Date(note.noteCreatedAt).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {new Date(note.lastUpdated).toLocaleString()}</p>
        </div>
    {/each}
</div>

<!-- Modal for creating a new note -->
{#if showModal}
    <div class="modal">
        <div class="modal-content">
            <h2>Create a New Note</h2>

            <label for="title">Title:</label>
            <input type="text" id="title" bind:value={noteData.title} placeholder="Enter note title" />

            <label for="type">Type:</label>
            <select id="type" bind:value={noteData.type}>
                <option value="written">Written</option>
                <option value="spoken">Spoken</option>
                <option value="images">Images</option>
                <option value="hybrid">Hybrid</option>
            </select>

            <label for="tags">Tags:</label>
            <input type="text" id="tags" bind:value={noteData.tags} placeholder="Enter tags (comma separated)" />

            <label for="content">Content:</label>
            <textarea id="content" bind:value={noteData.content} placeholder="Enter the content of the note"></textarea>

            <label for="access">Access:</label>
            <select id="access" bind:value={noteData.access}>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
            </select>

            <!-- Save Button -->
            <button on:click={saveNote}>Save Note</button>

            <!-- Cancel Button -->
            <button on:click={closeModal}>Cancel</button>
        </div>
    </div>
{/if}

<style>
/* Basic styles for the modal */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    width: 300px;
}

label {
    display: block;
    margin: 10px 0 5px;
}

input, select {
    width: 100%;
    padding: 8px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    padding: 10px;
    margin-top: 10px;
    width: 100%;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}
/* Style for the notes list */
.notes-list {
    margin-top: 20px;
}

.note-item {
    background-color: #f9f9f9;
    padding: 15px;
    margin-bottom: 20px;
    border-radius: 5px;
    border: 1px solid #ddd;
}

.note-item h3 {
    margin-top: 0;
}

.note-item ul {
    list-style-type: none;
    padding: 0;
}

.note-item ul li {
    display: inline-block;
    margin-right: 5px;
    background-color: #e0e0e0;
    padding: 5px;
    border-radius: 3px;
}
</style>
