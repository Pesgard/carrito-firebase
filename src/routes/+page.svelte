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

			if ($authStore.currentUser) {
				window.location.href = '/dashboard/productos';
			}
		} catch (err) {
			console.log(err);
			let errorMessage = '';
			if (err.code === 'auth/invalid-email' || err.code === 'auth/wrong-password') {
				errorMessage = 'Credenciales Invalidas intente nuevamente';
			} else if (err.code === 'auth/user-not-found') {
				errorMessage = 'No existe una cuenta con este correo electrónico';
			} else if (err.code === 'auth/user-disabled') {
				errorMessage = 'Esta cuenta ha sido deshabilitada';
			} else if (err.message === 'Email not verified') {
				errorMessage =
					'El correo electrónico no ha sido verificado, se te a enviado un correo de verificacion a tu correo electronico';
				await authHandlers.verifyEmail();
			} else {
				errorMessage = 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo';
			}

			// Mostrar notificación de error con SweetAlert2
			await Swal.fire({
				icon: 'error',
				title: 'Error al iniciar sesion',
				text: errorMessage,
				confirmButtonText: 'OK'
			});
		}
	}
</script>

<div class="bg-gray-200 w-screen h-screen">
	<AppBar background="bg-white">
		<svelte:fragment slot="lead">
			<img alt="Logotipo" src={Logo} width="30" />
		</svelte:fragment>
		<svelte:fragment slot="trail">
			<p class="text-md">¿No tienes cuenta?</p>
			<a
				href="/registro"
				class="btn variant-filled-primary text-white rounded-md btn-sm"
				data-sveltekit-preload-data="hover">Regístrate</a
			>
		</svelte:fragment>
	</AppBar>

	<div class="flex flex-col w-full items-center justify-center">
		<div class="flex flex-col justify-center items-center">
			<h2 class="text-6xl mt-10">Iniciar Sesión</h2>
			<p class="mt-2">Ingresa los datos de tu cuenta para acceder</p>

			<input
				class="input bg-transparent rounded-none mt-4"
				type="email"
				placeholder="Correo Electrónico"
				required
				bind:value={email}
			/>
			<input
				class="input bg-transparent rounded-none mt-4 mb-4"
				type="password"
				placeholder="Contraseña"
				required
				bind:value={clave}
			/>
			<button
				type="button"
				class="btn variant-filled-primary w-full text-white rounded-md"
				on:click={handleSubmit}
			>
				<span>Iniciar Sesión</span>
				<Icon src={ArrowRightEndOnRectangle} class="h-4 w-fit" />
			</button>
		</div>
	</div>
</div>
