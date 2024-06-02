<script>
    import { onMount } from 'svelte';
    import { doc, getDoc } from "firebase/firestore";
    import { auth } from '../../../lib/firebase'
    import { db } from '../../../lib/firebase'
    import { createPurchase } from '../../../lib/firebase';
    import { actualizarCarrito } from '../../../lib/firebase';

    const name = 'detalles';
    let cartItems = [];

    async function purchase(){
		await createPurchase();
	}

    async function mostrarCarrito(cartItems, containerName) {
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            const cartRef = doc(db, 'carts', userId);

            const cartSnapshot = await getDoc(cartRef);
            if (cartSnapshot.exists()) {
                const cartItemsData = cartSnapshot.data().products || [];
                cartItems = [...cartItemsData];
            }
        }

        actualizarCarrito(cartItems, containerName);
    };

    onMount(() => {
        mostrarCarrito(cartItems, name);
    });    
</script>

<div id="detalles">
    <div class="flex flex-col items-center"><h1 class="text-4xl">Detalles de la compra</h1></div>
</div>
<div class="flex flex-col items-center">
    <div class="flex justify-between items-center px-4 py-2 text-sm text-gray-700 w-1/2">
        <span id="total" class="text-xl"></span>
        <button class="btn variant-filled-primary text-white" on:click={purchase}>Comprar</button>
    </div>
</div>