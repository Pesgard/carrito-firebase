<script>
    import { getSalesByDateRange } from '$lib/firebase'; // Asegúrate de colocar la ruta correcta
    
    let startDate; // Puedes inicializar estas fechas como quieras
    let endDate;
    let sales = [];
  
    async function fetchSales() {
      try {
        // Llama a la función para obtener las ventas por fecha
        sales = await getSalesByDateRange(startDate, endDate);
        console.log(startDate, endDate);
        console.log(sales);
      } catch (error) {
        console.error('Error al obtener las ventas:', error);
        // Maneja el error aquí según tu lógica
      }
    }
  
    // Esta función se llama al hacer clic en el botón "Buscar"
    async function buscarVentas() {
      await fetchSales();
    }
</script>

<div>
    <h2>Ventas por Fecha</h2>
    
    <label>
        Fecha de inicio:
        <input type="date" bind:value={startDate} />
    </label>
    
    <label>
        Fecha de fin:
        <input type="date" bind:value={endDate} />
    </label>
    
    <button on:click={buscarVentas}>Buscar</button>

    <table>
        <thead>
            <tr>
                <th>ID de Venta</th>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Productos</th>
            </tr>
        </thead>
        <tbody>
            {#each sales as sale}
                <tr>
                    <td>{sale.id}</td>
                    <td>{sale.timestamp}</td>
                    <td>{sale.userId}</td>
                    <td>
                        <ul>
                            {#each sale.products as product}
                                <li>{product.name}: {product.quantity}</li>
                            {/each}
                        </ul>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
