<script lang="ts">
	import { enhance } from '$app/forms';

	// Types
	import type { SubmitFunction } from '@sveltejs/kit';

	// Components & Utilities
	import { AppBar, LightSwitch } from '@skeletonlabs/skeleton';

	// Stores
    import { storeTheme } from '../../../lib/store';


	const themes = [
		{ type: 'skeleton', name: 'Tema Verde', icon: '🦴'},
		{ type: 'wintry', name: 'Tema Azul', icon: '🌨️' },
		{ type: 'modern', name: 'Tema Rosa', icon: '🤖' },
		{ type: 'rocket', name: 'Tema Gris', icon: '🚀' },
		{ type: 'seafoam', name: 'Tema Azul claro', icon: '🧜‍♀️' },
		{ type: 'vintage', name: 'Tema Naranja', icon: '📺' },
		{ type: 'sahara', name: 'Tema Rojo claro', icon: '🏜️' },
		{ type: 'hamlindigo', name: 'Tema Azul rey', icon: '👔' },
		{ type: 'gold-nouveau', name: 'Tema amarillo', icon: '💫' },
		{ type: 'crimson', name: 'Tema Rojo Fuerte', icon: '⭕' }
	];

	const setTheme: SubmitFunction = ({ formData }) => {
		const theme = formData.get('theme')?.toString();

		if (theme) {
			document.body.setAttribute('data-theme', theme);
			$storeTheme = theme;
		}
	};
</script>

<!-- NOTE: using stopPropagation to override Chrome for Windows search shortcut -->

<AppBar shadow="shadow-2xl" slotTrail="!space-x-2">
	<svelte:fragment slot="trail">
		<!-- Theme -->
		<div>
			<!-- popup -->
			<div class="card p-4 w-60 shadow-xl">
				<div class="space-y-4">
					<section class="flex justify-between items-center">
						<h6 class="h6">Modo</h6>
						<LightSwitch />
					</section>
					<hr />
					<nav class="list-nav p-4 -m-4 max-h-64 lg:max-h-[500px] overflow-y-auto">
						<form action="/?/setTheme" method="POST" use:enhance={setTheme}>
							<ul>
								<!-- , badge -->
								{#each themes as { icon, name, type }}
									<li>
										<button
											class="option w-full h-full"
											type="submit"
											name="theme"
											value={type}
											class:bg-primary-active-token={$storeTheme === type}
										>
											<span>{icon}</span>
											<span class="flex-auto text-left">{name}</span>
											<!-- {#if badge}<span class="badge variant-filled-secondary">{badge}</span>{/if} -->
										</button>
									</li>
								{/each}
							</ul>
						</form>
					</nav>
					<hr />
				</div>
				<!-- <div class="arrow bg-surface-100-800-token" /> -->
			</div>
		</div>
	</svelte:fragment>
</AppBar>
