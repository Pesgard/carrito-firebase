<script>
	import { AppBar } from '@skeletonlabs/skeleton';
	import Logo from '$lib/logo.jpg';
	import { ArrowRightEndOnRectangle, Icon } from 'svelte-hero-icons';
	import Swal from 'sweetalert2';

	import { authHandlers, authStore } from '../stores/authStore';

	let email = '';
	let clave = '';

	async function handleSubmit() {
		try {
			await authHandlers.login(email, clave);
			await Swal.fire({
				icon: 'success',
				title: 'Inicio Sesion',
				text: 'Se a iniciado sesion correctamente',
				confirmButtonText: 'OK'
			});
		} catch (err) {
			console.log(err);
			// Mostrar notificación de error con SweetAlert2
			await Swal.fire({
				icon: 'error',
				title: 'Error al iniciar sesion',
				text: 'Credenciales Invalidas intente nuevamente',
				confirmButtonText: 'OK'
			});
		}

		if ($authStore.currentUser) {
			window.location.href = '/dashboard/productos';
		}
	}
</script>

<div class="bg-white w-screen h-screen">
	<AppBar background="bg-white">
		<svelte:fragment slot="lead">
			<img alt="Logotipo" src={Logo} width="30" />
		</svelte:fragment>
		<svelte:fragment slot="trail">
			<p class="text-md">No tienes cuenta?</p>
			<a
				href="/registro"
				class="btn variant-ringed-surface rounded-md btn-sm"
				data-sveltekit-preload-data="hover">Registrate</a
			>
		</svelte:fragment>
	</AppBar>

	<div class="flex flex-col w-full items-center justify-center">
		<div class="flex flex-col justify-center items-center">
			<h2 class="text-2xl">Iniciar Sesion</h2>
			<p class="mt-2">INGRESA LOS DATOS DE TU CUENTA PARA INGRESAR</p>

			<input
				class="input bg-transparent rounded-none mt-4"
				type="email"
				placeholder="Correo Electronico"
				required
				bind:value={email}
			/>
			<input
				class="input bg-transparent rounded-none mt-4 mb-4"
				type="password"
				placeholder="password"
				required
				bind:value={clave}
			/>
			<button
				type="button"
				class="btn variant-filled-primary w-full text-white rounded-md"
				on:click={handleSubmit}
			>
				<span>Iniciar Sesion</span>
				<Icon src={ArrowRightEndOnRectangle} class="h-4 w-fit" />
			</button>
		</div>
	</div>
</div>
