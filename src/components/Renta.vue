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
                <small class="text-uppercase mt-2">Tiempo Comprado:</small>
                <h4 class="text-uppercase mt-2">{{tiempo}}</h4>
            </div>
            <hr />
            <div class="d-flex justify-content-between">
                <small class="text-uppercase mt-2">Tiempo Restante:</small>
                <h4 :class="[(restarTiempo(momento) === '00:00:00') ? 'text-danger' : (tresMinutos(restarTiempo(momento))) ?  'text-warning' :'text-success', 'mt-2']">{{restarTiempo(momento)}}</h4>
            </div>
            <p class=""></p>
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
    import moment from 'moment'
    export default {
        name: "Renta",
        data() {
            return {
                error: null,
                showError: false,
                agregarTiempoModal: false,
                precioSeleccionado: null,
                tiempo: '00:00:00'
            }
        },
        props: {
            renta: Object,
            usos: Array,
            momento: ''
        },
        computed: {
            ...mapState(['precios'])
        },
        methods: {
            ...mapActions(['terminarRenta', 'nuevoUso']),
            removeRenta(renta) {
                this.$swal.fire({
                    title: '¿De verdad desea terminar la Renta?',
                    html: `¡Esta acción no se puede deshacer!<br /><hr />`+this.obtenerTiempoPrecioFinal(),
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
                this.sumarTiempoGeneral(precio.tiempo)
            },
            toggleModal() {
                this.agregarTiempoModal = !this.agregarTiempoModal;
            },
            reiniciarModal() {
                this.precioSeleccionado = null;
            },
            sumarTiempoGeneral(tiempo) {
                let tTiempo = moment(this.tiempo, 'HH:mm:ss')
                        .add(tiempo.split(":")[2], 'seconds')
                        .add(tiempo.split(":")[1], 'minutes')
                        .add(tiempo.split(":")[0], 'hours')
                this.tiempo = tTiempo.format("HH:mm:ss")
            },
            sumarTiempo() {
                let tTiempo = moment("00:00:00", 'HH:mm:ss')
                for(let i in this.usos){
                    if(this.usos[i].renta_id === this.renta.id) {
                        tTiempo = moment(tTiempo, 'HH:mm:ss')
                            .add(this.usos[i].tiempo.split(":")[2], 'seconds')
                            .add(this.usos[i].tiempo.split(":")[1], 'minutes')
                            .add(this.usos[i].tiempo.split(":")[0], 'hours')
                    }
                }
                this.tiempo = tTiempo.format("HH:mm:ss")
            },
            restarTiempo(m) {
                let hi = new Date(this.renta.renta_de).toLocaleTimeString() //Hora inicio para restar
                let dif1 = moment.utc(moment(m,"HH:mm:ss").diff(moment(hi,"HH:mm:ss"))).format("HH:mm:ss") //Diferencia entre Hora sistema y Hora inicio
                let dif2 = moment.utc(moment(this.tiempo,"HH:mm:ss").diff(moment(dif1,"HH:mm:ss"))).format("HH:mm:ss") //Diferencia entre tiempo y dif1
                // Diff dias
                if (new Date(this.renta.renta_de).getDate() < new Date().getDate()) {
                    dif2 = '00:00:00';
                }
                if(dif2.split(':')[0] === '23' || dif2.split(':')[0] === '22' || dif2.split(':')[0] === '21') {
                    dif2 = '00:00:00';
                }
                if(dif2 === 'Invalid date') {
                    dif2 = 'Cargando...';
                }
                return dif2;
            },
            tresMinutos(dif) {
                let tTiempo = moment('00:00:00', 'HH:mm:ss')
                    .add(dif.split(':')[2], 'seconds')
                    .add(dif.split(':')[1], 'minutes')
                    .add(dif.split(":")[0], 'hours')
                return tTiempo.minutes() < 3;
            },
            obtenerTiempoPrecioFinal() {
                let resumen = '<h4>Timpo - Precio</h4>';
                let precioFinal = 0.0;
                this.usos.forEach(uso => {
                    if(uso.renta_id === this.renta.id) {
                        resumen += `${uso.tiempo} - $${uso.precio}<br />`;
                        precioFinal += uso.precio;
                    }
                });
                resumen += `<br /><h4>Precio final: $${precioFinal}</h4>`;
                return resumen;
            }
        },
        beforeUpdate() {
            this.sumarTiempo()
        }
    }
</script>

<style scoped>

</style>