<script>
	//@ts-nocheck
	import { Carousel } from 'flowbite-svelte';

	export let imageUrls = [];

	let finalImageData = [];

	function transformImageUrls(imageUrls) {
		return imageUrls.map((url) => {
			const filename = decodeURIComponent(url.split('%2F').pop().split('?')[0]); // Extract filename
			return {
				alt: filename.replace(/\.[^/.]+$/, ''), // Remove file extension for alt text
				src: url,
				title: filename
			};
		});
	}
	$: if (imageUrls) {
		finalImageData = transformImageUrls(imageUrls);
	}

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

	// Swipe functionality variables
	let startX;
	let isSwiping = false;

	// Start swipe detection
	const startSwipe = (event) => {
		startX = event.touches[0].clientX;
		isSwiping = true;
	};

	// End swipe detection
	const endSwipe = (event) => {
		if (!isSwiping) return;
		const endX = event.changedTouches[0].clientX;
		if (startX - endX > 50) {
			nextImage(); // Swipe left -> next image
		} else if (endX - startX > 50) {
			prevImage(); // Swipe right -> previous image
		}
		isSwiping = false;
	};
</script>

<div>
	<Carousel images={finalImageData} let:Indicators>
		<Indicators />
	</Carousel>
	<!-- {#if imageUrls && imageUrls.length > 0}
		<div
			class="relative cursor-pointer"
			on:touchstart={startSwipe}
			on:touchend={endSwipe}
			on:click={nextImage}
		>
			<img
				src={imageUrls[currentIndex]}
				alt="Slideshow Image"
				class="h-auto w-full rounded-lg object-cover"
			/>
		</div>

		
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
	{/if} -->
</div>
