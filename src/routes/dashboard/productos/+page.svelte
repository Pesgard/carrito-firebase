<script>
	import { onMount } from 'svelte';
	import { cargarProductosActivados } from '$lib/firebase';

	let productos = [];

	onMount(async () => {
		productos = await cargarProductosActivados();
	});
</script>

<!-- Main.svelte -->
<section class="bg-white" >
    <div class="text-center mb-10 mt-10">
        <h2 class="font-medium text-2xl text-blue-900 mb-2">Productos Destacados</h2>
        <p class="text-sm text-gray-600">Encuentra los mejores productos aquí</p>
    </div>
    <section class="flex flex-row items-center justify-center">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each productos as producto (producto.id)}
                <div class="w-full h-full m-4 mt-10">
                    <a href={`productos/${producto.id}`} class="block card card-hover">
                        <img class="object-cover w-full h-40 md:h-60 lg:h-72" src={producto.imagen} alt={producto.nombre}/>
                        <div class="bg-white flex flex-col justify-between p-4">
                            <div>
                                <div class="font-medium text-base">{producto.nombre}</div>
                                <div class="font-normal text-lg text-green-600 text-right">{producto.precio} MXN</div>
                            </div>
                        </div>
                    </a>
                </div>
            {/each}
        </div>
    </section>
</section>
