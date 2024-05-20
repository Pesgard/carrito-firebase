<script>
	import { onMount } from 'svelte';
	import {
		createConversation,
		getConversationMessages,
		sendMessageToConversation
	} from '$lib/firebase';
    import { authStore } from '../../../stores/authStore';

	let userId;
    let userEmail;

    onMount(() => {
        authStore.subscribe((curr) => {
            if (!curr.isLoading) {
                userId = curr?.currentUser?.uid;
                userEmail = curr?.currentUser?.email;
                console.log('usuario ', userId);
                loadMessages();
            }
        });
    });

    let newMessage = '';
    let conversation = {};

    const sendMessage = async () => {
        if (newMessage.trim() !== '') {
            await sendMessageToConversation(userId, newMessage);
            newMessage = '';
            await loadMessages();
        }
    };

    const loadMessages = async () => {
        if (userId) {
            conversation = await getConversationMessages(userId);
            console.log('conversation', conversation);
        }
    };

    onMount(async () => {
        if (userId) {
            await createConversation(userId, userEmail);
            await loadMessages();
        }
    });
</script>
<main class="container mx-auto">
    <h1 class="text-2xl font-bold mb-4">Conversación</h1>

    <div class="mb-4">
        {#each Object.entries(conversation) as [id, message]}
            <div class="mb-2">
                <span class="text-gray-500 text-sm">{new Date(message.date).toLocaleString()}</span>
                <p>{message.mensaje}</p>
            </div>
        {/each}
    </div>

    <form class="max-w-md mx-auto" on:submit|preventDefault={sendMessage}>
        <div class="mb-4">
            <textarea
                id="message"
                bind:value={newMessage}
                class="w-full p-2 border border-gray-300 rounded"
            ></textarea>
        </div>

        <div class="mb-4">
            <button type="submit" class="w-full p-2 bg-blue-500 text-white rounded">Enviar</button>
        </div>
    </form>
</main>