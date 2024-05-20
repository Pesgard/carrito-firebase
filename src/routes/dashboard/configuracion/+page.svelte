<script>
    let primaryColor = "#ff0000";
    let secondaryColor = "#00ff00";
    let textColor = "#0000ff";

    function updateColors() {
        document.documentElement.style.setProperty("--primary-color", primaryColor);
        document.documentElement.style.setProperty("--secondary-color", secondaryColor);
        document.documentElement.style.setProperty("--text-color", textColor);
    }
</script>

<main>
    <h1>Configuración de Colores</h1>

    <label>
        Color Primario:
        <input type="color" bind:value={primaryColor} />
    </label>

    <label>
        Color Secundario:
        <input type="color" bind:value={secondaryColor} />
    </label>

    <label>
        Color de Texto:
        <input type="color" bind:value={textColor} />
    </label>

    <button on:click={updateColors}>Guardar</button>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
    }
</style>