<template>
    <div class="col-md-4 col-sm-12">
        <b-card border-variant="primary" class="mt-2">
            <b-card-title align="center">Renta de Lancha #{{renta.lancha.numero}}</b-card-title>
            <div class="d-flex justify-content-between">
                <small class="text-uppercase">Día</small>
                <h4>{{renta.fecha}}</h4>
            </div>
            <div class="d-flex justify-content-between">
                <small class="text-uppercase">Hora de inicio</small>
                <h4>{{new Date(renta.renta_de).toLocaleTimeString()}}</h4>
            </div>
            <hr />
            <div class="d-flex justify-content-between">
                <small class="text-uppercase mt-2">Tiempo Restante:</small>
                <h4>00:15:00</h4>
<!--                <h4>{{tiempoRestante}}</h4>-->
            </div>
            <hr />
            <div class="d-flex justify-content-between">
                <small class="text-uppercase mt-2">Adultos:</small><h4>{{renta.c_adultos}}</h4>
            </div>
            <div class="d-flex justify-content-between">
                <small class="text-uppercase mt-2">Jovenes:</small><h4>{{renta.c_jovenes}}</h4>
            </div>
            <hr />
            <small class="text-uppercase">Observaciones:</small>
            <b-card-text v-if="renta.observaciones === ''" class="text-uppercase">No hay observaciones</b-card-text>
            <b-card-text v-else>{{renta.observaciones}}</b-card-text>
            <hr />
            <div class="d-flex justify-content-between">
                <b-button @click="removeRenta(renta)" variant="warning">Terminar renta</b-button>
                <b-button @click="toggleModal()" variant="info">Agregar tiempo</b-button>
            </div>
        </b-card>
        <b-modal hide-footer v-model="agregarTiempoModal" title="Agregar tiempo" centered>
            <b-alert v-model="showError" variant="danger" dismissible>
                {{error}}
            </b-alert>
            <form @submit.prevent="addTiempo(renta, precioSeleccionado)">
                <b-row>
                    <b-col sm="4">
                        <label for="time"><b>Tiempo:</b></label>
                    </b-col>
                    <b-col sm="8">
                        <b-form-select id="time" v-model="precioSeleccionado">
                            <template slot="first">
                                <b-form-select-option :value="null" disabled>-- Seleccione un Precio --</b-form-select-option>
                            </template>
                            <b-form-select-option v-for="(precio, indx) in precios" :value="precio" :key="indx">
                                {{precio.tiempo + ' - $' + precio.precio}}
                            </b-form-select-option>
                        </b-form-select>
                    </b-col>
                </b-row>
                <div class="d-flex justify-content-end mt-2">
                    <b-button class="m-2" variant="success" type="submit">Enviar</b-button>
                    <b-button @click="toggleModal()" class="m-2">Cancelar</b-button>
                </div>
            </form>
        </b-modal>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    export default {
        name: "Renta",
        data() {
            return {
                error: null,
                showError: false,
                agregarTiempoModal: false,
                precioSeleccionado: null
            }
        },
        props: {
            renta: Object,
        },
        computed: {
            ...mapState(['precios'])
        },
        methods: {
            ...mapActions(['terminarRenta', 'nuevoUso']),
            removeRenta(renta) {
                this.$swal.fire({
                    title: '¿De verdad desea terminar la Renta?',
                    text: "¡Esta acción no se puede deshacer!",
                    icon: 'warning',
                    showCancelButton: true,
                    cancelButtonColor: '#dd3333',
                    confirmButtonText: '¡Si, terminar!',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.value) {
                        this.terminarRenta({renta, en_uso: false});
                    }
                })
            },
            addTiempo(renta, precio) {
                if(!precio) {
                    this.error = 'No ha seleccionado un tiempo a agregar, elija uno.'
                    this.showError = true;
                    return;
                }
                this.nuevoUso({renta_id: renta.id, tiempo: precio.tiempo, precio: precio.precio});
                this.toggleModal();
                this.reiniciarModal();
            },
            toggleModal() {
                this.agregarTiempoModal = !this.agregarTiempoModal;
            },
            reiniciarModal() {
                this.precioSeleccionado = null;
            }
        }
    }
</script>

<style scoped>

</style>