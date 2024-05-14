<script>
	import { onMount } from 'svelte';
	import { authStore } from '../../../stores/authStore';
	import { TabGroup, Tab } from '@skeletonlabs/skeleton';
	import { BuildingStorefront, Envelope, Icon, PresentationChartBar } from 'svelte-hero-icons';
	import Inventario from './Inventario.svelte'

	let email = '';
	let admin;

	let tabSet = 0;

	onMount(() => {
		authStore.subscribe((curr) => {
		console.log('usuario admin?', curr);
		email = curr?.currentUser?.email;

		if (!curr.isLoading) {
			if (email === 'admin@example.com') {
				admin = true;
			} else {
				window.location.href = '/dashboard/productos'
			}
		}
	});
	});
	
</script>

<TabGroup>
	<Tab bind:group={tabSet} name="tab1" value={0}>
		<svelte:fragment slot="lead">
			<Icon src={BuildingStorefront} size="24" />
			<p>Productos</p>
		</svelte:fragment>
	</Tab>
	<Tab bind:group={tabSet} name="tab2" value={1}>
		<Icon src={PresentationChartBar} size="24" />
		<p>Graficas</p>
	</Tab>
	<Tab bind:group={tabSet} name="tab3" value={2}
		><Icon src={Envelope} size="24" />
		<p>Chat</p>
	</Tab>
	<!-- Tab Panels --->
	<svelte:fragment slot="panel">
		{#if tabSet === 0}
		<!-- Contenido del panel de productos -->
		<Inventario/>
		{:else if tabSet === 1}
			(tab panel 2 contents)
		{:else if tabSet === 2}
			(tab panel 3 contents)
		{/if}
	</svelte:fragment>
</TabGroup>
