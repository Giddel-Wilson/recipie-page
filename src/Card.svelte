<script>
  import Content from "./Content.svelte";
</script>

<main>
  <div class="cardBody">
    <Content />
  </div>
</main>

<style>
  .cardBody {
    background-color: whitesmoke;
    width: 70vb;
    height: fit-content;
    border-radius: 20px;
    padding: 30px;
  }
  @media (max-width: 1020px) {
    .cardBody {
        width: 50vh;
    }
  }

  @media (max-width: 640px) {
    .cardBody {
      width: 100vw;
      height: 100%;
      padding: 0;
      border-radius: 0;
    }
  }
</style>
