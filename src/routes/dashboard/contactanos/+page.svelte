<script>
	import { onMount } from 'svelte';
	import Admin from './Admin.svelte';
	import Cliente from './Cliente.svelte';
	import { authStore } from '../../../stores/authStore';

	let isAdmin = false;
    let email = '';

	onMount(() => {
		authStore.subscribe((curr) => {
			email = curr?.currentUser?.email;

			if (!curr.isLoading) {
				if (email === 'testcarritoalan@gmail.com') {
					isAdmin = true;
				}
			}
		});
	});
</script>

{#if isAdmin}
	<Admin />
{:else}
	<Cliente />
{/if}
