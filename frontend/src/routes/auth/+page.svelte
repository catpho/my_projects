<script>
	// import { goto } from '$app/navigation';
	//@ts-nocheck
	import { authHandlers, authStore } from '$lib/stores/authStore';
	import PasswordInput from '$lib/components/PasswordInput.svelte';

	export let register = false;
	export let displayLoginValidator = false;
	export let forgotPassword = false;
	export let registerStep = 1; // 1 for email/password, 2 for name

	let email = '';
	let password = '';
	let confirmPassword = '';
	let firstName = '';
	let lastName = '';
	let authenticating = false;
	let displayName = '';
	let loginValidatorMessage = '';
	let isSubmittingForgotPassword = false;

	function trimInput() {
		email = email.trim();
		password = password.trim();
		confirmPassword = confirmPassword.trim();
		firstName = firstName.trim();
		lastName = lastName.trim();
	}

	async function handleSubmit() {
		authenticating = true;
		displayLoginValidator = false;
		if (
			!email ||
			!password ||
			(register && !firstName) ||
			(register && !lastName) ||
			(register && !confirmPassword)
		) {
			loginValidatorMessage = 'Enter all the required details';
			displayLoginValidator = true;
			return;
		}

		if (register && password === confirmPassword) {
			try {
				displayName = firstName + ' ' + lastName;
				await authHandlers.signup(email, password);
				console.log('Registration successful');
				await authHandlers.updateProfile({ displayName: displayName });
				window.location.href = '/privateDashboard';
			} catch (err) {
				console.log(err);
				loginValidatorMessage = err.message.split(':')[1];
				displayLoginValidator = true;
			}
		} else {
			try {
				await authHandlers.login(email, password);
				// console.log('Login successful');
				window.location.href = '/privateDashboard';
			} catch (err) {
				loginValidatorMessage = err.message.split(':')[1];
				displayLoginValidator = true;
			}
		}
		console.log('authstore and current user in auth.svelte', $authStore.currentUser);
		if ($authStore.currentUser) {
			window.location.href = '/privateDashboard';
		}
		authenticating = false;
	}

	async function handleProceed() {
		if (!email || !password || !confirmPassword) {
			loginValidatorMessage = 'Enter all the required details';
			displayLoginValidator = true;
			return;
		} else if (password !== confirmPassword) {
			loginValidatorMessage = 'Passwords do not match';
			displayLoginValidator = true;
			return;
		} else {
			try {
				const { exists } = await authHandlers.checkEmailExists(email);
				if (exists) {
					loginValidatorMessage = 'An account already exists with the same email address';
					displayLoginValidator = true;
					return;
				} else {
					registerStep = 2;
					displayLoginValidator = false;
				}
			} catch (error) {
				console.log(error);
				loginValidatorMessage = error.message.split(':')[1];
				displayLoginValidator = true;
			}
		}
	}

	async function handleForgotPassword() {
		try {
			await authHandlers.resetPassword(email);
			displayLoginValidator = true;
			isSubmittingForgotPassword = true;
			loginValidatorMessage = 'Password reset email sent, please check your email';
		} catch (err) {
			console.log(err);
			loginValidatorMessage = err.message.split(':')[1];
			displayLoginValidator = true;
		}
	}
</script>

<div class="ml-10 flex flex-1 flex-col items-start justify-end">
	<!-- Register -->
	{#if register}
		<!-- Asks for email, password, confirm password, first name, last name -->
		{#if registerStep === 1}
			<div class="font-tanaegean mb-3 text-2xl">Create a user account</div>

			{#if displayLoginValidator}
				<p class="ml-[1px] w-2/3 text-sm text-red-700">{loginValidatorMessage}</p>
			{:else}
				<p class="ml-[1px] text-sm text-gray-600">Enter all the required details</p>
			{/if}

			<form class="mt-8 flex w-5/6 flex-col gap-2" action="">
				<label class="text-sm" for="email">Email Address</label>
				<input
					id="email"
					class="rounded"
					name="email"
					autocomplete="on"
					bind:value={email}
					type="email"
					on:input={trimInput}
				/>

				<label class="text-sm" for="password">Password </label>
				<PasswordInput bind:value={password} label="password" />
				<label class="text-sm" for="confirmPassword">Confirm Password </label>
				<PasswordInput bind:value={confirmPassword} label="confirmPassword" />

				<div class="mt-2 text-xs">
					By creating an account, you agree to Adamas
					<a href="/termsOfUse" class="text-adamas-blue font-bold">Terms of Use</a> and
					<a href="/privacyPolicy" class="text-adamas-blue font-bold">Privacy Policy</a>
				</div>

				<button
					class="bg-adamas-blue mt-4 w-full rounded-xl py-2 text-sm font-bold transition-all duration-300 hover:scale-105 hover:bg-[#aec3fc]"
					on:click={handleProceed}
				>
					Proceed
				</button>
			</form>
		{:else}
			<div class="font-tanaegean mb-3 text-2xl">Set up your user account</div>

			{#if displayLoginValidator}
				<p class="ml-[1px] text-sm text-red-700">{loginValidatorMessage}</p>
			{:else}
				<p class="ml-[1px] text-sm text-gray-600">Enter all the required details</p>
			{/if}

			<form class="mt-8 flex w-5/6 flex-col gap-2" action="">
				<label class="text-sm" for="firstName">First Name</label>
				<input class="rounded" bind:value={firstName} type="text" on:input={trimInput} />

				<label class="text-sm" for="lastName">Last Name</label>
				<input class="rounded" bind:value={lastName} type="text" on:input={trimInput} />

				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="mt-1 flex cursor-pointer justify-end text-sm font-bold text-[#9EB9FF] hover:underline"
					on:click={() => {
						registerStep = 1;
						displayLoginValidator = false;
					}}
					on:keydown={() => {}}
				>
					Back to email and password
				</div>

				<button
					class="bg-adamas-blue mt-4 w-full rounded-xl py-2 text-sm font-bold transition-all duration-300 hover:scale-105 hover:bg-[#aec3fc]"
					on:click={handleSubmit}
				>
					Create Account
				</button>
			</form>
		{/if}
		<!-- Login -->
	{:else if !register && !forgotPassword}
		<div class="font-tanaegean mb-3 text-2xl">Sign in to customer account</div>

		{#if displayLoginValidator}
			<p class="ml-[1px] w-2/3 text-sm text-red-700">{loginValidatorMessage}</p>
		{:else}
			<p class="ml-[1px] text-sm text-gray-600">Enter all the required details</p>
		{/if}

		<form class="mt-8 flex w-5/6 flex-col gap-2" action="">
			<label class="text-sm" for="email">Email Address</label>
			<input
				class="rounded"
				id="email"
				autocomplete="on"
				bind:value={email}
				type="email"
				on:input={trimInput}
			/>

			<label class="text-sm" for="loginPassword">Password </label>
			<PasswordInput bind:value={password} label="loginPassword" />

			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				class="mt-1 flex cursor-pointer justify-end text-sm font-bold text-[#9EB9FF] hover:underline"
				on:click={() => {
					forgotPassword = true;
					displayLoginValidator = false;
				}}
				on:keydown={() => {}}
			>
				Forgot Password?
			</div>

			<button
				class="bg-adamas-blue mt-4 w-full rounded-xl py-2 text-sm font-bold transition-all duration-300 hover:scale-105 hover:bg-[#aec3fc]"
				on:click={handleSubmit}
			>
				Sign In
			</button>
		</form>
		<!-- Forgot Password -->
	{:else if forgotPassword}
		<div class="font-tanaegean mb-3 text-2xl">Forgot Password</div>

		{#if displayLoginValidator && !isSubmittingForgotPassword}
			<p class="ml-[1px] mt-1 text-sm text-red-700">{loginValidatorMessage}</p>
		{:else if isSubmittingForgotPassword}
			<p class="ml-[1px] mt-1 text-sm text-green-500">
				{loginValidatorMessage}
			</p>
		{:else if !displayLoginValidator}
			<p class="ml-[1px] mt-1 text-sm text-gray-600">
				Enter the email address linked to your account
			</p>
		{/if}

		<form on:submit={handleForgotPassword} class="mt-8 flex w-5/6 flex-col gap-2" action="">
			<label class="text-sm" for="email">Email Address</label>
			<input class="rounded" bind:value={email} type="email" id="email" autocomplete="on" />

			<button
				type="submit"
				class="bg-adamas-blue mt-4 w-full rounded-xl py-2 text-sm font-bold transition-all duration-300 hover:scale-105 hover:bg-[#aec3fc]"
			>
				Proceed
			</button>
		</form>
	{/if}

	{#if !forgotPassword}
		<div class="mt-3 w-5/6">
			<div class="mb-3 mt-1 flex items-center">
				<span class="px-2 text-xs font-bold">OR</span>
			</div>

			<div class="mb-3 flex items-center justify-center">
				{#if register}
					<span class="text-center text-sm font-bold">Register with</span>
				{:else}
					<span class="text-center text-sm font-bold">Sign in with</span>
				{/if}
			</div>
		</div>
	{/if}

	{#if register && !forgotPassword}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="ml-24 mt-10 flex cursor-pointer flex-row items-center justify-center gap-2 text-sm text-gray-600"
			on:click={() => {
				register = false;
				displayLoginValidator = false;
			}}
			on:keydown={() => {}}
		>
			Already have an account?
			<p
				class="cursor-pointer text-center font-bold
			text-[#9EB9FF] underline hover:text-[#aec3fc]"
			>
				Log In
			</p>
		</div>
	{:else if !register && !forgotPassword}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="ml-24 mt-10 flex cursor-pointer flex-row items-center justify-center gap-2 text-sm text-gray-600"
			on:click={() => {
				register = true;
				displayLoginValidator = false;
			}}
			on:keydown={() => {}}
		>
			Don't have an account?
			<p
				class="cursor-pointer text-center font-bold
			text-[#9EB9FF] underline hover:text-[#aec3fc]"
			>
				Register
			</p>
		</div>
	{:else if forgotPassword}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="ml-[-44px] mt-10 flex w-full cursor-pointer flex-row items-center justify-center text-sm"
			on:click={() => {
				register = false;
				forgotPassword = false;
				displayLoginValidator = false;
			}}
			on:keydown={() => {}}
		>
			<p
				class="cursor-pointer text-center font-bold
			text-[#9EB9FF] underline hover:text-[#aec3fc]"
			>
				Log In
			</p>
		</div>
	{/if}
</div>

<style>
</style>
