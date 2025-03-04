<script>
	// //@ts-nocheck
	import { noteStore, noteHandlers } from '$lib/stores/noteStore';
	import { Textarea, Toolbar, ToolbarGroup, ToolbarButton, Button } from 'flowbite-svelte';
	import { PaperClipOutline, MapPinAltSolid, ImageOutline, CodeOutline, FaceGrinOutline, PaperPlaneOutline } from 'flowbite-svelte-icons';
	
	let isOpen = false;
	let noteData = {
		title: '',
		type: 'written',
		tags: '',
		access: 'Private',
		content: '',
		imageUrls: []
	};
	$: notes = [];
	let myNotes = [];
		
		noteStore.subscribe((state) => {
		
		notes = state?.notes;
		
		console.log('notes:', notes);
	});
</script>

<div class="flex h-screen flex-col">
	<div class="flex items-center justify-between w-full">
		
		<div>
		  <!-- svelte-ignore a11y_consider_explicit_label -->
		  <a href="/privateDashboard" >
			<svg class="w-10 h-10 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42">
			  <path d="m30.91 39-15-15 15-15 1.17 1.18L18.26 24l13.82 13.82Z"></path>
			</svg>
		  </a>
		</div>
		<div class="flex-grow"></div>
		<div>
			<svg class="w-10 h-10 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/>
			</svg>
		  </div>
		 
	  </div>
	  
<br/>
<form>
	<label for="editor" class="sr-only">Publish post</label>
	<Textarea id="editor" rows="20" class="mb-4" placeholder="Write your note.....">
	  <Toolbar slot="footer" embedded>
		<ToolbarGroup>
		  <ToolbarButton name="Attach file"><PaperClipOutline class="w-6 h-6 rotate-45" /></ToolbarButton>
		  <ToolbarButton name="Embed map"><MapPinAltSolid class="w-6 h-6" /></ToolbarButton>
		  <ToolbarButton name="Upload image"><ImageOutline class="w-6 h-6" /></ToolbarButton>
		</ToolbarGroup>
		<ToolbarGroup>
		  <ToolbarButton name="Format code"><CodeOutline class="w-6 h-6" /></ToolbarButton>
		  <ToolbarButton name="Add emoji"><FaceGrinOutline class="w-6 h-6" /></ToolbarButton>
		</ToolbarGroup>
		<ToolbarButton name="send" slot="end"><PaperPlaneOutline class="w-6 h-6 rotate-45" /></ToolbarButton>
	  </Toolbar>
	</Textarea>
	
  </form>

	  

	
	  
  
		
</div>
  

