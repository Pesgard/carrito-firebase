<script>
	import { onMount } from 'svelte';
	import { getConversationMessages, getAllConversations } from '$lib/firebase';

	let conversations = [];
	let selectedConversation = null;
	let selectedEmailConversation = null;
	let respuesta;
	export let form;

	async function fetchConversations() {
		// Lógica para obtener las conversaciones desde Firebase
		conversations = await getAllConversations();
		console.log('Conversations:', conversations);
	}

	async function fetchMessages(userId, email) {
		selectedConversation = await getConversationMessages(userId, email);
		selectedEmailConversation = email;
	}

	onMount(fetchConversations);

</script>

<h1 class="text-3xl font-bold mb-4">Conversaciones</h1>
<div class="flex">
	<ul class="space-y-4 w-1/4">
		{#each conversations as conversation}
			<li>
				<button
					class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					on:click={() => fetchMessages(conversation.id, conversation.data.correo)}
				>
					{conversation.data.correo}
				</button>
			</li>
		{/each}
	</ul>

	{#if selectedConversation}
		<div class="w-3/4 flex flex-col">
			{#each Object.entries(selectedConversation) as [timestamp, message]}
				<div class="bg-white shadow-md rounded-lg p-4 mb-4">
					<h2 class="text-xl font-bold mb-2">{new Date(Number(timestamp)).toLocaleString()}</h2>
					<p>{message.mensaje}</p>
				</div>
			{/each}
			<div class="wrapper m-8">
				<span>Contestar por correo</span>
				<form method="POST" class="card p-4 w-full text-token space-y-4">
					<label class="label">
						<span>para</span>
						<input class="input" name="to" type="email" value={selectedEmailConversation} />
					</label>

					<label class="label">
						<span>asunto:</span>
						<input class="input" name="subject" value="" />
					</label>

					<label class="label">
						<span>respuesta:</span>
                        <textarea class="textarea" name="body" rows="6" value=''></textarea>
					</label>

                    <div class="w-full flex items-end justify-end">
                        <button class="btn variant-soft-primary" type="submit">emviar</button>
                    </div>
				</form>
				<p class="success">{form?.success || ''}</p>
			</div>
		</div>
	{/if}
</div>

