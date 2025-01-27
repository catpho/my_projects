<script>
	//@ts-nocheck
	
	export let showModal;
	export let displayLoginValidator = false;
	export let forgotPassword = false;
	export let registerStep = 1;
	export let Class = 'w-1/2 min-w-[500px]';
	let dialog;
	$: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	class="bg-palette-lightgray no-scrollbar {Class}"
	bind:this={dialog}
	on:close={() => {
		showModal = false;
		displayLoginValidator = false;
		forgotPassword = false;
		registerStep = 1;
	}}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation class="flex h-full w-full">
		

		<div class="flex w-full flex-col p-5">

			<slot />
		</div>

		<!-- svelte-ignore a11y-autofocus -->
		<button
			type="button"
			class="text-palette-dark absolute right-5 top-5 focus:outline-none"
			autofocus
			on:click={() => dialog.close()}
		>
			x
		</button>
	</div>
</dialog>

<style>
	dialog {
		padding: 0;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 0;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>