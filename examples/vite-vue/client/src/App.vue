<script setup>
import { useStore } from "vuex";

const store = useStore();

function onClick() {
  store.dispatch('loadInts');
}

store.dispatch('connect');
</script>

<template>
  <div>
    <h2>Connection Status: {{ store.state.connection.status }}</h2>
    <div>
      <button @click="onClick">Request Ints</button>
    </div>
    <ul>
      <li v-for="message, index in store.state.messages" :key="index">{{message}}</li>
    </ul>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
