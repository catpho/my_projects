// @ts-nocheck
import { derived, writable } from 'svelte/store';
import {
    auth
} from '$lib/firebase/firebase.client';
import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateEmail,
    updatePassword,
    updateProfile,
    sendEmailVerification,
    signInWithPopup,
    confirmPasswordReset,
    fetchSignInMethodsForEmail,
    linkWithCredential
} from 'firebase/auth';

export const authStore = writable({
    isLoading: true,
    currentUser: null
});

//auth authHandler functions
export const authHandlers = {
    signup: async (email, password, displayName) => {
        await createUserWithEmailAndPassword(auth, email, password, displayName).then(
            (newUserCredential) => {
                sendEmailVerification(newUserCredential.user);
            }
        );
    },

    login: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
    },

    checkEmailExists: async (email) => {
        try {
            const signInMethods = await fetchSignInMethodsForEmail(auth, email);
            return {
                exists: signInMethods.length > 0,
                signInMethods: signInMethods
            };
        } catch (error) {
            return error;
        }
    },
    linkWithCredential: async (user, newCredential) => {
        try {
            const result = await linkWithCredential(user, newCredential);
            return result;
        } catch (error) {
            return error;
        }
    },
    getSignInMethods: async (email) => {
        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            return methods;
        } catch (error) {
            console.error('Error fetching sign-in methods:', error);
            throw error;
        }
    },
    logout: async () => {
        await signOut(auth);
    },
    resetPassword: async (email) => {
        await sendPasswordResetEmail(auth, email);
    },
    confirmPasswordReset: async (oobCode, newPassword) => {
        await confirmPasswordReset(auth, oobCode, newPassword);
    },
    updateEmail: async (email) => {
        authStore.update((curr) => {
            return {
                ...curr,
                currentUser: {
                    ...curr.currentUser,
                    email: email
                }
            };
        });
        await updateEmail(auth.currentUser, email);
    },
    updatePassword: async (password) => {
        await updatePassword(auth.currentUser, password);
    },
    //displayName can be interchanged with photoURL
    updateProfile: async (displayName) => {
        await updateProfile(auth.currentUser, displayName);
    },
    changePassword: async (oldPassword, newPassword) => {
        const user = auth.currentUser;

        if (user) {
            try {
                // First, reauthenticate the user with their old password
                const credential = EmailAuthProvider.credential(user.email, oldPassword);
                await reauthenticateWithCredential(user, credential);

                // Now, update the password
                await updatePassword(user, newPassword);

                // Optionally, return a success message or update the store
                return { success: true, message: 'Password updated successfully' };
            } catch (error) {
                console.error('Error changing password:', error);
                throw new Error('Password change failed: ' + error.message);
            }
        } else {
            throw new Error('User not authenticated');
        }
    }
};

//test for isLoggedIn value
export const isLoggedIn = derived(authStore, ($authStore) => {
    return $authStore.currentUser ? true : false;
});