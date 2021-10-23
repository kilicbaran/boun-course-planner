<script context="module">
    const GTAG_ID = import.meta.env.VITE_GTAG_ID;
    const scriptPart = `<script>window.dataLayer = window.dataLayer || [];function gtag() {dataLayer.push(arguments);}gtag("js", new Date());gtag("config", ${GTAG_ID});<\/script>`;
</script>

<!-- Global site tag (gtag.js) - Google Analytics -->
<svelte:head>
    {#if import.meta.env.PROD}
        <script
            async
            src="https://www.googletagmanager.com/gtag/js?id={GTAG_ID}"></script>
        {@html scriptPart}
    {/if}
</svelte:head>
