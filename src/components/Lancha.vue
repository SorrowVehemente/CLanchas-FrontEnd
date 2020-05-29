<template>
    <div class="col-md-4 col-sm-6">
<!--        TODO: Modificar lancha-->
        <b-card class="mt-2" :border-variant="lancha.estado === 0 ? 'success' : lancha.estado === 1  ? 'warning' : 'info'" align="center">
            <div class="d-flex justify-content-center">
                <b-card-title>Lancha #{{lancha.numero}}</b-card-title>
            </div>
            <b-card-text class="d-flex justify-content-start">
                <small><b>Nombre: </b>{{lancha.nombre}}</small>
            </b-card-text>
            <b-card-text class="d-flex justify-content-between">
                <h5>Estado:</h5>
                <div class="text-uppercase">
                    <small class="text-success" v-if="lancha.estado === 0"><b>Disponible</b></small>
                    <small class="text-warning" v-else-if="lancha.estado === 1"><b>Ocupado</b></small>
                    <small class="text-info" v-else-if="lancha.estado === 2"><b>En reparación</b></small>
                    <small class="text-info" v-else><b>Otro</b></small>
                </div>
            </b-card-text>
            <div v-if="lancha.estado === 1">
                <div class="d-flex justify-content-between">
                    <small class="text-uppercase mt-2">Tiempo Restante:</small>
                    <h4>{{restarTiempo(momento)}}</h4>
                </div>
                <hr />
                <b-button :to="{name: 'Rentas'}" variant="warning" class="m-2">Ir a rentas</b-button>
            </div>
            <hr v-if="lancha.estado !== 1" />
            <b-dropdown v-if="lancha.estado !== 1" text="Acción" right :variant="lancha.estado === 0 ? 'success' : lancha.estado === 1  ? 'warning' : 'info'">
                <div v-if="lancha.estado === 0">
                    <b-dropdown-item @click="toggleModal()">Ocupar Lancha</b-dropdown-item>
                    <b-dropdown-divider />
                    <b-dropdown-item @click="cambiarEstado(lancha, 2)">Poner en reparación</b-dropdown-item>
                    <b-dropdown-item @click="cambiarEstado(lancha, 3)">Poner otro estado</b-dropdown-item>
                </div>
                <div v-else-if="lancha.estado === 2">
                    <b-dropdown-item @click="toggleModal()">Ocupar Lancha</b-dropdown-item>
                    <b-dropdown-divider />
                    <b-dropdown-item @click="cambiarEstado(lancha, 3)">Poner otro estado</b-dropdown-item>
                    <b-dropdown-item @click="cambiarEstado(lancha, 0)">Cambiar lancha a Activa</b-dropdown-item>
                </div>
                <div v-else>
                    <b-dropdown-item @click="toggleModal()">Ocupar Lancha</b-dropdown-item>
                    <b-dropdown-divider />
                    <b-dropdown-item @click="cambiarEstado(lancha, 2)">Poner en Reparación</b-dropdown-item>
                    <b-dropdown-item @click="cambiarEstado(lancha, 0)">Cambiar lancha a Activa</b-dropdown-item>
                </div>
            </b-dropdown>
        </b-card>
<!--        TODO: Separar este modal a un componente-->
        <b-modal centered hide-footer v-model="mostrarModal" title="Ocupar lancha">
            <b-alert v-model="showError" variant="danger" dismissible>
                {{error}}
            </b-alert>
            <form @submit.prevent="submitRenta(lancha, cant_adult, cant_jov, precioSeleccionado)">
                <b-row>
                    <b-col sm="4">
                        <label for="ca"><b>Cantidad de Adultos</b></label>
                    </b-col>
                    <b-col sm="8">
                        <input v-model.number="cant_adult" type="number" min="0" max="10" class="form-control" id="ca">
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="4">
                        <label for="cj"><b>Cantidad de Jovenes</b></label>
                    </b-col>
                    <b-col sm="8">
                        <input v-model.number="cant_jov" type="number" min="0" max="10" class="form-control" id="cj">
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="4">
                        <label for="ct"><b>Tiempo:</b></label>
                    </b-col>
                    <b-col sm="8">
                        <b-form-select id="ct" v-model="precioSeleccionado">
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
    import { mapActions, mapState } from 'vuex';
    import moment from 'moment'
    export default {
        name: "Lancha",
        data() {
            return {
                mostrarModal: false,
                cant_adult: null,
                cant_jov: null,
                error: null,
                showError: false,
                precioSeleccionado: null,
                tiempo: '00:00:00'
            }
        },
        computed: {
            ...mapState(['precios'])
        },
        props: {
            lancha: Object,
            usos: Array,
            momento: ''
        },
        methods: {
            ...mapActions(['actualizarLancha', 'nuevaRenta', 'nuevoUso']),
            submitRenta(lancha, adl, jov, precioSelect) {
                if(!adl || !jov) {
                    this.error = 'No ha proporcionado una cantidad de adultos o de jovenes.';
                    this.showError = true;
                    return;
                }
                if(!precioSelect) {
                    this.error = 'No ha seleccionado el tiempo/precio inicial, elija uno.';
                    this.showError = true;
                    return;
                }
                console.log(precioSelect)
                this.nuevaRenta({lancha, adl, jov, precio: precioSelect});
                this.actualizarLancha({lancha, estado: 1});
                this.toggleModal();
                this.reiniciarModal();
                this.sumarTiempoGeneral(precioSelect.tiempo)
            },
            desocuparLancha(lancha) {
                //console.log(`Desocupar ${lancha.id}`);
                this.actualizarLancha({lancha, estado: 0});
                this.sumarTiempo();
            },
            cambiarEstado(lancha, estado) {
                this.actualizarLancha({lancha, estado});
            },
            toggleModal() {
                this.mostrarModal = !this.mostrarModal;
            },
            reiniciarModal() {
                this.cant_adult = null;
                this.cant_jov = null;
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
                    if(this.usos[i].renta.lancha_id === this.lancha.id) {
                        tTiempo = moment(tTiempo, 'HH:mm:ss')
                            .add(this.usos[i].tiempo.split(":")[2], 'seconds')
                            .add(this.usos[i].tiempo.split(":")[1], 'minutes')
                            .add(this.usos[i].tiempo.split(":")[0], 'hours')
                    }
                }
                this.tiempo = tTiempo.format("HH:mm:ss")
                //let test = moment(this.tiempo, 'HH:mm:ss').subtract(1, "seconds").toDate()
                //console.log(moment(test, 'HH:mm:ss'))
            },
            restarTiempo(m) {
                let hi = new Date(this.getRenta_de()).toLocaleTimeString() //Hora inicio para restar
                /*console.log(this.renta.fecha+" "+m)
                console.log(this.renta.fecha+" "+hi)*/
                let dif1 = moment.utc(moment(m,"HH:mm:ss").diff(moment(hi,"HH:mm:ss"))).format("HH:mm:ss") //Diferencia entre Hora sistema y Hora inicio
                let dif2 = moment.utc(moment(this.tiempo,"HH:mm:ss").diff(moment(dif1,"HH:mm:ss"))).format("HH:mm:ss") //Diferencia entre tiempo y dif1
                if(dif2.split(":")[0]==="23" || dif2.split(":")[0]==="22" || dif2.split(":")[0]==="21") {
                    dif2 = "00:00:00"
                }
                return dif2
            },
            getRenta_de() {
                for(let i in this.usos){
                    if(this.usos[i].renta.lancha_id === this.lancha.id) {
                        return this.usos[i].renta.renta_de
                    }
                }
            }
        },
        beforeUpdate() {
            this.sumarTiempo()
        }
    }
</script>

<style scoped>

</style>