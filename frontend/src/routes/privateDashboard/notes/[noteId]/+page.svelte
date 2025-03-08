<script>
    // //@ts-nocheck
    import { onMount } from 'svelte';
    import { noteStore, noteHandlers } from '$lib/stores/noteStore';
    export let data;
    let timestamp = null;
    let isExpanded = false;
    let isEditing = false; 
 

    function formatFirestoreTimestamp(timestamp) {
    if (!timestamp || !timestamp.seconds) return "Invalid date";

    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);

    // Extract components
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" }); // "Tue"
    const month = date.toLocaleDateString("en-US", { month: "short" }); // "Mar"
    const day = date.getDate(); // 4
    const year = date.getFullYear(); // 2025

    // Format: "Tue, 4 Mar 2025"
    return `${weekday}, ${day} ${month} ${year}`;
}

  function toggleEdit() {
      isEditing = !isEditing;
    }
  function toggleView() {
    isExpanded = !isExpanded;
  }

  async function handleSaveNote() {
    if (isEditing) {
      await noteHandlers.updateNote(data.noteData.id, data.noteData, data.userId);
      isEditing = false;
    }
  }

    onMount(()=> {console.log("data", data)})
</script>

<div class="flex h-screen flex-col">
   <div class="flex items-center justify-between w-full">
    <div>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a href="/privateDashboard" >
          <svg class="w-8 h-8 text-gray-800 dark:text-white rounded-full bg-red-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42">
            <path d="m30.91 39-15-15 15-15 1.17 1.18L18.26 24l13.82 13.82Z"></path>
          </svg>
        </a>
      </div>
      
      <button on:click={toggleEdit}>
          <svg class="w-8 h-8 text-gray-800 dark:text-white rounded-full bg-red-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/>
          </svg>
        </button>
    </div>
    <br/>
    <!-- <div class="font-extrabold text-4xl">{data.noteData.title}</div>
    <div class="text-sm text-gray-500 ">{formatFirestoreTimestamp(data.noteData.noteCreatedAt)}</div>
    <br/>
    <div>{data.noteData.content}</div> -->
    {#if isEditing}
    <!-- Editable fields when in editing mode -->
    <input 
      type="text" 
      bind:value={data.noteData.title} 
      class="font-extrabold text-4xl border p-2" 
    />
    <textarea 
      bind:value={data.noteData.content} 
      class="text-sm text-gray-500 border p-2 mt-4" 
      rows="10"
    ></textarea>
    <button 
      on:click={handleSaveNote} 
      class="bg-blue-500 text-white p-2 rounded mt-4"
    >
      Save
    </button>
  {:else}
    <!-- Display note when not in editing mode -->
    <div class="font-extrabold text-4xl">{data.noteData.title}</div>
    <div class="text-sm text-gray-500">{formatFirestoreTimestamp(data.noteData.noteCreatedAt)}</div>
    <br />
    <div>{data.noteData.content}</div>
  {/if}


  
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
   <!-- widget for text  -->
  <div 
    class={`w-[90%] fixed bottom-0 bg-[#282828] shadow-lg  p-3 transition-all duration-300 cursor-pointer ${
        isExpanded ? 'h-[30vh] rounded-t-lg' : 'h-auto rounded-t-2xl'
      }`}
    
  >
    <div class="flex flex-col items-center" on:click={toggleView}>
    <div class="w-10 h-[1px] bg-white "></div>
    <div class="w-5 h-[1px] bg-white my-2"></div>
    </div>

    {#if isExpanded}
      <div class="text-white mb-2">Text Format</div>
      
      <div class="w-full mx-auto">
      <div class="grid grid-cols-8 gap-11 mb-2">
        {#each Array(7) as _, i}
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
            {i + 1}
          </div>
        {/each}
      </div>
  
      <!-- bold, italic, and underline -->
      <div class="  flex justify-between mb-2 overflow-hidden rounded-xl w-full">
        <div class="flex-1 bg-[#333333] rounded-xl flex items-center justify-center"><svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14 5L7 5L7 20" stroke="#6c6c6c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 20H7" stroke="#6c6c6c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 12H7" stroke="#6c6c6c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M13.5 12C15.433 12 17 10.433 17 8.5C17 6.567 15.433 5 13.5 5" stroke="#6c6c6c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 20C16.2091 20 18 18.2091 18 16C18 13.7909 16.2091 12 14 12" stroke="#6c6c6c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></div><div class="w-3 h-5 -mx-1 my-1.5  bg-[#333333] "></div>
        <div class="flex-1 bg-[#333333] rounded-xl flex items-center justify-center"><svg width="20px" height="20px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools --> <title>ic_fluent_text_italic_24_regular</title> <desc>Created with Sketch.</desc> <g id="🔍-System-Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="ic_fluent_text_italic_24_regular" fill="#6c6c6c" fill-rule="nonzero"> <path d="M9.75,4 L18.2535371,4 C18.6674911,4 19.003067,4.33564847 19.003067,4.74969185 C19.003067,5.12923161 18.72109,5.44289788 18.3552439,5.4925399 L18.2535371,5.4993837 L15.056067,5.499 L10.036067,18.5 L14.2488227,18.5 C14.6282805,18.5 14.941879,18.7822969 14.9915103,19.1482652 L14.9983526,19.25 C14.9983526,19.6295398 14.7163756,19.943465 14.3505295,19.9931501 L14.2488227,20 L4.74953181,20 C4.33557788,20 4.00306702,19.6640434 4.00306702,19.25 C4.00306702,18.8704602 4.28246851,18.556535 4.64788535,18.5068499 L4.74953181,18.5 L8.43406702,18.5 L8.45532362,18.4348625 L13.449067,5.499 L9.75,5.4993837 C9.37054224,5.4993837 9.05654871,5.21734575 9.00685157,4.85142059 L9,4.74969185 C9,4.37015209 9.28237205,4.05648582 9.64828398,4.0068438 L9.75,4 L18.2535371,4 L9.75,4 Z" id="🎨-Color"> </path> </g> </g> </g></svg></div><div class="w-3 h-5 -mx-1 my-1.5  bg-[#333333] "></div>
        <div class="flex-1 bg-[#333333] rounded-xl flex items-center justify-center"><svg fill="#6c6c6c" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="18px" height="18px" viewBox="0 0 93.333 93.333" xml:space="preserve" stroke="#6c6c6c"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M60.73,0v43.155c0,5.478-1.104,9.496-3.311,12.058c-2.208,2.561-5.759,3.842-10.654,3.842 c-5.061,0-8.685-1.271-10.875-3.818c-2.191-2.543-3.286-6.539-3.286-11.984V0H17.671v45.523c0,8.086,2.512,14.458,7.539,19.113 c5.025,4.656,12.08,6.983,21.166,6.983c6.023,0,11.245-1.046,15.657-3.143c4.415-2.094,7.79-5.104,10.125-9.037 c2.336-3.93,3.503-8.504,3.503-13.724V0H60.73z"></path> <rect x="17.671" y="78.9" width="57.99" height="14.433"></rect> </g> </g> </g></svg></div><div class="w-3 h-5 -mx-1 my-1.5  bg-[#333333] "></div>
        <div class="flex-1 bg-[#333333] rounded-xl flex items-center justify-center"><svg width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#6c6c6c" stroke="#6c6c6c"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2 8a1 1 0 011-1h10a1 1 0 110 2H3a1 1 0 01-1-1z" fill="#6c6c6c"></path> </g></svg></div>
    </div>
    
    
      
    <!-- text alignment -->
      <div class="flex gap-8 h-8 items-center justify-center whitespace-nowrap rounded-lg  bg-[#333333] text-white">
        <svg width="20px" height="20px"  viewBox="0 -1 28 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>align-left</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set" sketch:type="MSLayerGroup" transform="translate(-308.000000, -206.000000)" fill="#6c6c6c"> <path d="M335,222 L309,222 C308.447,222 308,222.448 308,223 C308,223.553 308.447,224 309,224 L335,224 C335.553,224 336,223.553 336,223 C336,222.448 335.553,222 335,222 L335,222 Z M324,230 L309,230 C308.447,230 308,230.447 308,231 C308,231.553 308.447,232 309,232 L324,232 C324.553,232 325,231.553 325,231 C325,230.447 324.553,230 324,230 L324,230 Z M309,208 L335,208 C335.553,208 336,207.553 336,207 C336,206.448 335.553,206 335,206 L309,206 C308.447,206 308,206.448 308,207 C308,207.553 308.447,208 309,208 L309,208 Z M309,216 L327,216 C327.553,216 328,215.553 328,215 C328,214.448 327.553,214 327,214 L309,214 C308.447,214 308,214.448 308,215 C308,215.553 308.447,216 309,216 L309,216 Z" id="align-left" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>
        <svg width="20px" height="20px"  viewBox="0 -1 28 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>align-center</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set" sketch:type="MSLayerGroup" transform="translate(-362.000000, -206.000000)" fill="#6c6c6c"> <path d="M383,230 L369,230 C368.447,230 368,230.447 368,231 C368,231.553 368.447,232 369,232 L383,232 C383.553,232 384,231.553 384,231 C384,230.447 383.553,230 383,230 L383,230 Z M389,222 L363,222 C362.447,222 362,222.448 362,223 C362,223.553 362.447,224 363,224 L389,224 C389.553,224 390,223.553 390,223 C390,222.448 389.553,222 389,222 L389,222 Z M367,214 C366.447,214 366,214.448 366,215 C366,215.553 366.447,216 367,216 L385,216 C385.553,216 386,215.553 386,215 C386,214.448 385.553,214 385,214 L367,214 L367,214 Z M363,208 L389,208 C389.553,208 390,207.553 390,207 C390,206.448 389.553,206 389,206 L363,206 C362.447,206 362,206.448 362,207 C362,207.553 362.447,208 363,208 L363,208 Z" id="align-center" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>
        <svg width="20px" height="20px"  viewBox="0 -1 28 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000" transform="matrix(-1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>align-left</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set" sketch:type="MSLayerGroup" transform="translate(-308.000000, -206.000000)" fill="#6c6c6c"> <path d="M335,222 L309,222 C308.447,222 308,222.448 308,223 C308,223.553 308.447,224 309,224 L335,224 C335.553,224 336,223.553 336,223 C336,222.448 335.553,222 335,222 L335,222 Z M324,230 L309,230 C308.447,230 308,230.447 308,231 C308,231.553 308.447,232 309,232 L324,232 C324.553,232 325,231.553 325,231 C325,230.447 324.553,230 324,230 L324,230 Z M309,208 L335,208 C335.553,208 336,207.553 336,207 C336,206.448 335.553,206 335,206 L309,206 C308.447,206 308,206.448 308,207 C308,207.553 308.447,208 309,208 L309,208 Z M309,216 L327,216 C327.553,216 328,215.553 328,215 C328,214.448 327.553,214 327,214 L309,214 C308.447,214 308,214.448 308,215 C308,215.553 308.447,216 309,216 L309,216 Z" id="align-left" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>
        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M18 12.75L18 11.25L6 11.25L6 12.75L18 12.75ZM15.182 7.00742L12 10.1894L8.81802 7.00742L9.87868 5.94676L11.25 7.31808L11.25 2.25L12.75 2.25L12.75 7.31808L14.1213 5.94676L15.182 7.00742ZM12 8.06808L11.9999 8.06801L12.0001 8.06801L12 8.06808ZM8.81802 16.9926L12 13.8106L15.182 16.9926L14.1213 18.0532L12.75 16.6819L12.75 21.75L11.25 21.75L11.25 16.6819L9.87868 18.0532L8.81802 16.9926ZM12 15.9319L12.0001 15.932L11.9999 15.932L12 15.9319Z" fill="#6c6c6c"></path> </g></svg>
        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M18 18.7499L18 17.2499L6 17.2499L6 18.7499L18 18.7499ZM8.81793 8.12119L11.9999 4.93921L15.1819 8.12119L14.1212 9.18185L12.7499 7.81053L12.7499 15.6745L11.2499 15.6745L11.2499 7.81053L9.87859 9.18185L8.81793 8.12119ZM11.9999 7.06053L12 7.06058L11.9999 7.06058L11.9999 7.06053Z" fill="#6c6c6c"></path> </g></svg>
        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 15.9853L15.182 12.8033L14.1213 11.7427L12.75 13.114L12.75 5.25L11.25 5.25L11.25 13.114L9.8787 11.7427L8.81804 12.8033L12 15.9853ZM12 13.864L12 13.864L12.0001 13.864L12 13.864Z" fill="#6c6c6c"></path> <path d="M18 17.25L18 18.75L6 18.75L6 17.25L18 17.25Z" fill="#6c6c6c"></path> </g></svg>
        
      </div>
    </div>
    {/if}
  </div>
  


</div>