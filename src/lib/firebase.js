// Import the functions you need from the SDKs you need
import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, } from 'firebase/auth'
import { collection, getDocs, getFirestore, query, where, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
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
export const db = getFirestore(firebaseApp);
const productosCollection = collection(db, 'productos');

// Inicializar Firebase Storage
const storage = getStorage(firebaseApp);

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

//funcion para cargar los detalles de un producto por su id
export async function getProductDetailsById(productId) {
    try {
        // Consulta el producto por su ID
        const docRef = doc(db, 'productos', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log(`No se encontró ningún producto con el ID "${productId}"`);
            return null;
        }
    } catch (error) {
        console.error("Error al cargar los detalles del producto:", error);
        return null;
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
export async function toggleCart(cartItems, nombreContenedor) {

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
            updateCart(cartItems, nombreContenedor);
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
export function updateCart(cartItems, nombreContenedor) {
    const cartDetails = document.getElementById(`${nombreContenedor}`);
    console.log({nombreContenedor});
    console.log(cartDetails);
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

/*export function updateCart(cartItems, containerElement) {
    console.log(containerElement);
    if (!containerElement) return;
    containerElement.innerHTML = '';
    let totalAmount = 0;

    cartItems.forEach((item, index) => {
        totalAmount += item.price * item.quantity;
        containerElement.innerHTML += `
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
        const removeButtons = containerElement.querySelectorAll('.removeButton');
        removeButtons.forEach(button => {
            button.addEventListener('click', removeItemFromCart); // Llama a la función removeItemFromCart
        });
    }
}*/

// Ejemplo de uso:
// updateCart(cartItems, document.getElementById('cartDetails'));




// Función para crear un usuario y su carrito en Firestore
export async function createUser(email, password, firstName, lastName) {
    try {
        // Crea el usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        // Enviar correo de verificación
        await sendEmailVerification(userCredential.user);

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
            text: 'Se ha enviado un correo de verifiacion a tu correo electronico. Por favor, verifica tu cuenta para iniciar sesión.',
            confirmButtonText: 'OK'
        });

        window.location.href = '/'

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

                    const totalRevenue = cartData.products.reduce((acc, product) => acc + (product.price * product.quantity), 0);


                    // Crear un nuevo documento para la compra en la colección "compras"
                    const purchaseDocRef = doc(collection(db, 'compras'));

                    // Obtener la fecha actual
                    const currentDate = new Date();

                    // Crear un objeto con la información de la compra
                    const purchaseData = {
                        userId: userId,
                        products: cartData.products,
                        timestamp: currentDate,
                        totalRevenue: totalRevenue

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

//funcion para modificar la imagen de un producto
export async function updateProductImage(productId, newImage) {
    try {
        const productRef = doc(db, 'productos', productId);
        const imageUrl = await uploadImageAndGetUrl(newImage, productId);
        await updateDoc(productRef, { imagen: imageUrl });
        console.log(`Imagen del producto ${productId} actualizada`);
        return true;
    } catch (error) {
        console.error('Error al modificar la imagen del producto:', error);
        return false;
    }
}

//Agregar Productos:

// Función para agregar un nuevo producto
export async function addProduct(producto) {
    try {
        // Generar un nuevo ID para el producto
        const id = await generateProductId();

        // Guardar la imagen en Firebase Storage y obtener la URL
        const imageUrl = await uploadImageAndGetUrl(producto.imagen, id);

        // Guardar el producto en Firestore
        await setDoc(doc(db, 'productos', id), { // Cambiar doc por setDoc y agregar id al path
            id,
            nombre: producto.nombre,
            cantidad: producto.cantidad,
            precio: producto.precio,
            imagen: imageUrl,
            estado: producto.estado
        });

        console.log('Producto agregado exitosamente.');
        return id; // Devuelve el ID del producto creado
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        throw new Error('Error al agregar el producto. Por favor, inténtalo de nuevo más tarde.');
    }
}

async function generateProductId() {
    try {
        const productsRef = collection(db, 'productos'); // Cambiar doc por collection
        const snapshot = await getDocs(productsRef); // Cambiar doc por collection y get por getDocs
        const numProducts = snapshot.docs.length;
        return 'producto' + (numProducts + 1);
    } catch (error) {
        console.error('Error al generar el ID del producto:', error);
        throw new Error('Error al generar el ID del producto. Por favor, inténtalo de nuevo más tarde.');
    }
}

// Función para subir la imagen a Firebase Storage y obtener la URL
async function uploadImageAndGetUrl(imageFile, productId) {
    try {
        const storageRef = ref(storage, `product_images/${productId}_producto.png`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        // Mostrar la barra de carga
        Swal.fire({
            title: 'Subiendo imagen...',
            html: '<div class="progress" style="margin-top: 20px;"><div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div></div>',
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false
        });

        // Actualizar la barra de carga según el progreso
        uploadTask.on('state_changed', snapshot => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            const progressBar = Swal.getHtmlContainer().querySelector('.progress-bar');
            progressBar.style.width = progress + '%';
            progressBar.setAttribute('aria-valuenow', progress);
            progressBar.textContent = Math.round(progress) + '%';
        });

        // Esperar a que se complete la carga
        await uploadTask;

        // Ocultar la barra de carga
        Swal.close();

        // Obtener la URL de descarga de la imagen
        const imageUrl = await getDownloadURL(storageRef);
        return imageUrl;
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        throw new Error('Error al subir la imagen. Por favor, inténtalo de nuevo más tarde.');
    }
}

//Graficas ==================

//Obtener ventas de la semana
export async function getSalesByDateRange(startDate, endDate) {
    try {
        const salesRef = collection(db, 'compras');
        const q = query(salesRef, where('timestamp', '>=', startDate), where('timestamp', '<=', endDate));
        const snapshot = await getDocs(q);

        const sales = [];
        snapshot.forEach(doc => {
            const saleData = doc.data();
            sales.push({
                id: doc.id,
                timestamp: saleData.timestamp,
                userId: saleData.userId,
                products: saleData.Products
            });
        });

        return sales;
    } catch (error) {
        console.error('Error al obtener las ventas por fecha:', error);
        throw new Error('Error al obtener las ventas por fecha. Por favor, inténtalo de nuevo más tarde.');
    }
}

// Función para obtener los productos vendidos por cantidad
export async function getProductsSoldByQuantity() {
    try {
        const salesRef = collection(db, 'compras');
        const snapshot = await getDocs(salesRef);

        const productsSold = new Map();

        snapshot.forEach(doc => {
            const saleData = doc.data();
            saleData.products.forEach(product => {
                const { name, quantity } = product;
                if (productsSold.has(name)) {
                    productsSold.set(name, productsSold.get(name) + quantity);
                } else {
                    productsSold.set(name, quantity);
                }
            });
        });

        // Convertir el mapa en un array de objetos para facilitar su manejo
        const productsSoldArray = Array.from(productsSold, ([name, quantity]) => ({ name, quantity }));

        // Ordenar los productos por cantidad vendida (de mayor a menor)
        productsSoldArray.sort((a, b) => b.quantity - a.quantity);

        return productsSoldArray;
    } catch (error) {
        console.error('Error al obtener los productos vendidos por cantidad:', error);
        throw new Error('Error al obtener los productos vendidos por cantidad. Por favor, inténtalo de nuevo más tarde.');
    }
}


// Función para obtener los productos que generan más ingresos
export async function getProductsByRevenue() {
    try {
        const salesRef = collection(db, 'compras');
        const snapshot = await getDocs(salesRef);

        const productsRevenue = new Map();

        snapshot.forEach(doc => {
            const saleData = doc.data();
            saleData.products.forEach(product => {
                const { name, quantity, price } = product;
                const totalRevenue = quantity * price;
                if (productsRevenue.has(name)) {
                    productsRevenue.set(name, productsRevenue.get(name) + totalRevenue);
                } else {
                    productsRevenue.set(name, totalRevenue);
                }
            });
        });

        // Convertir el mapa en un array de objetos para facilitar su manejo
        const productsRevenueArray = Array.from(productsRevenue, ([name, revenue]) => ({ name, revenue }));

        // Ordenar los productos por ingresos totales (de mayor a menor)
        productsRevenueArray.sort((a, b) => b.revenue - a.revenue);

        return productsRevenueArray;
    } catch (error) {
        console.error('Error al obtener los productos por ingresos:', error);
        throw new Error('Error al obtener los productos por ingresos. Por favor, inténtalo de nuevo más tarde.');
    }
}


// Función para obtener los clientes que compran más productos
export async function getTopBuyingClients() {
    try {
        const salesRef = collection(db, 'compras');
        const snapshot = await getDocs(salesRef);

        // Objeto para almacenar la información del cliente
        const clientData = {};

        // Iterar sobre las compras y agrupar por cliente
        snapshot.forEach(async doc => {
            const { userId, products } = doc.data();
            if (!clientData[userId]) {
                clientData[userId] = { userId, totalProducts: 0 };
            }
            // Sumar la cantidad de productos comprados por cada cliente
            clientData[userId].totalProducts += products.length;
        });

        // Convertir el objeto de datos del cliente a un array
        const topClients = Object.values(clientData);

        // Ordenar los clientes por la cantidad de productos comprados (de mayor a menor)
        topClients.sort((a, b) => b.totalProducts - a.totalProducts);

        // Obtener información detallada de los usuarios basada en sus UID
        const clientsInfo = await getUsersInfo(topClients);

        // Combinar la información de cantidad de productos comprados con la información de los usuarios
        const mergedData = topClients.map(client => {
            const userInfo = clientsInfo.find(info => info.userId === client.userId);
            return {
                ...client,
                ...userInfo
            };
        });

        return mergedData;
    } catch (error) {
        console.error('Error al obtener los clientes que compran más productos:', error);
        throw new Error('Error al obtener los clientes que compran más productos. Por favor, inténtalo de nuevo más tarde.');
    }
}

// Función para obtener la información de los usuarios basada en sus UID
async function getUsersInfo(userClient) {
    try {
        const usersInfo = [];

        // Recorre cada cliente en topClients
        for (const client of userClient) {
            const { userId } = client;

            // Obtiene la información del usuario con el UID actual
            const userRef = doc(db, 'users', userId);
            const userSnapshot = await getDoc(userRef);

            // Si el usuario existe, agrega su información al array usersInfo
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                usersInfo.push({
                    userId,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                });
            } else {
                console.error(`No se encontró información para el usuario con UID: ${userId}`);
            }
        }

        return usersInfo;
    } catch (error) {
        console.error('Error al obtener la información de los usuarios:', error);
        throw new Error('Error al obtener la información de los usuarios. Por favor, inténtalo de nuevo más tarde.');
    }
}

// Función para obtener los clientes que generan más ingresos
export async function getTopRevenueClients() {
    try {
        const salesRef = collection(db, 'compras');
        const snapshot = await getDocs(salesRef);

        // Objeto para almacenar la información del cliente
        const clientData = {};

        // Iterar sobre las compras y agrupar por cliente
        snapshot.forEach(async doc => {
            const { userId, totalRevenue } = doc.data();
            if (!clientData[userId]) {
                clientData[userId] = { userId, totalRevenue: 0 };
            }
            // Sumar el total de ingresos generados por cada cliente
            clientData[userId].totalRevenue += totalRevenue;
        });

        // Convertir el objeto de datos del cliente a un array
        const topClients = Object.values(clientData);

        // Ordenar los clientes por el total de ingresos generados (de mayor a menor)
        topClients.sort((a, b) => b.totalRevenue - a.totalRevenue);

        // Obtener información detallada de los usuarios basada en sus UID
        const clientsInfo = await getUsersInfo(topClients);

        // Combinar la información de total de ingresos generados con la información de los usuarios
        const mergedData = topClients.map(client => {
            const userInfo = clientsInfo.find(info => info.userId === client.userId);
            return {
                ...client,
                ...userInfo
            };
        });

        return mergedData;
    } catch (error) {
        console.error('Error al obtener los clientes que generan más ingresos:', error);
        throw new Error('Error al obtener los clientes que generan más ingresos. Por favor, inténtalo de nuevo más tarde.');
    }
}


// Función para obtener el historial de compras de un usuario
export async function getUserPurchaseHistory(userId) {
    try {
        const purchaseRef = collection(db, 'compras');
        const querySnapshot = await getDocs(query(purchaseRef, where('userId', '==', userId)));
        const purchases = [];

        querySnapshot.forEach(doc => {
            purchases.push({ id: doc.id, ...doc.data() });
        });

        console.log("purchases", purchases)

        return purchases;
    } catch (error) {
        console.error('Error al obtener el historial de compras del usuario:', error);
        throw new Error('Error al obtener el historial de compras del usuario. Por favor, inténtalo de nuevo más tarde.');
    }
}

// Funcion para crear una conversacion en firebase dentro de la coleccion 'mensajes', donde el id de la conversacion es el id del usuario que la creo, y dentro del documento llevara el campo leido: false y tambien tendra un map donde dentro se guardaran los textos
export async function createConversation(userId, userEmail) {
    try {
        const conversationRef = doc(db, 'mensajes', userId);
        const conversationSnapshot = await getDoc(conversationRef);

        if (!conversationSnapshot.exists()) {
            const conversationData = {
                correo: userEmail,
                leido: false,
                textos: {}
            };
            await setDoc(conversationRef, conversationData);
        }
    } catch (error) {
        console.error('Error al crear la conversación:', error);
    }
}

// Funcion para obtener los mensajes de una conversacion en firebase
export async function getConversationMessages(userId) {
    try {
        const conversationRef = doc(db, 'mensajes', userId);
        const conversationSnapshot = await getDoc(conversationRef);
        const conversationData = conversationSnapshot.data();

        if (conversationData) {
            return conversationData.textos;
        } else {
            return {};
        }
    } catch (error) {
        console.error('Error al obtener los mensajes de la conversación:', error);
        throw new Error('Error al obtener los mensajes de la conversación. Por favor, inténtalo de nuevo más tarde.');
    }
}

// Funcion para enviar un mensaje a una conversacion en firebase
export async function sendMessageToConversation(userId, message) {
    try {
        const conversationRef = doc(db, 'mensajes', userId);
        const conversationSnapshot = await getDoc(conversationRef);
        const conversationData = conversationSnapshot.data();

        if (conversationData) {
            const newTexts = {
                ...conversationData.textos,
                [Date.now()]: {
                    mensaje: message,
                    date: new Date().toISOString()
                }
            };
            await updateDoc(conversationRef, { textos: newTexts });
        }
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        throw new Error('Error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.');
    }
}

//Funcion para mostrar todas las conversaciones
export async function getAllConversations() {
    try {
        const conversationsRef = collection(db, 'mensajes');
        const snapshot = await getDocs(conversationsRef);
        const conversations = [];

        snapshot.forEach(doc => {
            const conversation = {
                id: doc.id,
                data: doc.data()
            };
            conversations.push(conversation);
        });

        return conversations;
    } catch (error) {
        console.error('Error al obtener todas las conversaciones:', error);
        throw new Error('Error al obtener todas las conversaciones. Por favor, inténtalo de nuevo más tarde.');
    }
}