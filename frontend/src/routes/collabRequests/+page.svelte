<script>
	//@ts-nocheck

	import { userStore, userHandlers } from '$lib/stores/userStore';
	import { onMount } from 'svelte';

	let currentUser;
	let requests;

	userStore.subscribe((state) => {
		currentUser = state?.currentUser?.uid;
	});

	onMount(async () => {
		console.log('user', currentUser);
		requests = await userHandlers.getCollabRequests(currentUser);
		console.log('requests', requests);
	});
</script>

<div>These be friends</div>
