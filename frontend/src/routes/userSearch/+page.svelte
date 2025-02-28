<script>
	// @ts-ignore
	import { Search, Listgroup, Avatar } from 'flowbite-svelte';
	// @ts-ignore
	import { writable, derived } from 'svelte/store';
	// @ts-ignore
	import { userStore, userHandlers } from '$lib/stores/userStore';

	let searchTerm = '';
	let query = writable([]);

	// @ts-ignore
	const searchUsers = async () => {
		if (searchTerm.trim() !== '') {
			//alter this when database is larger
			let users = await userHandlers.searchUsers('');
			users = users.filter((user) =>
				user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
			);
			// @ts-ignore
			query.set(users);
		} else {
			query.set([]);
		}
	};
</script>

<div class="flex h-screen flex-col">
	<div class="">
		<Search bind:value={searchTerm} placeholder="Search users..." on:input={searchUsers} />
		<br />
		{#if $query.length > 0}
			<Listgroup items={$query} let:item class="dark:bg-transparent! border-0">
				<div class=" flex items-center space-x-4 rtl:space-x-reverse">
					<Avatar src={item.profileImage} class="shrink-0" />
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-gray-900 dark:text-white">
							{item.displayName}
						</p>
						<p class="truncate text-sm text-gray-500 dark:text-gray-400">
							{item.email}
						</p>
					</div>
					<button class="bg-blue-100">Send Request</button>
				</div>
			</Listgroup>
		{/if}
		<br />
		<div class="absolute bottom-4 left-0 right-0 flex items-center justify-center">
			<button class="rounded bg-blue-500 px-4 py-2 text-white">Can't Find User?</button>
		</div>
	</div>
</div>
