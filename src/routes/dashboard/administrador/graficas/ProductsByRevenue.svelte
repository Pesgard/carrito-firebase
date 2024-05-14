<!-- ProductsByRevenueChart.svelte -->
<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import { getProductsByRevenue } from '$lib/firebase'; // Asegúrate de colocar la ruta correcta
    
    let productsByRevenue = [];

    onMount(async () => {
        try {
            // Obtener los productos por ingresos
            productsByRevenue = await getProductsByRevenue();
            
            // Configurar los datos para la gráfica
            const labels = productsByRevenue.map(product => product.name);
            const data = productsByRevenue.map(product => product.revenue);

            // Crear la gráfica
            const ctx = document.getElementById('products-revenue-chart');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Ingresos por Producto',
                        data,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)', // Color de fondo
                        borderColor: 'rgba(255, 99, 132, 1)', // Color del borde
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error al obtener los productos por ingresos:', error);
            // Manejar el error según tu lógica
        }
    });
</script>

<div class="grid grid-cols-2 gap-4">
    <div class="col-span-1">
        <h2 class="text-xl font-bold mb-4">Productos por Ingresos (Gráfico)</h2>
        <canvas id="products-revenue-chart" class="w-full" height="200"></canvas>
    </div>
    <div class="col-span-1">
        <h2 class="text-xl font-bold mb-4">Productos por Ingresos (Tabla)</h2>
        <table class="w-full">
            <thead>
                <tr>
                    <th class="px-4 py-2">Nombre</th>
                    <th class="px-4 py-2">Ingresos</th>
                </tr>
            </thead>
            <tbody>
                {#each productsByRevenue as product}
                    <tr>
                        <td class="border px-4 py-2">{product.name}</td>
                        <td class="border px-4 py-2">{product.revenue}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    /* Estilos adicionales aquí si es necesario */
</style>
