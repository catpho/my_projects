<script>
	//@ts-nocheck
	import { derived } from 'svelte/store';
	import { userStore, userHandlers } from '$lib/stores/userStore';
	import { requestStore, requestHandlers } from '$lib/stores/requestStore';
	import { onMount } from 'svelte';

	import { Card, Listgroup, Avatar } from 'flowbite-svelte';

	const enrichedRequestStore = derived([userStore, requestStore], ([$userStore, $requestStore]) => {
		if (!$userStore.users.length || !$requestStore.requests.length) {
			return { isLoading: $requestStore.isLoading, requests: [] };
		}

		const enrichedRequests = $requestStore.requests.map((request) => {
			const sender = $userStore.users.find((user) => user.id === request.fromUserA);
			return {
				...request,
				sender: sender || { id: request.fromUserA, displayName: 'Unknown User' }
			};
		});

		return {
			isLoading: $requestStore.isLoading,
			requests: enrichedRequests
		};
	});
	let currentUser;
	let requests = [];

	userStore.subscribe((state) => {
		currentUser = state?.currentUser?.uid;
	});

	onMount(async () => {
		console.log('user', currentUser);
		requests = await requestHandlers.getRequests(currentUser);
		console.log('requests', requests);
	});
</script>

<div>
	{#if requests.length > 0}
		{#each requests as request, index}
			<Card padding="xl" size="md">
				<div class="mb-4 flex items-center justify-between">
					<h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white">
						Latest Requests
					</h5>
				</div>
				<Listgroup items={requests} let:item class="dark:bg-transparent! border-0">
					<div class="flex items-center space-x-4 rtl:space-x-reverse">
						<!-- <Avatar src={item.img.src} alt={item.img.alt} class="shrink-0" /> -->
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-medium text-gray-900 dark:text-white">
								{item.fromUserA}
							</p>
							<p class="truncate text-sm text-gray-500 dark:text-gray-400">
								{item.status}
							</p>
						</div>
						<div
							class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
						>
							{item.requestSentAt}
						</div>
					</div>
				</Listgroup>
			</Card>
		{/each}
	{/if}
</div>
