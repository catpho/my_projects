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
</script>

<div>
	<Carousel images={finalImageData} let:Indicators>
		<Indicators />
	</Carousel>
</div>
