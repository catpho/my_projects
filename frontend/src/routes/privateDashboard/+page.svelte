<script>
	//@ts-nocheck

	import { userStore } from '$lib/stores/userStore';
	import { noteStore, noteHandlers } from '$lib/stores/noteStore';
	import { authStore } from '$lib/stores/authStore';
	import { doc, getDoc, updateDoc } from 'firebase/firestore';
	import { db } from '$lib/firebase/firebase.client';
	import { Search } from 'flowbite-svelte';

	let userData = null;
	$: notes = [];
	let personalNoteBoard = [];
	let userId = null;
	let showModal = false;
	let isEditing = false;
	let noteID = null; // Track the ID of the note being edited
	let noteData = {
		title: '',
		type: 'written',
		tags: '',
		access: 'Private',
		content: '',
		imageUrls: []
	};

	noteStore.subscribe((state) => {
		notes = state?.notes;
	});

	userStore.subscribe((state) => {
		if (state?.currentUser?.uid) {
			fetchPersonalNoteBoard(state.currentUser.uid);
		}
	});

	async function fetchPersonalNoteBoard(userId) {
		try {
			await noteHandlers.getUserNotes(userId);
			// Filter only private notes from the global notes store
			personalNoteBoard = notes.filter((note) => note.access === 'Private');
		} catch (error) {
			console.error('Error fetching personal notes:', error);
		}
	}
	async function updateUserPersonalNotes() {
		if (!userId) return;

		const userRef = doc(db, 'users', userId);
		await updateDoc(userRef, { personalNoteBoard });
	}
	function openModal() {
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		noteData = {
			title: '',
			type: 'written',
			tags: '',
			access: 'Private',
			content: '',
			imageUrls: []
		};
		isEditing = false;
		noteID = null; // Reset noteID when closing the modal
	}

	// try catch errors so that if there is issue, the action wont go through
	async function handleSaveNote() {
		if (typeof noteData.tags === 'string') {
			noteData.tags = noteData.tags.split(',').map((tag) => tag.trim());
		}
		if (isEditing) {
			await noteHandlers.updateNote(noteID, noteData, userId);

			// If the access is changed to Public, remove it from personalNoteBoard
			if (noteData.access === 'Public') {
				personalNoteBoard = personalNoteBoard.filter((note) => note.id !== noteID);
				await updateUserPersonalNotes();
			}
			// If the access is Private, and it wasn't already in the personal board, add it
			else if (
				noteData.access === 'Private' &&
				!personalNoteBoard.some((note) => note.id === noteID)
			) {
				personalNoteBoard = [...personalNoteBoard, noteData];
				await updateUserPersonalNotes();
			}
		} else {
			await noteHandlers.createNote(noteData, userId);

			if (noteData.access == 'Private') {
				personalNoteBoard = [...personalNoteBoard, noteData];
				await updateUserPersonalNotes();
			}
		}

		closeModal();
	}

	// When editing, populate the form fields with the note's data
	function handleEditNote(note) {
		isEditing = true;
		noteID = note.id; // Set noteID when editing a note
		noteData = { ...note }; // Copy the note data into noteData
		openModal(); // Open the modal for editing
	}
</script>

<Search class="bg-white" placeholder="Search notes..."></Search>

{#if notes.length > 0}
	<div class="mt-5">
		{#each notes as note}
			<div class=" mb-5 w-2/4 rounded-2xl bg-white p-4">
				<div class="mb-5 flex justify-between font-bold">
					<h3>{note.title}</h3>
					<span class="text-2xl text-gray-500">...</span>
				</div>
				<p>{note.content}</p>
				<ul>
					{#each note.tags as tag}
						<li>{tag}</li>
					{/each}
				</ul>
				<!-- <p><strong>Access:</strong> {note.access}</p> -->
				<p>
					{note.noteCreatedAt
						? (() => {
								const date = new Date(note.noteCreatedAt.seconds * 1000);
								return `${date.toLocaleDateString('en-GB', { weekday: 'long' })}, ${date.toLocaleDateString(
									'en-GB',
									{
										day: '2-digit',
										month: 'long',
										year: '2-digit'
									}
								)}`;
							})()
						: 'N/A'}
				</p>
				<!-- <p>
					<strong>Last Updated:</strong>
					{note.lastUpdated ? new Date(note.lastUpdated.seconds * 1000).toLocaleString() : 'N/A'}
				</p> -->

				<!-- <button class="edit-btn" on:click={() => handleEditNote(note)}>✏️ Edit</button>
				<button class="delete-btn" on:click={() => noteHandlers.deleteNote(note.id, userId)}
					>🗑️ Delete</button
				> -->
			</div>
		{/each}
	</div>
{:else}
	<div>User has no notes.</div>
{/if}

<!-- svelte-ignore a11y_consider_explicit_label -->
<button class="flex items-center justify-center rounded-full bg-white p-5" on:click={openModal}>
	<svg
		class="h-6 w-6 text-gray-800 dark:text-white"
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		fill="none"
		viewBox="0 0 24 24"
	>
		<path
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="m4.988 19.012 5.41-5.41m2.366-6.424 4.058 4.058-2.03 5.41L5.3 20 4 18.701l3.355-9.494 5.41-2.029Zm4.626 4.625L12.197 6.61 14.807 4 20 9.194l-2.61 2.61Z"
		/>
	</svg>
</button>

{#if showModal}
	<div class="modal">
		<div class="modal-content">
			<h2>{isEditing ? 'Edit Note' : 'Create a New Note'}</h2>

			<label for="title">Title:</label>
			<input type="text" id="title" bind:value={noteData.title} />

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

	input,
	select,
	textarea {
		width: 100%;
		padding: 8px;
		margin-bottom: 15px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	button {
		cursor: pointer;
	}

	button:hover {
		background-color: #457da0;
	}
</style>
