<!-- this is my user profile, where I can add my name, change my email, change my password, update my
profile picture, look at any subscriptions I have for this app. -->

<script>
	// @ts-nocheck
	import { authStore, authHandlers } from '$lib/stores/authStore';
	import { db } from '$lib/firebase/firebase.client';
	import { setDoc, doc } from 'firebase/firestore';
	import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
	import { onMount } from 'svelte';

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
	let isEditing = false;

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

<div class="flex w-full flex-col items-center gap-4">
	<div class="ml-auto mr-10" on:click={() => (isEditing = !isEditing)}>Edit</div>
	<div class=" flex w-full items-center justify-center">
		{#if imageUrl}
			{#if isEditing}
				<label for="imageReplacement" class="flex flex-col items-center gap-4">
					<img
						class="aspect-square h-[250px] w-[250px] cursor-pointer rounded-lg object-cover sm:h-[200px] sm:w-[200px] md:h-[150px] md:w-[150px]"
						src={imageUrl}
						alt="Profile"
						referrerPolicy="no-referrer"
					/>

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
				<img
					class="aspect-square h-[250px] w-[250px] rounded-lg object-cover sm:h-[200px] sm:w-[200px] md:h-[150px] md:w-[150px]"
					src={imageUrl}
					alt="Profile"
					referrerPolicy="no-referrer"
				/>
			{/if}
		{:else}
			<input type="file" accept="image/*" on:change={replaceImage} />
		{/if}

		{#if error}
			<p class="text-center text-sm text-red-500 sm:text-xs">{error}</p>
		{/if}
	</div>

	<div class="w-full justify-center text-center text-lg font-extrabold">
		{displayName}
		<br />
		Birthday here
		{#if isEditing}
			<div
				class="mt-1 flex cursor-pointer justify-center text-sm font-bold text-[#9EB9FF] hover:underline"
			>
				Change Password?
			</div>
		{/if}
	</div>

	<hr class="my-4 w-3/4 border-t border-gray-300" />
	<div class="justify-left my-4 w-3/4">
		<div class="w-full text-lg font-extrabold">Collaborators</div>
		<div>List here</div>
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
		<div>List here</div>
	</div>
</div>
