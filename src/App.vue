<template>
  <div id="app">
    <div>
      <router-link to="/">Home</router-link> |
      <router-link :to="{name: 'Lanchas'}">Lanchas</router-link> |
      <router-link :to="{name: 'Rentas'}">Rentas</router-link> |
      <router-link :to="{name: 'Precios'}">Precios</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <b-alert>
<!--      TODO: alerta que sea cuando se agregue una nueva lancha o se modifiquen correctamente-->
    </b-alert>
<!--    TODO: modificar el texto error que sea un alert que muestre los mensajes de error-->
<!--    <p class="text-danger">{{error}}</p>-->
      <b-alert variant="danger" dismissible>
        {{error}}
      </b-alert>
    <b-container ref="lanchasSection">
      <router-view class="m-2" />
    </b-container>
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  export default {
    name: 'App',
    computed: {
      ...mapState(['error'])
    }
  }
</script>

<style>
/*
#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}*/
</style>
