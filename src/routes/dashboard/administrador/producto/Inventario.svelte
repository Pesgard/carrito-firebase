<!-- index.svelte -->

<script>
	import { Autocomplete } from '@skeletonlabs/skeleton';
	import {
		toggleProductStatus,
		updateProductPrice,
		updateProductQuantity,
		cargarProductos,
		updateProductImage
	} from '$lib/firebase';
	import Swal from 'sweetalert2';
	import NuevoProducto from './NuevoProducto.svelte';

	let inputDemo = '';
	let selected = null;
	let productos = [];
	let selectedProduct = null;

	// Cargar los productos al inicio
	cargarProductos().then((data) => {
		productos = data.map((producto) => ({ label: producto.nombre, value: producto }));
		console.log(productos);
	});

	function onProductSelection(event) {
		inputDemo = event.detail.label;
		selected = inputDemo;
		selectedProduct = productos.find((producto) => producto.label === selected).value;
		console.log(selectedProduct);
	}

	//funcion para cambiar la imagen de un producto subiendolo desde la computadora como png o jpg
	async function cambiarImagenProducto() {
		if (selectedProduct) {
			const file = document.getElementById('file').files[0];
			const success = await updateProductImage(selectedProduct.id, file);
			if (success) {
				showSuccessMessage('Imagen del producto actualizada');
			} else {
				showErrorMessage('Error al actualizar la imagen del producto');
			}
		}
	}


	async function toggleEstadoProducto() {
		if (selectedProduct) {
			const newStatus = !selectedProduct.estado;
			const success = await toggleProductStatus(selectedProduct.id, newStatus);
			if (success) {
				selectedProduct.estado = newStatus;
				showSuccessMessage('Estado del producto actualizado');
			} else {
				showErrorMessage('Error al actualizar el estado del producto');
			}
		}
	}

	async function modificarPrecio(newPrice) {
		if (selectedProduct && newPrice >= 0) {
			const success = await updateProductPrice(selectedProduct.id, newPrice);
			if (success) {
				selectedProduct.precio = newPrice;
				showSuccessMessage('Precio del producto actualizado');
				limpiarInput();
			} else {
				showErrorMessage('Error al actualizar el precio del producto');
			}
		}
	}

	async function modificarCantidad(newQuantity) {
		if (selectedProduct && newQuantity >= 0) {
			const success = await updateProductQuantity(selectedProduct.id, newQuantity);
			if (success) {
				selectedProduct.cantidad = newQuantity;
				showSuccessMessage('Cantidad del producto actualizada');
				limpiarInput();
			} else {
				showErrorMessage('Error al actualizar la cantidad del producto');
			}
		}
	}

	// Función para limpiar el input y reiniciar selectedProduct
	function limpiarInput() {
		inputDemo = '';
		selected = null;
		selectedProduct = null;
	}

	// Función para mostrar un mensaje de éxito con SweetAlert2
	function showSuccessMessage(message) {
		Swal.fire({
			icon: 'success',
			title: 'Éxito',
			text: message
		});
	}

	// Función para mostrar un mensaje de error con SweetAlert2
	function showErrorMessage(message) {
		Swal.fire({
			icon: 'error',
			title: 'Error',
			text: message
		});
	}
</script>

<div class="grid grid-cols-3">
	<div class="flex flex-col w-full items-center">
		<NuevoProducto />
	</div>

	<span class="divider-vertical h-screen" />

	<div class="w-fit">
		Modificar Productos
		<input
			class="input variant-ringed-primary"
			type="search"
			name="demo"
			bind:value={inputDemo}
			placeholder="Buscar Productos"
		/>

		<div class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto" tabindex="-1">
			<Autocomplete bind:input={inputDemo} options={productos} on:selection={onProductSelection} />
		</div>

		{#if selectedProduct}
			<div class="card w-full max-w-sm p-4 mt-4">
				<h3>{selectedProduct.nombre}</h3>
				<p>Estado: {selectedProduct.estado ? 'Activado' : 'Desactivado'}</p>
				<p>Precio: ${selectedProduct.precio}</p>
				<p>Cantidad Disponible: {selectedProduct.cantidad}</p>

				<hr />
				<div class="mt-4 flex-col">
					<h3>Opciones de producto</h3>
					<button on:click={toggleEstadoProducto} class="btn variant-soft-primary">
						{selectedProduct.estado ? 'Desactivar' : 'Activar'} Producto
					</button>

					<div class=" m-4 flex flex-row">
						<input
							type="number"
							class="input"
							min="0"
							step="0.01"
							bind:value={selectedProduct.precio}
						/>
						<button
							class="btn variant-filled-primary text-surface-50"
							on:click={() => modificarPrecio(selectedProduct.precio)}>Modificar Precio</button
						>
					</div>

					<div class="m-4 flex flex-row">
						<input
							type="number"
							class="input"
							min="0"
							step="1"
							bind:value={selectedProduct.cantidad}
						/>
						<button
							class="btn variant-filled-primary text-surface-50"
							on:click={() => modificarCantidad(selectedProduct.cantidad)}
							>Modificar Cantidad</button
						>
					</div>

					<div class="m-4 flex flex-row">
						<img src={selectedProduct.imagen} alt={selectedProduct.nombre} class="w-24 h-24" />
						<label class="label">
							<span>Modificar imagen</span>
							<input class="input" type="file" id="file" accept="image/*" />
							<button class="btn variant-filled-primary text-surface-50" on:click={cambiarImagenProducto}>Cambiar Imagen</button>
						</label>
					</div>

					<!-- Botón para limpiar input y reiniciar selectedProduct -->
					<button class="btn variant-outline-tertiary" on:click={limpiarInput}>Limpiar</button>
				</div>
			</div>
		{/if}
	</div>
</div>
