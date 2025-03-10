<script>
	//@ts-nocheck

	import { userHandlers, userStore } from '$lib/stores/userStore';
	import { noteStore, noteHandlers } from '$lib/stores/noteStore';
	import { authStore } from '$lib/stores/authStore';
	import { doc, getDoc, updateDoc } from 'firebase/firestore';
	import { db } from '$lib/firebase/firebase.client';
	import { Search, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { fade, slide, fly } from 'svelte/transition';
	import { DotsHorizontalOutline } from 'flowbite-svelte-icons';
	let expanded = false;
	function toggleExpand() {
		expanded = !expanded;
	}

	let userData = null;
	$: notes = [];
	let myNotes = [];
	let userId = null;
	let showModal = false;
	let isEditing = false;
	let noteID = null; // Track the ID of the note being edited
	let newNoteId = null;
	let noteData = {
		title: '',
		type: 'written',
		tags: '',
		access: 'Private',
		content: '',
		imageUrls: []
	};

	let searchQuery = '';
	let noteMenu = {};

	noteStore.subscribe((state) => {
		notes = state?.notes;
		console.log('notes:', notes);
	});

	userStore.subscribe((state) => {
		userId = state?.currentUser?.uid;
		myNotes = state?.currentUser?.myNotes;
		if (userId) {
			fetchPersonalNoteBoard(state.currentUser.uid);
		}
	});

	async function fetchPersonalNoteBoard(userId) {
		try {
			await noteHandlers.getUserNotes(userId);
		} catch (error) {
			console.error('Error fetching personal notes:', error);
		}
	}
	async function updateUserPersonalNotes() {
		if (!userId) {
			alert('no user id');
			return;
		}
		console.log('user Id', userId);
		console.log('mynotes', myNotes);
		await userHandlers.updateUser(userId, { myNotes });
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
	//FIXME: fix bug number of notes != number in mynotes FIX!
	async function handleSaveNote() {
		if (typeof noteData.tags === 'string') {
			noteData.tags = noteData.tags.split(',').map((tag) => tag.trim());
		}

		if (isEditing) {
			await noteHandlers.updateNote(noteID, noteData, userId);

			// If the access is Private, and it wasn't already in the personal board, add it
			if (!myNotes.some((note) => note === noteID)) {
				myNotes = [...myNotes, noteID];
			}
		} else {
			newNoteId = await noteHandlers.createNote(noteData, userId);
			const newNoteWithId = { ...noteData, id: newNoteId };
			await noteHandlers.updateNote(newNoteId, newNoteWithId, userId);

			myNotes = [...myNotes, newNoteId];
		}
		await updateUserPersonalNotes();

		closeModal();
	}
	async function handleDeleteNote(noteId) {
		await noteHandlers.deleteNote(noteId, userId);

		myNotes = myNotes.filter((note) => note !== noteId);

		await updateUserPersonalNotes();
		noteMenu[noteId] = false;
	}
	function toggleDropdown(noteId) {
		noteMenu[noteId] = !noteMenu[noteId]; // Toggle dropdown visibility
	}

	function handleEditNote(note) {
		isEditing = true;
		noteID = note.id;
		noteData = { ...note };
		openModal();
	}
</script>

<div class="relative min-h-screen">
	<div class="absolute min-h-full w-full">
		<Search
			bind:value={searchQuery}
			placeholder="Search notes..."
			on:input={() => noteHandlers.searchNote(searchQuery)}
		/>
		{#if $noteStore.isLoading}
			<p>Loading notes...</p>
		{:else if notes.length > 0}
			<div class=" mt-5 flex grid h-full grid-cols-2 flex-col gap-4">
				{#each notes as note, index}
					{#if note.access === 'Private'}
						<a href="/privateDashboard/notes/{note.id}">
							<div
								class=" rounded-2xl bg-gray-300 p-4 {index % 3 === 0 ? 'row-span-2' : 'row-span-1'}"
							>
								<div
									class="absolute flex flex-col items-center justify-center p-5 text-lg text-white sm:text-xl md:text-2xl"
								>
									<svg
										class="h-10 w-10"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											fill-rule="evenodd"
											d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z"
											clip-rule="evenodd"
										/>
									</svg>
									Locked Note
								</div>
								<div class="opacity-20 blur-sm">
									<div class="mb-5 flex items-start justify-between font-bold">
										<h3 class="line-clamp-1">{note.title}</h3>
									</div>
									<p>{note.content}</p>
									<ul>
										{#each note.tags as tag}
											<li>{tag}</li>
										{/each}
									</ul>
									<br />
									<p class="mt-auto text-sm text-gray-500">
										{note.noteCreatedAt
											? (() => {
													const date = new Date(note.noteCreatedAt.seconds * 1000);
													const fullWeekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
													const fullMonth = date.toLocaleDateString('en-GB', { month: 'long' });

													const shortWeekday = fullWeekday.slice(0, 3);
													const shortMonth =
														fullMonth.length === 4 ? fullMonth : fullMonth.slice(0, 3);

													return `${shortWeekday}, ${date.toLocaleDateString('en-GB', {
														day: '2-digit'
													})} ${shortMonth} ${date.toLocaleDateString('en-GB', { year: '2-digit' })}`;
												})()
											: 'N/A'}
									</p>
								</div>
							</div>
						</a>
					{:else}
						<div class="rounded-2xl bg-white p-4 {index % 3 === 0 ? 'row-span-2' : 'row-span-1'}">
							<div class=" flex items-start justify-between font-bold">
								<a class="line-clamp-1 text-black" href="/privateDashboard/notes/{note.id}"
									>{note.title}</a
								>
								<DotsHorizontalOutline />
								<Dropdown bind:open={noteMenu[note.id]} class="w-36">
									<DropdownItem
										><a
											href="/privateDashboard/notes/{note.id}"
											class="block h-full w-full text-black">Edit</a
										></DropdownItem
									>
									<!-- Error with defining myNotes but will delete  -->
									<DropdownItem on:click={() => handleDeleteNote(note.id)}>Delete</DropdownItem>
								</Dropdown>
							</div>
							<p>{note.content}</p>
							<ul>
								{#each note.tags as tag}
									<li>{tag}</li>
								{/each}
							</ul>
							<br />
							<p class="mt-auto text-sm text-gray-500">
								{note.noteCreatedAt
									? (() => {
											const date = new Date(note.noteCreatedAt.seconds * 1000);
											const fullWeekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
											const fullMonth = date.toLocaleDateString('en-GB', { month: 'long' });

											// Shorten weekday and month unless the month has exactly four letters
											const shortWeekday = fullWeekday.slice(0, 3);
											const shortMonth = fullMonth.length === 4 ? fullMonth : fullMonth.slice(0, 3);

											// Format the correct order: "Thu, 20 Feb 25"
											return `${shortWeekday}, ${date.toLocaleDateString('en-GB', {
												day: '2-digit'
											})} ${shortMonth} ${date.toLocaleDateString('en-GB', { year: '2-digit' })}`;
										})()
									: 'N/A'}
							</p>
						</div>
					{/if}
				{/each}
			</div>
		{:else}
			<div>User has no notes.</div>
		{/if}

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
					<input
						type="text"
						id="tags"
						bind:value={noteData.tags}
						placeholder="Comma-separated tags"
					/>

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
		{:else}
			<div class="fixed left-1/2 top-[90%] z-50 flex -translate-x-1/2 items-center justify-center">
				<div
					class="flex flex max-h-5 items-center rounded-full bg-[#282828] transition-all duration-300"
				>
					<button
						class="flex cursor-pointer items-center justify-center rounded-full border-8 border-[#282828] bg-[#282828] shadow-xl transition duration-200"
						on:click={toggleExpand}
					>
						<span
							class={expanded
								? 'flex h-6 max-h-6 min-h-6 w-6 min-w-6 max-w-6 items-center justify-center rounded-full bg-white text-center text-red-500'
								: 'flex h-6 max-h-6 min-h-6 w-6 min-w-6 max-w-6 items-center justify-center rounded-full bg-white text-center text-blue-500'}
						>
							{expanded ? '×' : '+'}
						</span>

						{#if expanded}
							<p
								class=" ml-2 flex h-full items-center justify-center whitespace-nowrap rounded-full bg-[#282828] text-white"
							>
								Add Note
							</p>
						{/if}
					</button>

					{#if expanded}
						<div
							class=" flex h-1 flex-row items-center"
							transition:fly={{ x: -100, duration: 300 }}
						>
							<!-- svelte-ignore a11y_consider_explicit_label -->
							<div>
								<button
									class=" flex cursor-pointer items-center justify-center rounded-full border-8 border-[#282828] bg-[#282828] bg-white p-2 shadow-xl"
									on:click={openModal}
									><svg
										class="h-4 w-4 text-gray-800 dark:text-white"
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
											stroke-width="1"
											d="m4.988 19.012 5.41-5.41m2.366-6.424 4.058 4.058-2.03 5.41L5.3 20 4 18.701l3.355-9.494 5.41-2.029Zm4.626 4.625L12.197 6.61 14.807 4 20 9.194l-2.61 2.61Z"
										/>
									</svg></button
								>
							</div>

							<!-- svelte-ignore a11y_consider_explicit_label -->
							<div>
								<button
									class=" flex cursor-pointer items-center justify-center rounded-full border-8 border-[#282828] bg-[#282828] bg-white p-2 shadow-xl"
									><svg
										class="h-4 w-4 text-gray-800 dark:text-white"
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
											stroke-width="1"
											d="M19 9v3a5.006 5.006 0 0 1-5 5h-4a5.006 5.006 0 0 1-5-5V9m7 9v3m-3 0h6M11 3h2a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"
										/>
									</svg>
								</button>
							</div>
							<!-- svelte-ignore a11y_consider_explicit_label -->
							<div>
								<button
									class=" flex cursor-pointer items-center justify-center rounded-full border-8 border-[#282828] bg-[#282828] bg-white p-2 shadow-xl"
									><svg
										class="h-4 w-4 text-gray-800 dark:text-white"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										fill="none"
										viewBox="0 0 24 24"
									>
										<path
											stroke="currentColor"
											stroke-linejoin="round"
											stroke-width="1"
											d="M4 18V8a1 1 0 0 1 1-1h1.5l1.707-1.707A1 1 0 0 1 8.914 5h6.172a1 1 0 0 1 .707.293L17.5 7H19a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"
										/>
										<path
											stroke="currentColor"
											stroke-linejoin="round"
											stroke-width="1"
											d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
										/>
									</svg>
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>{/if}
	</div>
</div>

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
