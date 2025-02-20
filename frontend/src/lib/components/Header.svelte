<script>
	//@ts-nocheck
	import { page } from '$app/stores';
	export let showLoginModal = false;
	import { authStore, authHandlers } from '$lib/stores/authStore';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider } from 'flowbite-svelte';
	import { userStore } from '$lib/stores/userStore';
	import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

	let showDropdown = false;

	let email;
	let uid;
	let profileImage;
	let imageUrl = '';
	let displayName = '';

	// let pathname;
	// $: pathname = $page.url.pathname;

	export let register;

	authStore.subscribe((curr) => {
		console.log('CURR', curr);
		email = curr?.currentUser?.email;
		uid = curr?.currentUser?.uid;
	});

	userStore.subscribe((curr) => {
		uid = curr?.currentUser?.uid;
		profileImage = curr?.currentUser?.profileImage;
		displayName = curr?.currentUser?.displayName;
	});

	$: {
		if (email != undefined) {
			// console.log(email);
		}
	}

	const logout = () => {
		console.log('logging out');
		authHandlers.logout().then(() => {
			if (typeof window !== 'undefined') {
				localStorage.removeItem('searchStore');
				localStorage.removeItem('selectedServices');
			}
			window.location.href = '/';
		});
	};

	const goHome = () => {
		goto('/privateDashboard'); // Navigate to home page
	};

	const goProfile = () => {
		goto('/userProfile'); // Navigate to user profile
	};
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
	//update
</script>

<!-- make it so the profile pic is the all destination -->
<header class=" font-tanaegean flex h-20 w-full items-center justify-between bg-white p-5">
	<div class="app flex w-full flex-row items-center justify-between">
		<!-- {#if pathname === '/privateDashboard'}
			<h1 class="mr-auto items-center text-lg font-bold">My Notes</h1>
		{/if} -->
		<nav class="ml-auto flex flex-row items-center justify-center gap-10 rounded-full bg-white">
			<ul>
				<li class=" flex items-center gap-5 font-bold">
					<!-- This if else statement is what causes the showLoginModal to not allow for a redirect to occur after loggin in / might be due to bubble/capture effect-->
					{#if email != undefined}
						<Avatar id="user-drop" src={imageUrl} class="cursor-pointer" dot={{ color: 'green' }} />
						<Dropdown triggeredBy="#user-drop">
							<DropdownHeader>
								<span class="block text-sm">{displayName}</span>
								<span class="block truncate text-sm font-medium">{email}</span>
							</DropdownHeader>
							<DropdownItem on:click={goHome}>Dashboard</DropdownItem>
							<DropdownItem on:click={goProfile}>Settings</DropdownItem>
							<DropdownDivider />
							<DropdownItem on:click={logout}>Sign out</DropdownItem>
						</Dropdown>
						<!-- svelte-ignore a11y_invalid_attribute -->
					{:else}
						<button
							on:click={() => {
								showLoginModal = !showLoginModal;
							}}
							on:click={() => {
								register = true;
							}}
							type="button"
							class="bg-adamas-blue hover:bg-adamas-blue/50 whitespace-nowrap rounded-lg px-6 py-2 text-white"
							>Sign Up Now</button
						>
						<button
							on:click={() => {
								showLoginModal = !showLoginModal;
							}}
							on:click={() => {
								register = false;
							}}
							type="button"
							class="whitespace-nowrap rounded-lg px-6 py-2">Log In</button
						>
					{/if}
				</li>
			</ul>
		</nav>
	</div>
</header>

<style>
	.app {
		flex: 1;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	nav button {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	button:hover {
		color: var(--color-theme-2);
	}
</style>
