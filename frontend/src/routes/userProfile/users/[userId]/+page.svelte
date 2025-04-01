<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { userHandlers } from '$lib/stores/userStore';
	import { Avatar } from 'flowbite-svelte';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	let userId = '';
	export let data = {
		userData: {
			displayName: '',
			biography: '',
			birthDay: null,
			createAt: null,
			email: '',
			myNotes: [],
			collaborators: [],
			profileImage: ''
		},
		userId: ''
	};

	onMount(async () => {
		userId = get(page).params.userId;
		if (!userId) return;

		try {
			const userData = await userHandlers.getUser(userId);
			if (userData) {
				data = {
					userId: userId,
					userData: {
						displayName: userData.displayName || '',
						birthDay: userData.birthDay || null,
						biography: userData.biography || '',
						createAt: userData.createAt || null,
						email: userData.email || '',
						myNotes: userData.myNotes || [],
						collaborators: userData.collaborators || [],
						profileImage: userData.profileImage || ''
					}
				};
			}
		} catch (error) {
			console.error('Error loading profile:', error);
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
					{#if data.userData.birthDay}
						<div>
							{new Date(data.userData.birthDay).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: '2-digit'
							})}
						</div>
					{:else}
						This user has not set a birthday!
					{/if}
					{#if data.userData.biography}
						<div>
							<div class="font-extrabold">About Me:</div>
							{data.userData.biography}
						</div>
					{:else}
						<div>
							<div class="font-extrabold">About Me:</div>
							This user was too lazy to write a bio!
						</div>
					{/if}
				</div>

				<hr class="my-4 w-3/4 border-t border-gray-300" />
				<div class="justify-left my-4 w-3/4">
					<div class="w-full text-lg font-extrabold">Collaborators</div>
					<div>
						{#if data.userData.collaborators && data.userData.collaborators.length > 0}
							{#each data.userData.collaborators as collaborator}
								<div>{collaborator}</div>
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
