<script>
    import { onMount } from 'svelte';
    import { doc, getDoc } from "firebase/firestore";
    import { auth } from '../../../lib/firebase'
    import { db } from '../../../lib/firebase'

    const name = 'detalles';
    let cartItems = [];
    let totalAmount = 0;

    async function mostrarCarrito(cartItems, containerName) {
        const cartDetails = document.getElementById(`${containerName}`);
        console.log(cartDetails);
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            const cartRef = doc(db, 'carts', userId);

            const cartSnapshot = await getDoc(cartRef);
            console.log(cartSnapshot);
            if (cartSnapshot.exists()) {
                const cartItemsData = cartSnapshot.data().products || [];
                cartItems = [...cartItemsData];
            }
        }

        cartItems.forEach((item, index) => {
            totalAmount += item.price * item.quantity;
            cartDetails.innerHTML += `
            <div class="flex items-center justify-center">
                <div>
                    <img src="${item.imagen}" alt="${item.name}" class="w-64 h-64 inline-block">
                    <span class="inline-block">${item.name} - $${item.price} MXN x ${item.quantity}</span>
                    <button class="block ml-72 btn variant-ringed-primary btn-sm removeButton" data-index="${index}">Eliminar Producto</button>
                    <hr/>
                </div>
            </div>
            `;
    });
    };

    onMount(() => {
        mostrarCarrito(cartItems, name);
    });    
</script>

<div id="detalles"></div>