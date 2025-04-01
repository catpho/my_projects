//@ts-nocheck
import { userHandlers } from '$lib/stores/userStore.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    try {
        const { userId } = params;

        const userData = { ... await userHandlers.getUser(userId) };

        if (!userData) {
            throw error(404, 'user not found');
        }

        return {
            userData: userData

        };
    } catch (err) {
        console.error('Error in load function =>', err);
        throw err;
    }
}