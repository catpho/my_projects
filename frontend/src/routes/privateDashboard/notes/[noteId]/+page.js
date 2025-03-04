//@ts-nocheck
import { noteHandlers } from '$lib/stores/noteStore.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    try {
        const { noteId } = params;
        // console.log('Listing ID =>', noteId);

        // 1) Fetch the main listing data
        const noteData = { ... await noteHandlers.getNote(noteId)};
        // console.log('Got listingData =>', listingData);

        if (!noteData) {
            throw error(404, 'note not found');
        }


        // Return both the listingData and fetchedItems to the page
        return {
            noteData: noteData,
            
        };
    } catch (err) {
        // This ensures we see exactly what is failing
        console.error('Error in load function =>', err);
        // Rethrow so SvelteKit knows it's an error
        throw err;
    }
}