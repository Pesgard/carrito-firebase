<script>
	import '../app.postcss';
	import { onMount } from 'svelte';
	import { auth } from '../lib/firebase';
	import { browser } from '$app/environment';
	import { authStore } from '../stores/authStore';

	
	onMount(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			console.log(user);
			authStore.update((curr) => {
				return { ...curr, isLoading: false, currentUser: user };
			});

			if (
				browser &&
				!$authStore?.currentUser &&
				!$authStore.isLoading &&
				window.location.pathname !== '/'
			) {	
				window.location.href = '/';
				console.log(authStore.currentUser, authStore.isLoading);
			}
		});
		return unsubscribe;
	});
</script>

<div class="flex flex-row bg-white w-screen h-screen">
	
	<slot />
</div>
