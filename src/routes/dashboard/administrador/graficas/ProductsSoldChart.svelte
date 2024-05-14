<!-- ProductsSoldChart.svelte -->
<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import { getProductsSoldByQuantity } from '$lib/firebase'; // Asegúrate de colocar la ruta correcta
    
    let productsSold = [];

    onMount(async () => {
        try {
            // Obtener los productos vendidos por cantidad
            productsSold = await getProductsSoldByQuantity();

            // Configurar los datos para la gráfica
            const labels = productsSold.map(product => product.name);
            const data = productsSold.map(product => product.quantity);

            // Crear el gráfico
            const ctx = document.getElementById('products-sold-chart');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Productos Vendidos por Cantidad',
                        data,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
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
            console.error('Error al obtener los productos vendidos por cantidad:', error);
            // Manejar el error según tu lógica
        }
    });
</script>

<div class="grid grid-cols-2 gap-4">
    <div class="col-span-1">
        <h2 class="text-xl font-bold mb-4">Productos Vendidos por Cantidad (Gráfico)</h2>
        <canvas id="products-sold-chart" class="w-full" height="200"></canvas>
    </div>
    <div class="col-span-1">
        <h2 class="text-xl font-bold mb-4">Productos Vendidos por Cantidad (Tabla)</h2>
        <table class="w-full">
            <thead>
                <tr>
                    <th class="px-4 py-2">Nombre</th>
                    <th class="px-4 py-2">Cantidad Vendida</th>
                </tr>
            </thead>
            <tbody>
                {#each productsSold as product}
                    <tr>
                        <td class="border px-4 py-2">{product.name}</td>
                        <td class="border px-4 py-2">{product.quantity}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
