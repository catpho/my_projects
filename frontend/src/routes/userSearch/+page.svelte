<script>
	// @ts-ignore
	import { Search, Listgroup, Avatar } from 'flowbite-svelte';
	import { writable, derived } from 'svelte/store';
	
	import { userStore, userHandlers } from '$lib/stores/userStore';

	let searchTerm = '';
	// @ts-ignore
	let query = writable([]);
	let requestSent = false;

	let requestModOpen = false; 
	 
	function toggleRequestView() {
    requestModOpen = !requestModOpen;
  }

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
	
					<button 
					class="rounded px-4 py-2 text-white transition-colors duration-300"
					class:bg-green-500={!requestSent} 
					class:bg-gray-500={requestSent}
					on:click={() => requestSent = !requestSent}
					>
					{requestSent ? "Request Sent" : "Send Request"}
					</button>
				</div>
			</Listgroup>
		{/if}
		<br />

		{#if requestModOpen != false}
		<div class="relative inline-flex items-center justify-center bg-white rounded-lg">
			<button class="absolute top-2 left-2 w-6 h-6 flex justify-center" on:click={()=>toggleRequestView() }>
				✕
			  </button>
			<form action="" class="flex flex-col items-center p-6">
			  <input type="text" class="border-none rounded-lg p-2 m-2 w-64 bg-gray-200" id="emailAddress" name="email" placeholder="Enter Email...">
			  <input type="text" class="border-none rounded-lg p-2 m-2 w-64 bg-gray-200" id="confirmEmailAddress" name="confirmEmail" placeholder="Confirm Email...">
			  <input type="submit" value="Send" class="rounded-lg bg-blue-500 p-2  text-white cursor-pointer">
			</form>
		  </div>
		{/if}

		<div class="absolute bottom-4 left-0 right-0 flex items-center justify-center">
			<button class="rounded bg-blue-500 px-4 py-2 text-white" on:click={()=>toggleRequestView() }>Can't Find User?</button>
		</div>
	</div>

	
</div>
