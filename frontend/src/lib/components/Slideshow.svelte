<script>
	//@ts-nocheck
	export let imageUrls = [];

	let currentIndex = 0;

	const nextImage = () => {
		currentIndex = (currentIndex + 1) % imageUrls.length;
	};

	const prevImage = () => {
		currentIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length;
	};

	const goToImage = (index) => {
		currentIndex = index;
	};
</script>

<div>
	{#if imageUrls && imageUrls.length > 0}
		<div class="relative">
			<img
				src={imageUrls[currentIndex]}
				alt="Slideshow Image"
				class="h-auto w-full rounded-lg object-cover"
			/>
		</div>

		<!-- Previous Button -->
		<button
			on:click={prevImage}
			class="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-black bg-opacity-50 p-2 text-white shadow-lg hover:bg-opacity-75"
		>
			&#10094;
		</button>

		<!-- Next Button -->
		<button
			on:click={nextImage}
			class="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-black bg-opacity-50 p-2 text-white shadow-lg hover:bg-opacity-75"
		>
			&#10095;
		</button>

		<!-- Thumbnails -->
		<div class="mt-4 flex justify-center">
			{#each imageUrls as img, index}
				<img
					src={img}
					alt="Thumbnail"
					class="mx-2 h-16 w-16 cursor-pointer rounded-lg object-cover opacity-70 transition-opacity duration-300 hover:opacity-100"
					on:click={() => goToImage(index)}
					class:selected={currentIndex === index ? 'opacity-100' : 'opacity-70'}
				/>
			{/each}
		</div>
	{/if}
</div>
