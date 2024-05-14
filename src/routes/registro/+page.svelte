<script>
	import { AppBar } from '@skeletonlabs/skeleton';
	import Logo from '$lib/logo.jpg';
	import { ArrowRightEndOnRectangle, Icon } from 'svelte-hero-icons';

	import { authHandlers, authStore } from '../../stores/authStore';

    let firstName = '';
    let lastName = '';
	let email = '';
	let password = '';

	async function handleSubmit() {
		try {
			await authHandlers.signup(email, password, firstName, lastName);
		} catch (err) {
			console.log(err);
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
			<p class="text-md">Tienes cuenta?</p>
			<a
				href="/"
				class="btn variant-ringed-surface rounded-md btn-sm"
				data-sveltekit-preload-data="hover">Iniciar Sesion</a
			>
		</svelte:fragment>
	</AppBar>

	<div class="flex flex-col w-full items-center justify-center">
		<h2 class="text-2xl">Regístrate</h2>
		<p class="mt-2">INGRESA TUS DATOS</p>

		<div class="flex flex-col justify-center items-center">
			<div class="flex flex-cols-2">
				<input
					class="input bg-transparent rounded-none mt-4 mr-1"
					type="text"
					placeholder="Nombres"
					bind:value={firstName}
				/>

                <input
					class="input bg-transparent rounded-none mt-4 ml-1"
					type="text"
					placeholder="Apellidos"
					bind:value={lastName}
				/>
			</div>

			<input
				class="input bg-transparent rounded-none mt-4 mb-4"
				type="email"
				placeholder="Correo Electronico"
				bind:value={email}
			/>

            <input
				class="input bg-transparent rounded-none mb-4"
				type="password"
				placeholder="Password"
				bind:value={password}
			/>

			<button
				type="button"
				class="btn variant-filled-primary w-full text-white rounded-md"
				on:click={handleSubmit}
			>
				<span>Registrar</span>
				<Icon src={ArrowRightEndOnRectangle} class="h-4 w-fit"></Icon>
			</button>
		</div>
	</div>
</div>
