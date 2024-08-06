<script>
  import Card from "./Card.svelte";
</script>

<main>
  <Card />
</main>

<style>
  main {
    text-align: center;
    padding: 3em 1em;
    max-width: 240px;
    margin: auto auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
  @media (max-width: 640px) {
    main {
      padding: 0;
    }
  }
</style>
