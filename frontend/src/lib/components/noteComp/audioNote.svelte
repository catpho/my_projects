<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
	import { v4 as uuidv4 } from 'uuid';

	const audioUrl = writable(null);
	const recording = writable(false);
	let mediaRecorder;
	let audioChunks = [];
	let stream;

	export let showAudioModal;
	export let noteData = { title: '', tags: '', access: 'Public' };
	export let closeAudioModal;
	export let handleCreateNote;

	async function startRecording() {
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder = new MediaRecorder(stream);
			mediaRecorder.start();
			recording.set(true);

			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};

			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
				const file = new File([audioBlob], `audio-${uuidv4()}.wav`, { type: 'audio/wav' });
				const url = URL.createObjectURL(audioBlob);
				audioUrl.set(url);
				await uploadAudio(file);
				audioChunks = [];
			};
		} catch (error) {
			console.error('Error accessing microphone:', error);
		}
	}

	function stopRecording() {
		if (mediaRecorder) {
			mediaRecorder.stop();
			recording.set(false);
			stream.getTracks().forEach((track) => track.stop());
		}
	}

	async function uploadAudio(file) {
		const storage = getStorage();
		const storageRef = ref(storage, `audioNotes/${file.name}`);
		await uploadBytes(storageRef, file);
		const downloadUrl = await getDownloadURL(storageRef);
		console.log('Audio uploaded at:', downloadUrl);
	}

	function handleFileUpload(event) {
		const file = event.target.files[0];
		if (file) {
			uploadAudio(file);
		}
	}
</script>

{#if showAudioModal}
	<div class="modal">
		<div class="modal-content">
			<h2>Create Audio Recording</h2>

			<label for="title">Title:</label>
			<input type="text" id="title" bind:value={noteData.title} />

			<label for="tags">Tags:</label>
			<input type="text" id="tags" bind:value={noteData.tags} placeholder="Comma-separated tags" />

			<label for="access">Access:</label>
			<select id="access" bind:value={noteData.access}>
				<option value="Public">Public</option>
				<option value="Private">Private</option>
			</select>

			<button on:click={handleCreateNote}>Save Note</button>
			<button on:click={closeAudioModal}>Cancel</button>

			<h3>Audio Recording</h3>
			<button on:click={startRecording} disabled={$recording} class="record-btn"
				>Start Recording</button
			>
			<button on:click={stopRecording} disabled={!$recording} class="stop-btn"
				>Stop Recording</button
			>
			<input type="file" accept="audio/*" on:change={handleFileUpload} class="file-input" />

			{#if $audioUrl}
				<audio controls>
					<source src={$audioUrl} type="audio/wav" />
					Your browser does not support the audio element.
				</audio>
			{/if}
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
