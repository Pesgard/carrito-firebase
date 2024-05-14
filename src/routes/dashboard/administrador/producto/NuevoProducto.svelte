<!-- NuevoProducto.svelte -->

<script>
	import Swal from 'sweetalert2';
	import { addProduct } from '$lib/firebase';

	let nuevoProducto = {
		nombre: '',
		cantidad: 0,
		precio: 0,
		imagen: null,
		estado: true
	};

	// Función para manejar la subida de la imagen
	function handleImageUpload(event) {
		const file = event.target.files[0];
		nuevoProducto.imagen = file;
	}

	// Función para validar el formulario
	function validarFormulario() {
		if (nuevoProducto.precio < 0 || nuevoProducto.cantidad < 0) {
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'El precio y la cantidad no pueden ser valores negativos.',
				confirmButtonText: 'OK'
			});
			return false;
		}
		return true;
	}

	// Función para crear el producto
	async function crearProducto() {
		if (!validarFormulario()) {
			return; // No se envía el formulario si la validación falla
		}
		try {
			const nuevoProductoId = await addProduct(nuevoProducto);
			Swal.fire({
				icon: 'success',
				title: 'Éxito',
				text: `Producto creado con ID: ${nuevoProductoId}`
			});
			// Limpiar el formulario después de agregar el producto
			nuevoProducto = {
				nombre: '',
				cantidad: 0,
				precio: 0,
				imagen: null,
				estado: true
			};
		} catch (error) {
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Error al crear el producto ' + error,
				confirmButtonText: 'OK'
			});
			// Manejar el error aquí
		}
	}
</script>

<div>
	<h2>Crear Nuevo Producto</h2>
	<form on:submit|preventDefault={crearProducto}>
		<label class="label">
			Nombre:
			<input type="text" class="input" bind:value={nuevoProducto.nombre} />
		</label>
		<label class="label">
			Cantidad:
			<input type="number" class="input" bind:value={nuevoProducto.cantidad} />
		</label>
		<label class="label">
			Precio:
			<input type="number" class="input" bind:value={nuevoProducto.precio} />
		</label>
		<label class="label">
			Imagen:
			<input type="file" accept="image/*" class="input" on:change={handleImageUpload} />
		</label>
		<button type="submit" class="btn variant-filled-primary mt-4 text-surface-50"
			>Crear Producto</button
		>
	</form>
</div>
