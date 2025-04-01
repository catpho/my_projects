<script>
	// @ts-nocheck
	import '../app.css';

	import { onMount } from 'svelte';

	import { auth, db } from '$lib/firebase/firebase.client';
	import Header from '$lib/components/Header.svelte';
	import { authStore } from '$lib/stores/authStore';
	import { getDoc, setDoc, doc } from 'firebase/firestore';
	import { noteHandlers } from '$lib/stores/noteStore';
	import { userHandlers } from '$lib/stores/userStore';
	import { goto } from '$app/navigation';

	let userId = null;
	let displayBugBanner = true;
	let loginOrRegister = 'sign-in';
	let showLoginModal = false;
	let register = false;
	let displayLoginValidator = false;
	let forgotPassword = false;
	let registerStep = 1;

	let hideHeader = false;

	const nonAuthRoutes = [
		'/',
		'/aboutUs',
		'/features',
		'/search',
		'/resetPassword',
		'/termsOfUse',
		'/privacyPolicy'
	];
	const noHeaderRoutes = ['/noteTemp'];

	authStore.subscribe((state) => {
		userId = state?.currentUser?.uid;
		console.log('these id', userId);
	});

	const fetchNotes = async () => {
		await noteHandlers.getUserNotes(userId);
	};

	const fetchUser = async () => {
		await userHandlers.getUser(userId);
	};

	$: if (userId) {
		fetchUser();
		fetchNotes();
	}

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

			if (user && noHeaderRoutes.includes(currentPath)) {
				hideHeader = true;
			}
			if (user) {
				try {
					let dataToSetToStore;
					const docRef = doc(db, 'users', user.uid);
					const docSnap = await getDoc(docRef);

					if (!docSnap.exists()) {
						console.log('Creating/initializing first-time User');

						// Use Google profile image if available, otherwise use default image
						let profileImage = user.photoURL || 'https://i.imgur.com/mCHMpLT.png';

						const userRef = doc(db, 'users', user.uid);
						dataToSetToStore = {
							email: user.email,
							profileImage: profileImage,
							displayName: user.displayName,
							uid: user.uid,
							biography: '',
							myNotes: [],
							collaborators: [],
							messages: [],
							notifications: [],
							birthDay: '',
							createAt: new Date().toISOString(),
							lastActive: new Date().toISOString(),
							isPublic: true
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
				goto('/privateDashboard');
			}
		});
		return unsubscribe;
	});
</script>

<!-- header does not work currently to be hidden on certain pages -->
<div class="flex flex-grow flex-col overflow-auto bg-[#F8F8FA]">
	{#if userId}
		<Header />
	{/if}
	<main class=" mx-auto flex h-full w-full flex-grow flex-col p-1 px-5">
		<slot></slot>
	</main>
</div>

<style>
</style>
