<script>
	// @ts-nocheck
	import '../app.css';

	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase/firebase.client';
	import { authStore } from '$lib/stores/authStore';
	import { getDoc, setDoc, doc } from 'firebase/firestore';
	import Header from '$lib/components/Header.svelte';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import Auth from '$lib/components/Auth.svelte';

	let displayBugBanner = true;
	let loginOrRegister = 'sign-in';
	let showLoginModal = false;
	let register = false;
	let displayLoginValidator = false;
	let forgotPassword = false;
	let registerStep = 1;

	const nonAuthRoutes = [
		'/',
		'/aboutUs',
		'/features',
		'/search',
		'/resetPassword',
		'/termsOfUse',
		'/privacyPolicy'
	];

	onMount(async () => {
		const unsubscribe = auth.onAuthStateChanged(async (user) => {
			const currentPath = window.location.pathname;

			if (!user && !nonAuthRoutes.includes(currentPath)) {
				window.location.href = '/';
				return;
			}

			if (!user) {
				return;
			}

			if (user) {
				try {
					let dataToSetToStore;
					const docRef = doc(db, 'users', user.uid);
					const docSnap = await getDoc(docRef);

					if (!docSnap.exists()) {
						console.log('Creating/initializing first-time User');

						// Use Google profile image if available, otherwise use default image
						let profileImage =
							user.photoURL ||
							'https://i.imgur.com/mCHMpLT.png';

						const userRef = doc(db, 'users', user.uid);
						dataToSetToStore = {
							email: user.email,
							profileImage: profileImage, // Set profileImage from Google or default
							displayName: user.displayName,
							uid: user.uid,
							biography:"",
							personalNoteBoard:[],
							collaborators:[],
							createAt: new Date().toISOString(),
							lastActive: new Date().toISOString(),
							isPublic:false
						};
						await setDoc(userRef, dataToSetToStore, { merge: true });
						console.log('User document created successfully.');
					} else {
						console.log('Fetching User');
						const userData = docSnap.data();
						dataToSetToStore = userData;
					}

					authStore.update((curr) => ({
						...curr,
						currentUser: user,
						data: dataToSetToStore,
						isLoading: false
					}));
				} catch (error) {
					console.error('Error handling user document:', error);
					authStore.update((curr) => ({ ...curr, isLoading: false }));
				}
			}
		});
		return unsubscribe;
	});
</script>

<div class="app">
	<Header bind:showLoginModal bind:register />

	<main>
		<slot></slot>
	</main>

	<LoginModal
		bind:showModal={showLoginModal}
		bind:displayLoginValidator
		bind:forgotPassword
		bind:registerStep
		Class="w-1/2 h-[77%]"
	>
		<Auth bind:register bind:displayLoginValidator bind:forgotPassword />
	</LoginModal>

	<footer>
		
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>