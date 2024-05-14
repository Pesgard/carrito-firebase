<!-- PurchaseHistory.svelte -->
<script>
	import { authStore } from '../../../stores/authStore';
	import { onMount } from 'svelte';
	import { getUserPurchaseHistory } from '$lib/firebase'; // Asegúrate de colocar la ruta correcta

	let purchases = [];
	let userId;

	// Función para formatear el timestamp a una fecha legible
	function formatTimestamp(timestamp) {
		const date = new Date(timestamp.seconds * 1000); // Convertir segundos a milisegundos
		return date.toLocaleString(); // Formatear la fecha y hora localmente
	}

	onMount(() => {
		authStore.subscribe((curr) => {
			console.log('usuario admin?', curr);
			userId = curr?.currentUser?.uid;

			if (!curr.isLoading) {
				try {
					console.log(userId);
					getUserPurchaseHistory(userId)
						.then((result) => {
							purchases = result;
						})
						.catch((error) => {
							console.error('Error al obtener el historial de compras:', error);
							// Manejar el error según tu lógica
						});
				} catch (error) {
					console.error('Error al obtener el historial de compras:', error);
					// Manejar el error según tu lógica
				}
			}
		});
	});
</script>

<div>
	<h3 class="flex flex-row w-full items-center justify-center text-3xl">Historial de Compras</h3>
	{#if purchases.length === 0}
		<p>No hay compras registradas.</p>
	{:else}
		{#each purchases as purchase}
			<hr />
			<div class="mb-4">
				<table class="min-w-full divide-y divide-gray-200 mt-4">
					<thead class="bg-surface-200">
						<tr class="bg-surface-100">
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>Nombre del Producto</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>Precio</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>Cantidad</th
							>
						</tr>
					</thead>
					<tbody class="bg-surface-50 divide-y divide-white">
						{#each purchase.products as product}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap">{product.name}</td>
								<td class="px-6 py-4 whitespace-nowrap">${product.price}</td>
								<td class="px-6 py-4 whitespace-nowrap">{product.quantity}</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<div class="flex flex-col w-full items-center justify-center m-4 bg-surface-300">
					<p>Fecha: {formatTimestamp(purchase.timestamp)}</p>
					<p>Total: ${purchase.totalRevenue}</p>
					<!-- Agrega más detalles si es necesario -->
				</div>
			</div>
		{/each}
	{/if}
</div>
