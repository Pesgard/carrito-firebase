<script>
	import Swal from 'sweetalert2';
	import { getProductDetailsByName, addToCart, getProductDetailsById } from '$lib/firebase';
	import { onMount } from 'svelte';
	import { Icon, Plus, Minus, ShoppingCart } from 'svelte-hero-icons';

	let productQuantity;
	let productPrice = 0;
	let productimage;
	let productDetails;
	let productCount = 0;
	let productName;
	let pruductID = 'producto16';

	function buyProduct() {
		if (productCount <= productQuantity) {
			let productTotal = productPrice * productCount;
			addToCart(
				productName,
				productCount,
				productimage,
				productTotal,
				productQuantity,
				productPrice
			);
			// Muestra un mensaje de éxito con SweetAlert2
			Swal.fire({
				icon: 'success',
				title: '¡Producto Agregado!',
				text: 'Se agergo al carrito exitosamente',
				confirmButtonText: 'OK'
			});
		} else {
			Swal.fire({
				icon: 'error',
				title: '¡Cantidad incorrecta!',
				text: 'Has agregado mas producto de los que hay disponibles',
				confirmButtonText: 'OK'
			});
		}
	}

	onMount(async () => {
		//productDetails = await getProductDetailsByName(productName);
		productDetails = await getProductDetailsById(pruductID);
		//console.log(productDetails);
		productName = productDetails.nombre;
		productimage = productDetails.imagen;
		productPrice = productDetails.precio;
		productQuantity = productDetails.cantidad;
	});

	function decreaseCount() {
		if (productCount > 1) {
			productCount--;
		}
	}

	function increaseCount() {
		productCount++;
	}
</script>

<section class="grid grid-cols-2 mt-32 w-full">
	<div class="product__images flex justify-center items-center flex-none">
		<div class="product__images--image">
			<img alt="producto" class="h-96 w-120 rounded-lg" src={productimage} />
		</div>
		<div class="thumbnail-container thumbnail-container-main"></div>
	</div>
	<div class="flex flex-col justify-center flex-none pl-16 pr-64">
		<h1 id="productName" class="text-green text-5xl font-bold py-8">{productName}</h1>
		<div class="flex flex-row w-full">
			<p class="mr-6 w-fit flex flex-row justify-start items-center text-xl">
				Disponibles: {productQuantity}
			</p>

			<p id="productPrice" class="text-3xl font-bold text-primary-500">
				$ {productPrice} MXN
			</p>
		</div>
		<div class="flex items-center">
			<div class="flex flex-row bg-transparent ring-1 ring-primary-400 w-fit mr-6">
				<!-- Disminuir Cuenta -->
				<button on:click={decreaseCount} class="btn-icon-sm rounded-none">
					<Icon src={Minus} class="h-4" />
				</button>
				<input
					type="number"
					bind:value={productCount}
					class="input rounded-none text-center bg-transparent w-16 ring-opacity-0"
					name="count"
					min="1"
					placeholder="1"
				/>
				<!-- incrementar cuenta -->
				<button on:click={increaseCount} class="btn-icon-sm rounded-none">
					<Icon src={Plus} class="h-4" />
				</button>
			</div>
			<button
				on:click={buyProduct}
				type="button"
				class="w-full flex flex-row justify-center items-center text-white bg-primary-400 font-bold rounded-lg py-2 hover:bg-primary-600"
			>
				<Icon src={ShoppingCart} class="w-4 mr-5" />
				<span>Agregar al carrito</span>
			</button>
		</div>
	</div>
</section>
