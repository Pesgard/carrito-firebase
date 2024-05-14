<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import { getTopRevenueClients } from '$lib/firebase'; // Asegúrate de colocar la ruta correcta
    
    let topClients = [];

    onMount(async () => {
        try {
            // Obtener los clientes que generan más ingresos
            topClients = await getTopRevenueClients();

            // Configurar los datos para la gráfica
            const labels = topClients.map(client => `${client.firstName} ${client.lastName}`);
            const data = topClients.map(client => client.totalRevenue);

            // Crear la gráfica
            const ctx = document.getElementById('top-revenue-clients-chart');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Clientes que Generan más Ingresos',
                        data,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)', // Color de fondo
                        borderColor: 'rgba(75, 192, 192, 1)', // Color del borde
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
            console.error('Error al obtener los clientes que generan más ingresos:', error);
            // Manejar el error según tu lógica
        }
    });
</script>

<div class="grid grid-cols-2 gap-4 bg-surface-50">
    <div>
        <h2 class="text-xl font-semibold mb-4">Clientes que Generan más Ingresos</h2>
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total de ingresos</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                {#each topClients as client}
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">{client.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap">{client.email}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${client.totalRevenue.toFixed(2)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div>
        <h2 class="text-xl font-semibold mb-4">Gráfico de Clientes que Generan más Ingresos</h2>
        <canvas id="top-revenue-clients-chart" class="w-full h-auto"></canvas>
    </div>
</div>
