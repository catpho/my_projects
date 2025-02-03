<script>
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="flex h-full w-full flex-col items-center justify-center gap-10 px-5">
	<img class="max-h-[500px] w-auto object-cover" src="/images/defaultLogo.png" alt="Welcome" />

	<div class="item-center flex flex-col gap-2">
		<div class="text-center text-3xl font-medium text-black">
			Write Everything
			<br />
			Avoid OverSharing
		</div>

		<div class="text-center text-sm text-gray-500">
			People can be clever as high as the sky, but as long as they don't write, they will be lost in
			society and from history.
		</div>
	</div>

	<!-- svelte-ignore a11y_consider_explicit_label -->
	<a href="/auth" class="flex items-center justify-center rounded-full bg-gray-800 p-5 text-white">
		<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M9 18L15 12L9 6"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</a>
</div>
