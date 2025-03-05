<script>
    // //@ts-nocheck
    import { onMount } from 'svelte';
    export let data;
    let timestamp = null;

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
let isExpanded = true;
  
  function toggleView() {
    isExpanded = !isExpanded;
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
      
      <div>
          <svg class="w-8 h-8 text-gray-800 dark:text-white rounded-full bg-red-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/>
          </svg>
        </div>
    </div>
    <br/>
<div class="font-extrabold text-4xl">{data.noteData.title}</div>
<div class="text-sm text-gray-500 ">{formatFirestoreTimestamp(data.noteData.noteCreatedAt)}</div>
<br/>
<div>{data.noteData.content}</div>


  
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div 
    class={`w-[90%] fixed bottom-0 bg-[#282828] shadow-lg  p-3 transition-all duration-300 cursor-pointer ${
        isExpanded ? 'h-[30vh] rounded-t-lg' : 'h-auto rounded-t-2xl'
      }`}
    on:click={toggleView}
  >
    <div class="text-white">lines here</div>
  
    {#if isExpanded}
      <div class="text-white mb-2">Text Format</div>
  
      <div class="grid grid-cols-8 gap-11 mb-2">
        {#each Array(7) as _, i}
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
            {i + 1}
          </div>
        {/each}
      </div>
  
      <div class="flex gap-4 mb-2">
        <div class="w-16 h-8 bg-red-500 rounded-xl flex items-center justify-center text-white">B</div>
        <div class="w-16 h-8 bg-red-500 rounded-xl flex items-center justify-center text-white">I</div>
        <div class="w-16 h-8 bg-red-500 rounded-xl flex items-center justify-center text-white">U</div>
        <div class="w-16 h-8 bg-red-500 rounded-xl flex items-center justify-center text-white">-</div>
      </div>
  
      <div class="flex items-center justify-center whitespace-nowrap rounded-lg bg-blue-200 text-white">white</div>
    {/if}
  </div>
  


</div>