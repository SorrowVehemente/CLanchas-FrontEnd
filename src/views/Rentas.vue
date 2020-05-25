<template>
    <div>
        <div class="d-flex justify-content-between">
            <h1>Rentas activas</h1>
            <router-link :to="{name: 'Lanchas'}" title="Nueva renta" class="m-2">Agregar renta</router-link>
        </div>
        <b-row>
            <Renta v-for="(renta, indx) in rentas" :key="indx" :renta="renta" />
        </b-row>
        <p v-for="(uso, indx) in usosActivos" :key="indx">{{uso}}</p>
        <div class="mt-5 text-center" v-if="!rentas.length">
            <h4>No hay rentas activas.</h4>
            <router-link :to="{ name: 'Lanchas' }" title="Nueva renta">Agregar renta</router-link>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import Renta from '@/components/Renta';
    export default {
        name: "Rentas",
        computed: {
            ...mapState(['rentas', 'precios', 'usosActivos'])
        },
        methods: {
            ...mapActions(['obtenerRentas', 'obtenerPrecios', 'obtenerUsosDeRentasActivas'])
        },
        created() {
            this.obtenerRentas();
            if(!this.precios.length) {
                this.obtenerPrecios();
            }
            this.obtenerUsosDeRentasActivas();
        },
        components: {
            Renta
        }
    }
</script>

<style scoped>

</style>