<script>
    import { onMount } from 'svelte';
    export let data;
    onMount(()=> {console.log("data", data)})
</script>

<div> Hello World</div>
<div>{data.noteData.title}</div>