<script>
	import { authHandlers, authStore } from '../../stores/authStore';
	import { AppBar } from '@skeletonlabs/skeleton';
	import Logo from '$lib/logo.jpg';
	import { Icon, User, ShoppingCart } from 'svelte-hero-icons';
	import { toggleCart, createPurchase } from '../../lib/firebase';

	let verified;
	let email;
	let admin;
	let showUserInfo = false;
	let cartItems = []; // Esta variable debe contener los productos del carrito
	let showCartInfo = false;

	//Mostrar informacion del Usuario
	function toggleUserInfo() {
		showUserInfo = !showUserInfo;
	}

	//Mostrar informacion del Usuario
	function toggleCartInfo() {
		showCartInfo = !showCartInfo;
		const name = "cartDetails";
		toggleCart(cartItems, name);
	}

	async function purchase(){
		await createPurchase();
	}

	authStore.subscribe((curr) => {
		console.log('CURR', curr);
		email = curr?.currentUser?.email;
		verified = curr?.currentUser?.emailVerified;

		if (verified === false) {
			window.location.href = '/';
		}
		
		if (email === 'testcarritoalan@gmail.com') {
			admin = true;
			console.log('admin', admin)
		} else {
			admin = false;
		}

	});
</script>

<div class="flex flex-col w-full">
	{#if $authStore.currentUser}
		<div class="flex flex-col w-full">
			<AppBar background=" bg-white">
				<svelte:fragment slot="lead">
					<img alt="Logotipo" src={Logo} width="30" />
				</svelte:fragment>

				<svelte:fragment>
					<div class="w-full flex flex-row items-center justify-center">
						<div class="gap-x-4">
						<a
							class="btn variant-filled-primary hover:bg-slate-300"
							data-sveltekit-preload-data="hover"
							href="/dashboard/productos">Explorar</a
						>
						<a
							class="btn variant-filled-primary hover:bg-slate-300"
							data-sveltekit-preload-data="hover"
							href="/dashboard/historial">Historial</a
						>
						<a
							class="btn variant-filled-primary hover:bg-slate-300"
							data-sveltekit-preload-data="hover"
							href="/dashboard/contactanos">Contactános</a
						>
						<a
							class="btn variant-filled-primary hover:bg-slate-300"
							data-sveltekit-preload-data="hover"
							href="/dashboard/configuracion">Configuración</a
						>
						</div>
					</div>
				</svelte:fragment>

				<svelte:fragment slot="trail">
					<!--- Admin en caso de que el perfil sea admin -->
					{#if admin === true}
						<a
							class="btn variant-filled-primary"
							data-sveltekit-preload-data="hover"
							href="/dashboard/administrador">Admin</a
						>
					{/if}

					<!--- Carrito -->
					<div>
						<button
							type="button"
							on:click={toggleCartInfo}
							class="btn btn-sm bg-transparent flex flex-col hover:bg-slate-300"
						>
							<Icon src={ShoppingCart} class="w-full h-6"></Icon>
							<span>Carrito</span>
						</button>

						{#if showCartInfo}
							<div
								class="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
								role="menu"
								aria-orientation="vertical"
								aria-labelledby="cart-menu-button"
								tabindex="-1"
							>
								<!-- Aquí mostrarás la información del carrito -->
								<div
									id="cartDetails"
									class="px-4 py-2 text-sm text-gray-700 flex flex-col justify-center items-center w-full overflow-y-auto"
								></div>
								<div class="flex justify-between items-center px-4 py-2 text-sm text-gray-700">
									<span id="totalAmount">Total:</span>
									<button class="btn variant-filled-primary text-white" on:click={purchase}>Comprar</button>
								</div>
									<a href="/dashboard/carrito">
										<button class="w-full btn-sm hover:bg-slate-300 rounded-md">Ver detalles</button>
									</a>
							</div>
						{/if}
					</div>

					<!--- Usuarios -->
					<div>
						<button
							type="button"
							on:click={toggleUserInfo}
							class="btn btn-sm bg-transparent flex flex-col hover:bg-slate-300"
						>
							<Icon src={User} class="w-full h-6"></Icon>
							<span>Usuario</span>
						</button>

						{#if showUserInfo}
							<div
								class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
								role="menu"
								aria-orientation="vertical"
								aria-labelledby="user-menu-button"
								tabindex="-1"
							>
								<p class="block px-4 py-2 text-sm text-gray-700">{email}</p>
								<button
									type="button"
									on:click={authHandlers.logout}
									class="btn bg-transparent hover:bg-slate-300 w-full rounded-none"
									>Cerrar Sesión
								</button>
							</div>
						{/if}
					</div>
				</svelte:fragment>
			</AppBar>
		</div>
	{:else}
		<div>Loading....</div>
	{/if}

	<slot />
</div>
