<script>
	//@ts-nocheck
	import { enrichedRequestStore } from '$lib/stores/enrichedRequestStore';
	import { derived } from 'svelte/store';
	import { userStore, userHandlers } from '$lib/stores/userStore';
	import { requestStore, requestHandlers } from '$lib/stores/requestStore';
	import { onMount } from 'svelte';

	import { Card, Listgroup, Avatar } from 'flowbite-svelte';

	const formatDateWithTime = (isoString) => {
		const date = new Date(isoString);
		return date
			.toLocaleString('en-US', {
				month: '2-digit',
				day: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				hour12: true
			})
			.replace(',', ' at');
	};

	let currentUser;
	let requests = [];

	userStore.subscribe((state) => {
		currentUser = state?.currentUser?.uid;
	});

	onMount(async () => {
		console.log('user', currentUser);
		requests = await requestHandlers.getRequests(currentUser);
		console.log('requests', requests);
		console.log('enrichedrequests', $enrichedRequestStore.requests);
	});
</script>

<div>
	{#if Array.isArray($enrichedRequestStore.enrichedRequests)}
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

						<div class="inline-flex items-center text-base text-gray-900 dark:text-white">
							Request Sent at {formatDateWithTime(item.requestSentAt)}
						</div>
						<div class="flex-1">
							<p class="truncate text-sm font-medium text-gray-900 dark:text-white">
								{item.fromUserA}
							</p>
							<p class="truncate text-sm text-gray-500 dark:text-gray-400">
								{item.status}
							</p>
						</div>
					</div></Listgroup
				>
			</Card>
		{/each}
	{/if}
</div>
