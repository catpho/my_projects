<!-- PasswordInput.svelte -->
<script>
	import { EyeOutline, EyeSlashOutline } from 'flowbite-svelte-icons';
	import { createEventDispatcher } from 'svelte';

	export let value = '';
	export let label = '';
	let showPassword = false;

	function togglePassword() {
		showPassword = !showPassword;
	}

	function trimInput() {
		value = value.trim();
	}
</script>

<div class="relative">
	{#if !showPassword}
		<input id={label} class="w-full rounded" bind:value type="password" on:input={trimInput} />
	{:else}
		<input id="text" class="w-full rounded" bind:value type="text" on:input={trimInput} />
	{/if}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 outline-none"
		on:click={togglePassword}
		on:keydown={() => {}}
	>
		{#if showPassword}
			<EyeOutline class="w-4 text-gray-700" />
		{:else}
			<EyeSlashOutline class="w-4 text-gray-700" />
		{/if}
	</div>
</div>