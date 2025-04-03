<script>
	//@ts-nocheck
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
	import { v4 as uuidv4 } from 'uuid';

	const audioUrl = writable(null);
	const recording = writable(false);

	const storage = getStorage();
	let mediaRecorder;

	let stream;

	export let showAudioModal;
	export let noteData;
	export let closeAudioModal;
	export let handleCreateNote;

	async function startRecording() {
		let audioChunks = [];
		try {
			// Accessing the user's microphone
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder = new MediaRecorder(stream);
			mediaRecorder.start();
			recording.set(true);

			// Collect audio data as it's being recorded
			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};

			// Once recording is stopped, create a blob and upload the file
			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
				const file = new File([audioBlob], `audio-${uuidv4()}.wav`, { type: 'audio/wav' });
				const url = URL.createObjectURL(audioBlob);
				audioUrl.set(url); // Set the temporary URL for playback

				// Upload audio file to Firebase Storage
				try {
					// Create a reference for the audio file in Firebase
					const storageRef = ref(storage, `notes/${file.name}`);

					// Upload the file
					await uploadBytes(storageRef, file);

					// Get the downloadable URL for the uploaded file
					const downloadURL = await getDownloadURL(storageRef);

					// Update audioUrl with the final download URL
					audioUrl.set(downloadURL);

					// Update the note data with the audio URL
					noteData.audioUrl = downloadURL;

					console.log('Uploaded audio URL:', noteData.audioUrl);
				} catch (error) {
					console.error('Error uploading audio file:', error);
				}

				// Reset audio chunks for the next recording session
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
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
			}
		}
	}

	// const handleAudioUpload = async (event) => {
	// 	const file = event.target.files[0];
	// 	if (!file) return;

	// 	try {
	// 		const storageRef = ref(storage, `notes/${file.name}`);
	// 		await uploadBytes(storageRef, file);
	// 		const downloadURL = await getDownloadURL(storageRef);

	// 		// Update audioUrl correctly
	// 		audioUrl.set(downloadURL); // This updates the `audioUrl` state

	// 		// Ensure Firebase noteData is updated
	// 		noteData.audioUrl = downloadURL;

	// 		console.log('Uploaded audio URL:', noteData.audioUrl);
	// 	} catch (error) {
	// 		console.error('Error uploading audio file:', error);
	// 	}
	// };
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
			<div class="recording-controls">
				{#if $recording}
					<div class="recording-indicator">
						<div class="pulsing-dot"></div>
						<span>Recording...</span>
					</div>
				{/if}
				<div class="button-group">
					<button
						on:click={startRecording}
						disabled={$recording}
						class:recording={$recording}
						class="record-btn"
					>
						{#if $recording}
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<circle cx="12" cy="12" r="9" fill="white" />
							</svg>
						{/if}
						Start Recording
					</button>
					<button on:click={stopRecording} disabled={!$recording} class="stop-btn">
						Stop Recording
					</button>
				</div>
			</div>

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
	select {
		width: 100%;
		padding: 8px;
		margin-bottom: 15px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	button {
		cursor: pointer;
		padding: 8px 12px;
		border: none;
		border-radius: 4px;
		margin: 5px;
		transition: all 0.2s;
	}

	button:hover {
		opacity: 0.9;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Recording controls */
	.recording-controls {
		margin: 15px 0;
	}

	.recording-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 10px;
		color: #ff0000;
		font-weight: bold;
	}

	.pulsing-dot {
		width: 12px;
		height: 12px;
		background-color: #ff0000;
		border-radius: 50%;
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0% {
			transform: scale(0.95);
			opacity: 0.7;
		}
		50% {
			transform: scale(1.1);
			opacity: 1;
		}
		100% {
			transform: scale(0.95);
			opacity: 0.7;
		}
	}

	.button-group {
		display: flex;
		gap: 10px;
	}

	.record-btn {
		background-color: #4caf50;
		color: white;
	}

	.record-btn.recording {
		background-color: #f44336;
	}

	.stop-btn {
		background-color: #f44336;
		color: white;
	}

	audio {
		width: 100%;
		margin-top: 15px;
	}
</style>
