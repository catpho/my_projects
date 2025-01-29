<script>
    //@ts-nocheck
    import { onMount } from 'svelte';
    import {userStore, userHandlers} from '$lib/stores/userStore';
    import { noteStore, noteHandlers } from '$lib/stores/noteStore';
	

    let showModal = false;
    let isEditing = false;
    let noteID = null;  // Track the ID of the note being edited
    let noteData = { title: '', type: 'written', tags: '', access: 'Private', content: '', imageUrls: [] };
  

    function openModal() {
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        noteData = { title: '', type: 'written', tags: '', access: 'Private', content: '', imageUrls: [] };
        isEditing = false;
        noteID = null;  // Reset noteID when closing the modal
    }

    async function handleSaveNote() {
        if (typeof noteData.tags === 'string') {
        noteData.tags = noteData.tags.split(',').map(tag => tag.trim());
        }
        if (isEditing) {
            await noteHandlers.updateNote(noteID, noteData);  // Use noteID for updating the note
        } else {
            await noteHandlers.createNote(noteData);
        }
        await noteHandlers.getNotes();
        closeModal();
    }

    // When editing, populate the form fields with the note's data
    function handleEditNote(note) {
        isEditing = true;
        noteID = note.id;  // Set noteID when editing a note
        noteData = { ...note }; // Copy the note data into noteData
        openModal();  // Open the modal for editing
    }



        onMount(() => {
            // Fetch the notes
            noteHandlers.getNotes();

            // Check the user login state
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    // User is signed in, store user info
                    currentUserStore.set(user);
                } else {
                    // No user is signed in
                    currentUserStore.set(null);
                }
            });
        });

</script>

<!--FIXME: need to check if the notes are connected to one user at a time. then make sure the user is fetched through this page so can see the user name -->


<div>HEY YOU'VE REACHED PERSONAL PAGE</div>

<button on:click={openModal}>Add New Note</button>

<div class="notes-list">
    {#each $noteStore.notes as note}
        <div class="note-item">
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <ul>
                {#each note.tags as tag}
                    <li>{tag}</li>
                {/each}
            </ul>
            <p><strong>Access:</strong> {note.access}</p>
            <p><strong>Created At:</strong> 
                {note.noteCreatedAt ? new Date(note.noteCreatedAt.seconds * 1000).toLocaleString() : 'N/A'}
              </p>
              <p><strong>Last Updated:</strong> 
                {note.lastUpdated ? new Date(note.lastUpdated.seconds * 1000).toLocaleString() : 'N/A'}
              </p>
              
              <!-- Edit and Delete Buttons-->
              <button class="edit-btn" on:click={() => handleEditNote(note)}>✏️ Edit</button>
              <button class="delete-btn" on:click={() => noteHandlers.deleteNote(note.id)}>🗑️ Delete</button>

        </div>
    {/each}
</div>

{#if showModal}
    <div class="modal">
        <div class="modal-content">
            <h2>{isEditing ? 'Edit Note' : 'Create a New Note'}</h2>

            <label for="title">Title:</label>
            <input type="text" id="title" bind:value={noteData.title} />  <!-- Pre-filled with noteData.title -->

            <label for="type">Type:</label>
            <select id="type" bind:value={noteData.type}>
                <option value="written" selected={noteData.type === 'written'}>Written</option>
                <option value="spoken" selected={noteData.type === 'spoken'}>Spoken</option>
                <option value="images" selected={noteData.type === 'images'}>Images</option>
                <option value="hybrid" selected={noteData.type === 'hybrid'}>Hybrid</option>
            </select>

            <label for="tags">Tags:</label>
            <input type="text" id="tags" bind:value={noteData.tags} placeholder="Comma-separated tags" />

            <label for="content">Content:</label>
            <textarea id="content" bind:value={noteData.content}></textarea>

            <label for="access">Access:</label>
            <select id="access" bind:value={noteData.access}>
                <option value="Public" selected={noteData.access === 'Public'}>Public</option>
                <option value="Private" selected={noteData.access === 'Private'}>Private</option>
            </select>

            <button on:click={handleSaveNote}>{isEditing ? 'Update Note' : 'Save Note'}</button>
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

input, select, textarea {
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

/* Styling for Edit and Delete Buttons */
.edit-btn, .delete-btn {
    background: none;
    border: none;
    color: #333;
    font-size: 18px;
    cursor: pointer;
    margin-left: 10px;
}

.edit-btn:hover, .delete-btn:hover {
    color: #4CAF50;
}
</style>
