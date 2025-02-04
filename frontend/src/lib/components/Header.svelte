<script>
	//@ts-nocheck
	import { page } from '$app/stores';
	export let showLoginModal = false;
	import { authStore, authHandlers } from '$lib/stores/authStore';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let email;
	let uid;
	export let register;

	authStore.subscribe((curr) => {
		console.log('CURR', curr);
		email = curr?.currentUser?.email;
		uid = curr?.currentUser?.uid;
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

	onMount(() => {
		// searchStore.useLocalStorage();
	});
	//update
</script>

<header class="font-tanaegean flex h-20 w-full items-center justify-between bg-white">
	<div class="app flex w-full flex-row items-center justify-between">
		<nav class="flex flex-row items-center justify-center gap-10 rounded-full bg-white">
			<ul>
				<li class="corner flex items-center gap-5 font-bold">
					<!-- This if else statement is what causes the showLoginModal to not allow for a redirect to occur after loggin in / might be due to bubble/capture effect-->
					{#if email != undefined}
						<button type="button" class="whitespace-nowrap rounded-lg px-6 py-2" on:click={logout}
							>Logout</button
						>

						<button type="button" on:click={() => goto('/userProfile')}> profilePic </button>
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
