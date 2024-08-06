<script>
</script>

<main>
  <div>
    <img src="./omelette.jpeg" alt="" class="img" />
  </div>
  <div class="pad">
    <h2>Simple Omelette Recipe</h2>

    <p class="firstParagraph">
      An easy and quick dish, perfect for any meal. This classic omelette
      combines beaten eggs cooked to perfection, optionally filled with your
      choice of cheese, vegetables, or meats.
    </p>

    <ul class="prepUL">
      <h5>Preparation time</h5>
      <li><span class="bold">Total:</span> Approximately 10 minutes</li>
      <li><span class="bold">Preparation:</span> 5 minutes</li>
      <li><span class="bold">Cooking:</span> 5 minutes</li>
    </ul>

    <ul>
      <h4>Ingredients</h4>
      <li>2-3 large eggs</li>
      <li>Salt, to taste</li>
      <li>Pepper, to taste</li>
      <li>1 tablespoon of butter or oil</li>
      <li>Optional fillings: cheese, diced vegetables, cooked meats, herbs</li>
    </ul>

    <ol>
      <h4>Instructions</h4>
      <li>
        <span class="bold">Beat the eggs:</span> In a bowl, beat the eggs with a
        pinch of salt and pepper until they are well mixed. You can add a tablespoon
        of water or milk for a fluffier texture.
      </li>
      <li>
        <span class="bold">Heat the pan:</span> Place a non-stick frying pan over
        medium heat and add butter or oil.
      </li>
      <li>
        <span class="bold">Cook the omelette:</span> Once the butter is melted and
        bubbling, pour in the eggs. Tilt the pan to ensure the eggs evenly coat the
        surface.
      </li>
      <li>
        <span class="bold">Add fillings (optional):</span> When the eggs begin to
        set at the edges but are still slightly runny in the middle, sprinkle your
        chosen fillings over one half of the omelette.
      </li>
      <li>
        <span class="bold">Fold and serve:</span> As the omelette continues to cook,
        carefully lift one edge and fold it over the fillings. Let it cook for another
        minute, then slide it onto a plate.
      </li>
      <li>
        <span class="bold">Enjoy:</span> Serve hot, with additional salt and pepper
        if needed.
      </li>
    </ol>

    <h4>Nutrition</h4>
    <p>
      The table below shows nutritional values per serving without the
      additional fillings.
    </p>
    <table>
      <tr>
        <td>Calories</td>
        <td>277kcal</td>
      </tr>
      <tr>
        <td>Carbs</td>
        <td>0g</td>
      </tr>
      <tr>
        <td>Protein</td>
        <td>20g</td>
      </tr>
      <tr>
        <td>Fat</td>
        <td>22g</td>
      </tr>
    </table>
  </div>
</main>

<style>
  main {
    text-align: left;
    font-family: gills;
  }
  .img {
    width: 100%;
    height: 200px;
    border-radius: 20px;
  }
  @media (max-width: 640px) {
    .img {
      border-radius: 0;
    }
    .pad {
      padding: 0 17px 15px 17px;
    }
    .prepUL {
      background-color: #fff7fc;
      border-radius: 10px;
      width: 80%;
      padding: 10px;
    }
    .prepUL li {
      font-size: small;
    }
  }
  h2 {
    padding: 20px 0 20px 0;
  }
  p {
    padding: 0 0 20px 0;
    font-size: smaller;
  }
  .prepUL {
    margin: 0 0 20px 20px;
    font-size: smaller;
  }
  .prepUL h5 {
    margin: 0 0 5px 0;
    font-size: small;
  }
  @media (max-width: 640px) {
    .prepUL h5 {
      margin: 0 0 7px 0;
      font-size: medium;
    }
  }
  .prepUL li {
    margin: 5px 0 0 30px;
  }
  ul,
  ol {
    margin: 0 0 20px 0;
  }
  ul li {
    margin: 3px 0 5px 30px;
    font-size: smaller;
    font-weight: 100;
  }

  ol li {
    margin: 3px 0 5px 30px;
    font-size: smaller;
    font-weight: 100;
  }
  h4 {
    margin: 0 0 8px 0;
    font-size: 17px;
    color: darkred;
  }

  .bold {
    font-weight: 600;
  }
  table {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    color: darkred;
  }
  tr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    border-bottom: 0.5px solid rgba(172, 163, 163, 0.792);
    margin: 0 0 5px 0;
  }
  tr:last-child {
    border-bottom: none;
  }
  td {
    width: 30%;
    margin: 3px 0 3px 0;
  }
</style>
