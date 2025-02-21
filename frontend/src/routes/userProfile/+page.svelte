<!-- this is my user profile, where I can add my name, change my email, change my password, update my
profile picture, look at any subscriptions I have for this app. -->

<script>
	// @ts-nocheck
	import { authStore, authHandlers } from '$lib/stores/authStore';
	import { db } from '$lib/firebase/firebase.client';
	import { setDoc, doc } from 'firebase/firestore';
	import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
	import { onMount } from 'svelte';
	import { Avatar } from 'flowbite-svelte';
	import loadImage from 'blueimp-load-image';
	import { userHandlers, userStore } from '$lib/stores/userStore';

	const UploadYourPhotoImage = '/images/profilePageDefaultImages/UploadYourPhoto.jpg';

	let profileImage;
	let imageUrl;
	let googleProfileImageUrl;
	let error = '';
	let uid;
	let displayName;
	let userData;
	let birthDay;
	let biography;
	let collaborators;
	let myNotes = [];
	let isEditing = false;

	let showModal = false;
	let oldPassword = '';
	let newPassword = '';
	let confirmNewPassword = '';
	let passwordChangeMessage = '';
	let isChangingPassword = false;
	let displayPasswordValidator = false;

	function openModal() {
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}

	async function handlePasswordChange() {
		// Validation
		if (!newPassword || !confirmNewPassword) {
			passwordChangeMessage = 'Enter all the required details';
			displayPasswordValidator = true;
			console.log(passwordChangeMessage);
			return;
		}

		if (newPassword !== confirmNewPassword) {
			passwordChangeMessage = 'New passwords do not match';
			displayPasswordValidator = true;
			console.error(passwordChangeMessage);
			return;
		}

		try {
			isChangingPassword = true;
			// Call the changePassword method from authHandlers
			await authHandlers.updatePassword(newPassword);
			displayPasswordValidator = false;
		} catch (error) {
			displayPasswordValidator = true;
		} finally {
			isChangingPassword = false;
		}

		closeModal();
	}
	authStore.subscribe((curr) => {
		// If logged in with Google, use the photoURL from the provider
		uid = curr?.currentUser?.uid;
		if (curr?.currentUser?.providerData[0]?.providerId === 'google.com') {
			googleProfileImageUrl = curr?.currentUser?.photoURL;
		}
		// console.log('Header: googleProfileImageUrl', googleProfileImageUrl);
	});

	userStore.subscribe((curr) => {
		userData = curr?.currentUser;

		displayName = curr?.currentUser?.displayName;
		profileImage = curr?.currentUser?.profileImage;
		birthDay = curr?.currentUser?.birthDay;
		collaborators = curr?.currentUser?.collaborators;
		myNotes = curr?.currentUser?.myNotes;
		biography = curr?.currentUser?.biography;
		// console.log('Header: profileImage', profileImage);
	});

	async function handleImageUpload() {
		if (!profileImage || !uid) {
			error = 'No profile image selected or user not authenticated.';
			return;
		}

		const maxWidth = 800;
		const maxHeight = 800;
		const quality = 0.7;

		loadImage(
			profileImage,
			async (canvas) => {
				canvas.toBlob(
					async (blob) => {
						try {
							const storage = getStorage();
							const storageRef = ref(storage, `profile_images/${uid}`);

							// Upload the image blob to Firebase Storage
							await uploadBytes(storageRef, blob);

							// Get the download URL for the uploaded image
							imageUrl = await getDownloadURL(storageRef);

							// Update the user document in Firestore with the new image URL
							const userRef = doc(db, 'users', uid);
							await setDoc(
								userRef,
								{
									displayName: displayName,
									profileImage: imageUrl
								},
								{ merge: true }
							);

							// Update the user's auth profile to reflect the new image URL
							await authHandlers.updateProfile({ photoURL: imageUrl });
							// I have my userStore
							// create a copy of userData and update the attribute profileImage for me
							const updatedUserData = { ...userData, profileImage: imageUrl };
							await userHandlers.updateUser(uid, updatedUserData);
							error = ''; // Clear error if successful
						} catch (err) {
							console.error('Error uploading profile image:', err);
							if (err.code === 'storage/unauthorized') {
								error = 'You do not have permission to upload the profile image.';
							} else {
								error = 'There was an error uploading your profile image. Please try again.';
							}
							console.log(error);
						}
					},
					'image/jpeg',
					quality
				);
			},
			{
				maxWidth: maxWidth,
				maxHeight: maxHeight,
				canvas: true
			}
		);
	}
	//do we need to have the year input included?
	async function handleBirthdateUpdate() {
		if (!birthDay || !uid) {
			error = 'No birthdate provided or user is not authenticated.';
			return;
		}
		try {
			const userRef = doc(db, 'users', uid);
			await setDoc(
				userRef,
				{
					birthDay: birthDay
				},
				{ merge: true }
			);
		} catch (err) {
			console.error('Error updating birthday:', err);
			error = 'Error updating birthday. Please try again.';
		}
	}
	async function handleBioUpdate() {
		if (!biography || !uid) {
			error = 'No bio provided or user is not authenticated.';
			return;
		}
		try {
			const userRef = doc(db, 'users', uid);
			await setDoc(
				userRef,
				{
					biography: biography
				},
				{ merge: true }
			);
		} catch (err) {
			console.error('Error updating bio:', err);
			error = 'Error updating bio. Please try again.';
		}
	}
	function replaceImage(event) {
		profileImage = event.target.files[0];
		handleImageUpload();
	}

	onMount(async () => {
		if (uid) {
			const storage = getStorage();
			const storageRef = ref(storage, `profile_images/${uid}`);

			try {
				// Attempt to fetch the user's custom profile image from Firebase Storage
				// expect an error 404 if the image does not exist, this will then default to google
				imageUrl = await getDownloadURL(storageRef);
			} catch (err) {
				// Check if the error is specifically due to the object not being found
				if (err.code === 'storage/object-not-found') {
					// Fallback to Google profile image or default image without logging an error
					imageUrl = googleProfileImageUrl || UploadYourPhotoImage;
				} else {
					// Log only critical errors and fallback to a default image
					console.error('Unexpected error fetching profile image:', err);
					imageUrl = UploadYourPhotoImage; // Fallback image
				}
			}
		}

		// console.log('this is the image url', imageUrl);
	});
</script>

<div class="relative flex h-screen flex-col">
	<div class="absolute flex min-h-full min-w-full">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->

		<div class="relative flex w-full flex-col items-center gap-4 p-4">
			<div
				aria-label="toggleEdit"
				class="ml-auto mr-10 cursor-pointer"
				on:click={() => (isEditing = !isEditing)}
			>
				<svg
					class="h-6 w-6 text-red-400 dark:text-white"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						fill-rule="evenodd"
						d="M5 8a4 4 0 1 1 7.796 1.263l-2.533 2.534A4 4 0 0 1 5 8Zm4.06 5H7a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h2.172a2.999 2.999 0 0 1-.114-1.588l.674-3.372a3 3 0 0 1 .82-1.533L9.06 13Zm9.032-5a2.907 2.907 0 0 0-2.056.852L9.967 14.92a1 1 0 0 0-.273.51l-.675 3.373a1 1 0 0 0 1.177 1.177l3.372-.675a1 1 0 0 0 .511-.273l6.07-6.07a2.91 2.91 0 0 0-.944-4.742A2.907 2.907 0 0 0 18.092 8Z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
			<div class=" flex w-full items-center justify-center">
				{#if imageUrl}
					{#if isEditing}
						<label for="imageReplacement" class="flex flex-col items-center gap-4">
							<Avatar size="xl" src={imageUrl} />

							<input
								id="imageReplacement"
								type="file"
								class="block"
								accept="image/*"
								on:change={replaceImage}
							/>
						</label>
					{:else}
						<!-- Image is not clickable when isEditing is false -->

						<Avatar size="xl" src={imageUrl} />
					{/if}
				{:else}
					<input type="file" accept="image/*" on:change={replaceImage} />
				{/if}

				{#if error}
					<p class="text-center text-sm text-red-500 sm:text-xs">{error}</p>
				{/if}
			</div>

			{#if showModal}
				<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
					<div class="w-96 rounded-lg bg-white p-6">
						<form on:submit={handlePasswordChange}>
							<div class="mb-4">
								<label for="newPassword" class="block text-sm font-medium text-gray-700"
									>New Password</label
								>
								<input
									type="password"
									id="newPassword"
									bind:value={newPassword}
									class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
							</div>

							<div class="mb-4">
								<label for="confirmNewPassword" class="block text-sm font-medium text-gray-700"
									>Confirm New Password</label
								>
								<input
									type="password"
									id="confirmNewPassword"
									bind:value={confirmNewPassword}
									class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
							</div>

							<div class="flex items-center justify-between">
								<button
									type="button"
									on:click={closeModal}
									class="rounded bg-gray-500 px-4 py-2 text-white">Cancel</button
								>
								<button type="submit" class="rounded bg-blue-500 px-4 py-2 text-white"
									>Change Password</button
								>
							</div>
						</form>
					</div>
				</div>
			{/if}
			<div class="w-full justify-center text-center">
				{#if isEditing}
					<div class="text-lg font-extrabold">{displayName}</div>

					<input
						type="date"
						bind:value={birthDay}
						on:change={handleBirthdateUpdate}
						placeholder="Select your birthdate"
					/>
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div>
						About Me:

						<input
							type="text"
							bind:value={biography}
							on:change={handleBioUpdate}
							placeholder="Tell me about yourself!"
						/>
					</div>
					<div
						class="mt-1 flex cursor-pointer justify-center text-sm font-bold text-[#9EB9FF] hover:underline"
						on:click={() => openModal()}
					>
						Change Password?
					</div>
				{:else}
					<div class="text-lg font-extrabold">{displayName}</div>

					{#if birthDay}
						{new Date(birthDay).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: '2-digit'
						})}
					{:else}
						No birthdate set
					{/if}
					<br />
					<div>
						About Me:
						<br />
						{biography}
					</div>
				{/if}
			</div>

			<hr class="my-4 w-3/4 border-t border-gray-300" />
			<div class="justify-left my-4 w-3/4">
				<div class="w-full text-lg font-extrabold">Collaborators</div>
				<div>
					{#if collaborators && collaborators.length > 0}
						{#each collaborators as collaborator}
							<div>{collaborator}</div>
						{/each}
					{:else}
						No current collaborators present.
					{/if}
				</div>

				{#if isEditing}
					<div
						class="mt-1 flex cursor-pointer justify-end text-sm font-bold text-[#9EB9FF] hover:underline"
					>
						+add a User
					</div>
				{/if}
			</div>

			<hr class="my-4 w-3/4 border-t border-gray-300" />
			<div class="justify-left my-4 w-3/4">
				<div class="w-full text-lg font-extrabold">Locked Notes</div>
				<div>
					{#if myNotes && myNotes.length > 0}
						<div>This user currently has {myNotes.length} notes in their dashboard.</div>
					{:else}
						There is no locked notes assigned to this user.
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
