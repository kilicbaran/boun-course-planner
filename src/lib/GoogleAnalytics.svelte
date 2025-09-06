<!-- Global site tag (gtag.js) - Google Analytics -->
<svelte:head>
  {#if import.meta.env.PROD}
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-6YH5E6DSP4"
    ></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());

      gtag("config", "G-6YH5E6DSP4");
    </script>
  {/if}
</svelte:head>
