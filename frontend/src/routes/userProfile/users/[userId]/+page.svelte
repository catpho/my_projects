<script>
	//@ts-nocheck
	import { onMount } from 'svelte';
	import { userStore, userHandlers } from '$lib/stores/userStore';
	import { Avatar } from 'flowbite-svelte';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	// Default empty user data
	let userId = '';
	export let data = {
		userData: {
			displayName: '',
			biography: '',
			createAt: null,
			email: '',
			myNotes: [],
			collaborators: [],
			profileImage: ''
		},
		userId: ''
	};

	// $: userId = get(page).params.userId;
	onMount(async () => {
		if (!userId) {
			console.warn('No userId provided.');
			return;
		}

		console.log('Fetching data for user:', userId);
		try {
			const userData = await userHandlers.getUser(userId);
			if (userData) {
				data = { ...data, userId, userData };
			} else {
				console.warn('User data not found.');
			}
		} catch (error) {
			console.error('Error fetching user data:', error);
		}
	});
</script>

<div class="relative flex h-screen flex-col">
	<div class="absolute flex min-h-full min-w-full">
		{#if data.userId}
			<div class="relative flex w-full flex-col items-center gap-4 p-4">
				<div class=" flex w-full items-center justify-center">
					{#if data.userData.profileImage}
						<Avatar size="xl" src={data.userData.profileImage} />
					{/if}
				</div>

				<div class="w-full justify-center text-center">
					<div class="text-lg font-extrabold">{data.userData.displayName}</div>
					<br />
					<div>
						About Me:
						<br />
						{data.userData.biography}
					</div>
				</div>

				<hr class="my-4 w-3/4 border-t border-gray-300" />
				<div class="justify-left my-4 w-3/4">
					<div class="w-full text-lg font-extrabold">Collaborators</div>
					<div>
						{#if data.userData.collaborators && data.userData.collaborators.length > 0}
							{#each data.userData.collaborators as collaborator}
								<div>{data.userData.collaborator}</div>
							{/each}
						{:else}
							No current collaborators present.
						{/if}
					</div>
				</div>

				<hr class="my-4 w-3/4 border-t border-gray-300" />
				<div class="justify-left my-4 w-3/4">
					<div class="w-full text-lg font-extrabold">Notes</div>
					<div>
						{#if data.userData.myNotes && data.userData.myNotes.length > 0}
							<div>
								This user currently has {data.userData.myNotes.length} notes in their dashboard.
							</div>
						{:else}
							There is no locked notes assigned to this user.
						{/if}
					</div>
				</div>
			</div>
		{:else}
			<p>Loading user data...</p>
		{/if}
	</div>
</div>
