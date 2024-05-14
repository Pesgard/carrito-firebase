<script>
	import ProductsByRevenue from './ProductsByRevenue.svelte';
	import ProductsSoldChart from './ProductsSoldChart.svelte';
	import TopBuyingClients from './TopBuyingClients.svelte';
	import TopRevenueClients from './TopRevenueClients.svelte';
</script>

<div class="w-full m-4 bg-white h-full overflow-auto">
	<h2 class="text-4xl flex flex-row justify-center items-center">Estadisticas sobre productos</h2>
	<section class="mt-4">
		<ProductsSoldChart />
	</section>

	<hr class="w-full m-4" />

	<section class="mt-4">
		<ProductsByRevenue />
	</section>

	<hr class="w-full m-4" />

	<section class="mt-4 bg-white">
		<TopBuyingClients />
	</section>

	<hr class="w-full m-4" />

	<section class="mt-4 bg-white">
		<TopRevenueClients/>
	</section>
</div>
