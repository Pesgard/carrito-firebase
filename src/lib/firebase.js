// Import the functions you need from the SDKs you need
import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, getDocs, getFirestore, query, where, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import Swal from "sweetalert2";

const firebaseConfig = {
    apiKey: "AIzaSyDvyv29HOhO1u_VJ11UTgidUghAq7n_vJU",
    authDomain: "e-commerce-53447.firebaseapp.com",
    projectId: "e-commerce-53447",
    storageBucket: "e-commerce-53447.appspot.com",
    messagingSenderId: "93754261648",
    appId: "1:93754261648:web:70966240f346735e5ed815"
};

// Initialize Firebase
let firebaseApp;

if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
} else {
    firebaseApp = getApp();
    deleteApp(firebaseApp);
    firebaseApp = initializeApp(firebaseConfig);
}

// Obtener Auth
export const auth = getAuth(firebaseApp)

//Inicializar Firestore
const db = getFirestore(firebaseApp);
const productosCollection = collection(db, 'productos');

// Función para cargar los productos activados desde Firestore y mostrarlos en la página
export async function cargarProductosActivados() {
    try {
        // Consulta solo los productos activados
        const querySnapshot = await getDocs(query(productosCollection, where('estado', '==', true)));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error al cargar los productos activados:", error);
        return [];
    }
}

// Función para cargar todos los productos desde Firestore
export async function cargarProductos() {
    try {
        // Consulta todos los productos
        const querySnapshot = await getDocs(productosCollection);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        return [];
    }
}


// Función para cargar los detalles de un producto por su nombre
export async function getProductDetailsByName(productName) {
    try {
        // Consulta el producto por su nombre
        const querySnapshot = await getDocs(query(collection(db, 'productos'), where('nombre', '==', productName)));

        // Verifica si se encontró un producto con ese nombre
        if (!querySnapshot.empty) {
            // Retorna los datos del primer documento encontrado (asumiendo que hay solo uno)
            const docData = querySnapshot.docs[0].data();
            return { id: querySnapshot.docs[0].id, ...docData };
        } else {
            console.log(`No se encontró ningún producto con el nombre "${productName}"`);
            return null;
        }
    } catch (error) {
        console.error("Error al cargar los detalles del producto:", error);
        return null;
    }
}

// Función para mostrar el carrito
export async function toggleCart(cartItems) {

    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const cartRef = doc(db, 'carts', userId);

        const cartSnapshot = await getDoc(cartRef);
        console.log(cartSnapshot);
        if (cartSnapshot.exists()) {
            const cartItemsData = cartSnapshot.data().products || [];
            cartItems = [...cartItemsData];
            console.log("cart items", cartItemsData);
            updateCart(cartItems);
        }
    }
}

export async function addToCart(productName, productQuantity, productImage, productTotal, productAvailable, productPrice) {
    try {
        // Obtener el usuario actual
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;

            // Referencia al documento del carrito del usuario
            const cartRef = doc(db, 'carts', userId);

            // Obtener el documento del carrito
            const cartDoc = await getDoc(cartRef);

            // Verificar si el documento del carrito existe y tiene datos
            if (cartDoc.exists() && cartDoc.data()) {
                const cartData = cartDoc.data();

                // Verificar si el carrito tiene un arreglo de productos
                if (cartData.products && Array.isArray(cartData.products)) {
                    // Verificar si el producto ya está en el carrito
                    const existingProductIndex = cartData.products.findIndex(product => product.name === productName);
                    if (existingProductIndex !== -1) {
                        // Si el producto ya existe, aumentar la cantidad
                        const updatedProducts = [...cartData.products];
                        let cartProducts = updatedProducts[existingProductIndex].quantity += productQuantity;
                        // Actualizar el carrito con la nueva cantidad
                        // Verificar si la suma de las nuevas cantidades es mayor que productAvailable
                        if (cartProducts > productAvailable) {
                            // Mostrar mensaje de error con SweetAlert
                            await Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'La nueva cantidad excede la disponibilidad del producto en el carrito',
                                confirmButtonText: 'OK'
                            });
                            return; // Salir de la función sin agregar el producto al carrito
                        } else {
                            await updateDoc(cartRef, { products: updatedProducts });
                        }

                    } else {
                        // Si el producto no existe, agregarlo al carrito
                        await updateDoc(cartRef, {
                            products: arrayUnion({ name: productName, quantity: productQuantity, imagen: productImage, price: productPrice })
                        });
                    }
                } else {
                    // Si no hay un arreglo de productos, crear uno nuevo con el producto
                    await updateDoc(cartRef, {
                        products: [{ name: productName, quantity: productQuantity, imagen: productImage, price: productPrice }]
                    });
                }
            } else {
                // Si el documento del carrito no existe, crear uno nuevo con el producto
                await setDoc(cartRef, {
                    products: [{ name: productName, quantity: productQuantity, imagen: productImage, price: productTotal }]
                });
            }

            console.log('Producto añadido al carrito del usuario');
        } else {
            console.log('No se ha iniciado sesión');
        }
    } catch (error) {
        console.error('Error al agregar el producto al carrito:', error);
    }
}

// Función para eliminar un producto del carrito
export async function removeItemFromCart(event) {
    try {
        const index = event.target.dataset.index;
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            const cartRef = doc(db, 'carts', userId);
            const cartDoc = await getDoc(cartRef);
            if (cartDoc.exists()) {
                const cartData = cartDoc.data();
                if (cartData.products && Array.isArray(cartData.products)) {
                    // Eliminar el producto del carrito
                    const updatedProducts = cartData.products.filter((_, i) => i !== parseInt(index));
                    // Mostrar notificación de éxito con SweetAlert2
                    await Swal.fire({
                        icon: 'success',
                        title: 'Producto eliminado',
                        text: 'El producto se ha eliminado correctamente del carrito',
                        confirmButtonText: 'OK'
                    });
                    await updateDoc(cartRef, { products: updatedProducts });
                }
            }
        }
    } catch (error) {
        console.error('Error al eliminar el producto del carrito:', error);
        // Mostrar notificación de error con SweetAlert2
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al eliminar el producto del carrito. Por favor, inténtalo de nuevo más tarde.',
            confirmButtonText: 'OK'
        });
    }
}

// Función para actualizar el carrito en la interfaz de usuario
export function updateCart(cartItems) {
    const cartDetails = document.getElementById('cartDetails');
    if (!cartDetails) return;

    cartDetails.innerHTML = '';
    let totalAmount = 0;

    cartItems.forEach((item, index) => {
        totalAmount += item.price * item.quantity;
        cartDetails.innerHTML += `
        <div class="flex flex-col items-center justify-center w-full max-h-80">
        <div>
            <img src="${item.imagen}" alt="${item.name}" class="w-8 h-8">
            <p>${item.name} - $${item.price} MXN x ${item.quantity}</p>
            <button class="btn variant-ringed-primary btn-sm removeButton" data-index="${index}">Eliminar Producto</button>
            <hr/>
        </div>
    </div>
        `;
    });

    const totalAmountElement = document.getElementById('totalAmount');
    if (totalAmountElement) {
        totalAmountElement.innerText = `Total: $${totalAmount.toFixed(2)} MXN`;

        // Agregar event listener para los botones de eliminar
        const removeButtons = document.querySelectorAll('.removeButton');
        removeButtons.forEach(button => {
            button.addEventListener('click', removeItemFromCart); // Llama a la función removeItemFromCart
        });
    }
}

// Función para crear un usuario y su carrito en Firestore
export async function createUser(email, password, firstName, lastName) {
    try {
        // Crea el usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guarda la información del usuario en Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            firstName: firstName,
            lastName: lastName
        });

        // Crea una colección de carrito para el usuario con el mismo ID
        await setDoc(doc(db, 'carts', user.uid), {
            products: [] // Inicialmente el carrito estará vacío, pero puedes almacenar productos aquí
        });

        // Muestra un mensaje de éxito con SweetAlert2
        await Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            text: 'Usuario registrado exitosamente',
            confirmButtonText: 'OK'
        });

        // Redirecciona al usuario a la página de inicio
        window.location.href = '/inicio.html';
    } catch (error) {
        // Muestra un mensaje de error con SweetAlert2
        await Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Error al registrar el usuario: ' + error.message,
            confirmButtonText: 'OK'
        });
    }
}

/// Función para crear una compra
export async function createPurchase() {
    try {
        // Obtener el usuario actual
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;

            // Referencia al documento del carrito del usuario
            const cartRef = doc(db, 'carts', userId);

            // Obtener el documento del carrito
            const cartDoc = await getDoc(cartRef);

            // Verificar si el documento del carrito existe y tiene datos
            if (cartDoc.exists() && cartDoc.data()) {
                const cartData = cartDoc.data();

                // Verificar si el carrito tiene productos
                if (cartData.products && Array.isArray(cartData.products) && cartData.products.length > 0) {
                    // Crear un nuevo documento para la compra en la colección "compras"
                    const purchaseDocRef = doc(collection(db, 'compras'));

                    // Obtener la fecha actual
                    const currentDate = new Date();

                    // Crear un objeto con la información de la compra
                    const purchaseData = {
                        userId: userId,
                        products: cartData.products,
                        timestamp: currentDate
                    };

                    // Guardar la información de la compra en Firestore
                    await setDoc(purchaseDocRef, purchaseData);

                    // Actualizar la cantidad de productos disponibles en la colección "productos"
                    await Promise.all(cartData.products.map(async (product) => {
                        try {
                            // Buscar el ID del documento del producto por su nombre
                            const productQuerySnapshot = await getDocs(query(collection(db, 'productos'), where('nombre', '==', product.name)));
                            if (!productQuerySnapshot.empty) {
                                // Si se encuentra un producto con ese nombre
                                const productDocId = productQuerySnapshot.docs[0].id; // Obtener el ID del documento
                                const productRef = doc(db, 'productos', productDocId); // Obtener referencia al documento del producto
                                const productDoc = await getDoc(productRef); // Obtener el documento del producto
                                if (productDoc.exists()) {
                                    const productData = productDoc.data();
                                    const updatedQuantity = productData.cantidad - product.quantity; // Reducir la cantidad disponible
                                    await updateDoc(productRef, { cantidad: updatedQuantity }); // Actualizar la cantidad en Firestore
                                }
                            }
                        } catch (error) {
                            console.error('Error al actualizar la cantidad de productos disponibles:', error);
                        }
                    }));

                    // Limpiar el carrito del usuario después de la compra
                    await updateDoc(cartRef, { products: [] });

                    // Mostrar notificación de éxito con SweetAlert2
                    await Swal.fire({
                        icon: 'success',
                        title: 'Compra realizada',
                        text: 'La compra se ha realizado correctamente',
                        confirmButtonText: 'OK'
                    });

                } else {
                    // Mostrar mensaje de error si el carrito está vacío
                    await Swal.fire({
                        icon: 'error',
                        title: 'Carrito vacío',
                        text: 'No hay productos en el carrito para realizar la compra',
                        confirmButtonText: 'OK'
                    });
                }
            } else {
                // Mostrar mensaje de error si el carrito no existe o está vacío
                await Swal.fire({
                    icon: 'error',
                    title: 'Carrito no encontrado',
                    text: 'No se encontró ningún producto en el carrito',
                    confirmButtonText: 'OK'
                });
            }
        } else {
            // Mostrar mensaje de error si no hay usuario autenticado
            await Swal.fire({
                icon: 'error',
                title: 'Usuario no autenticado',
                text: 'Por favor, inicia sesión para realizar la compra',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        console.error('Error al crear la compra:', error);
        // Mostrar notificación de error con SweetAlert2
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al realizar la compra. Por favor, inténtalo de nuevo más tarde.',
            confirmButtonText: 'OK'
        });
    }
}

// Función para activar/desactivar un producto
export async function toggleProductStatus(productId, newStatus) {
    try {
        const productRef = doc(db, 'productos', productId);
        await updateDoc(productRef, { estado: newStatus });
        console.log(`Producto ${productId} ${newStatus ? 'activado' : 'desactivado'}`);
        return true;
    } catch (error) {
        console.error('Error al cambiar el estado del producto:', error);
        return false;
    }
}

// Función para modificar el precio de un producto
export async function updateProductPrice(productId, newPrice) {
    try {
        const productRef = doc(db, 'productos', productId);
        await updateDoc(productRef, { precio: newPrice });
        console.log(`Precio del producto ${productId} actualizado a ${newPrice}`);
        return true;
    } catch (error) {
        console.error('Error al modificar el precio del producto:', error);
        return false;
    }
}

// Función para modificar la cantidad disponible de un producto
export async function updateProductQuantity(productId, newQuantity) {
    try {
        const productRef = doc(db, 'productos', productId);
        await updateDoc(productRef, { cantidad: newQuantity });
        console.log(`Cantidad disponible del producto ${productId} actualizada a ${newQuantity}`);
        return true;
    } catch (error) {
        console.error('Error al modificar la cantidad del producto:', error);
        return false;
    }
}