<script setup>
  import axios from 'axios';
  import { ref } from 'vue';

  // initialization of variables
  const inputGrocery = ref('');
  const inputQuantity = ref(1);
  const listGrocery = ref();

  getGroceries(); // call of getGroceries to get the data when launching the page

  // getGroceries to get all the data
  async function getGroceries() {
    await axios.get('http://localhost:3000/groceryProducts') // send a GET request to the API
        .then(response => {
            listGrocery.value = response.data; // put the database data in a list of object
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
  }

  // addGrocery to add a new product to the database
  async function addGrocery() {
    if (inputGrocery.value != "" && !(/^\s*$/.test(inputGrocery.value))) { // check that the input text field is not empty
      try {
        const response = await axios.post('http://localhost:3000/groceryProducts', {
          productName: inputGrocery.value.charAt(0).toUpperCase() + inputGrocery.value.slice(1).toLowerCase(), // transform first letter in capital letter
          quantity: inputQuantity.value,
        }); // send a POST request to the API
        console.log('Product added successfully:', response.data);
        inputGrocery.value = ''; // reset input text field
        inputQuantity.value = 1; // reset number text field
      } catch (error) {
        console.error('Error adding product:', error);
      }
    }
    getGroceries(); // call of getGroceries to refresh data
  }

  // updateGrocery to update a product in the database
  async function updateGrocery(product) {
    try {
      if (product.pickedUp == 0)
        product.pickedUp = 1; // modify pickedUp value to true
      else
        product.pickedUp = 0; // modify pickedUp value to false
      await axios.put('http://localhost:3000/groceryProducts/' + product.id, product); // send a PUT request to the API
      console.log('Product updated successfully !');
    } catch (error) {
      console.error('Error updating product:', error);
    }
    getGroceries(); // call of getGroceries to refresh data
  }

  // deleteGrocery to delete a product in the database
  async function deleteGrocery(id) {
    try {
      await axios.delete('http://localhost:3000/groceryProducts/' + id); // send a DELETE request to the API
      console.log('Product deleted successfully !');
    } catch (error) {
      console.error('Error deleting product:', error);
    }
    getGroceries(); // call of getGroceries to refresh data
  }
</script>

<template>
  <div></div>
  <header>
        <h1>My grocery list</h1>
    </header>
    <main>
        <div id="add">
            <input type="text" v-model="inputGrocery" id="name">
            <input type="number" v-model="inputQuantity" id="quantity" min="1">
            <button @click="addGrocery">Add to list</button>
        </div>
        <div id="list">
          <ul>
            <li v-for="product in listGrocery">
              <p class="product">
                {{ product.productName }} x{{ product.quantity }} 
                <img src="./assets/bin.png" id="bin" @click="deleteGrocery(product.id)">
              </p>
              <p class="other" v-if="product.pickedUp == 1">
                Picked up 
                <img src="./assets/check_box.png" id="pick" @click="updateGrocery(product)">
              </p>
              <p class="other" v-else>
                Not picked up yet 
                <img src="./assets/cross_box.png" id="pick" @click="updateGrocery(product)">
              </p>
            </li>
          </ul>
        </div>
    <footer>
        &copy; Célian CHAUSSON
    </footer>
    </main>
</template>

<style>
* {
    margin: 0;
    padding: 0;
    text-decoration: none;
}

body {
    background: url("./assets/vichy.jpg");
    color : black;
}

h1 {
    text-align: center;
    font-size: 2.5em;
    margin: 2.5% 0;
}

main {
    background-color: rgb(245, 245, 219);
    margin: 0 15vw;
}

#add {
    padding: 20px 0;
    text-align: center;
    width: 100%;
}

input {
    border: none;
    border-bottom: 2px solid rgb(177, 21, 21);
    background-color: rgb(245, 245, 219);
    font-size: 1em;
}

#name {
  width: 35%;
  margin-right: 15px;
}

#quantity {
    width: 7.5%;
    text-align: center;
}

button {
    background-color: rgb(242, 242, 233);
    border: solid 1px rgb(177, 21, 21);
    margin-left: 10px;
    padding: 10px 20px;
    text-align: center;
    border-radius: 12px;
    font-size: 1em;
}

button:hover {
    background-color: rgb(177, 21, 21);
    color: white;
    cursor: pointer;
}

#list {
  margin: 0 5%;
  padding-bottom: 20px;
}

li {
  margin: 10px;
  border-bottom: solid 1px rgba(0, 0, 0, 0.25);
}

.product {
  padding-bottom: 5px;
}

.other{
  padding-bottom: 5px;
}

#bin {
  width: 15px;
  position: absolute;
  right: 20%;
}

#bin:hover {
  transform: scale(1.2);
  cursor: pointer;
}

#pick {
  width: 20px;
  position: absolute;
  right: 20%;
}

#pick:hover {
  transform: scale(1.2);
  cursor: pointer;
}

footer {
    text-align: center;
    font-weight: bold;
    padding-bottom: 15px;
}

</style>
