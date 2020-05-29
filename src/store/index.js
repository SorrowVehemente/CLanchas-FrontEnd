import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
      lanchas: [],
      rentas: [],
      precios: [],
      error: '',
      usosActivos: []
  },
  mutations: {
      setLanchas(state, lanchas) {
          state.lanchas = lanchas;
      },
    addLancha(state, lancha) {
          state.lanchas.push(lancha);
    },
      updateLancha(state, lancha) {
        let indx = state.lanchas.findIndex(el => el.id === lancha.id);
        state.lanchas[indx].estado = lancha.estado;
      },
      manejarError(state, error) {
          console.error(error);
          if(error == 'Error: Network Error') {
              state.error = 'Error de conexión';
          }
      },
      setRentas(state, rentas) {
          state.rentas = rentas;
      },
      setPrecios(state, precios) {
          state.precios = precios;
      },
      addPrecio(state, precio) {
          state.precios.push(precio);
      },
      updatePrecio(state, precio) {
          const indx = state.precios.findIndex(el => el.id === precio.id);
          state.precios[indx] = precio;
      },
      deletePrecio(state, precio) {
          state.precios.splice(state.precios.findIndex(el => el.id === precio.id), 1);
          Vue.swal.fire('¡Eliminado!', 'El precio ha sido eliminado.', 'success');
      },
      quitarRenta(state, renta) {
          state.rentas.splice(state.rentas.findIndex(el => el.id === renta.id), 1);
          Vue.swal.fire('¡Renta Terminada!', 'La renta se ha terminado con éxito.', 'success');
      },
      setUsosActivos(state, usos) {
          state.usosActivos = usos;
      },
      addUsoActivo(state, uso) {
          state.usosActivos.push(uso);
      }
  },
// TODO: Separar por modulos
  actions: {
    getLanchas({commit}) {
      // TODO: Poner en señal de que se están cargando las lanchas
      axios.get('/lancha')
          .then(res => {
              console.log('Lanchas obtenidas.');
            commit('setLanchas', res.data);
          })
          .catch(error => {
              commit('manejarError', error);
          });
      // TODO: Quitar la señal de carga de lanchas
    },
        nuevaLancha({commit}, payload) {
        axios.post('/lancha', {
            numero: payload.numero,
            nombre: payload.nombre
        })
            .then(res => {
                // TODO: mostrar alerta de que se ha agregado el nuevo mensaje
                commit('addLancha', res.data);
            })
            .catch(error => {
                commit('manejarError', error);
            })
        },
      actualizarLancha({commit}, payload) {
        axios.put(`/lancha/${payload.lancha.id}`, {
            numero: payload.lancha.numero,
            nombre: payload.lancha.nombre,
            estado: payload.estado,
        })
            .then(res => {
                commit('updateLancha', res.data);
            }).catch(error => {
                commit('manejarError', error);
        });
      },
        obtenerUsosDeRentasActivas({commit}) {
            axios.get('/uso/de-renta-activa')
                .then(res => {
                    console.log('Usos de rentas de activas: ', res.data);
                    commit('setUsosActivos', res.data);
                })
                .catch(error => {
                    commit('manejarError', error);
                });
        },
        nuevoUso({commit}, payload) {
            // TODO: Cambiar la manera como se manda el post como el de nueva renta.
            axios.post('/uso', payload)
                .then(res => {
                    console.log('Uso agregado.');
                    commit('addUsoActivo', res.data);
                    // TODO: hacer que el tiempo agregado se ponga en la parte de las rentas
                })
                .catch(error => {
                    commit('manejarError', error);
                });
        },
      nuevaRenta({commit, dispatch}, payload) {
          const date = new Date();
          const format = new Intl.DateTimeFormat('es', { year: 'numeric', month: '2-digit', day: '2-digit' });
          const [{value: day}, , {value: month}, , {value: year}] = format.formatToParts(date);
          const fecha = `${day}/${month}/${year}`; // fecha formateada 'XX/XX/XXXX'
          let data = {
              lancha_id: payload.lancha.id,
              fecha,
              c_adultos: payload.adl,
              c_jovenes: payload.jov
          }
          axios.post('/renta', data)
              .then(res => {
                  dispatch('nuevoUso', { renta_id: res.data.id, tiempo: payload.precio.tiempo, precio: payload.precio.precio });
              })
              .catch(error => {
                  commit('manejarError', error);
              });
      },
      obtenerRentas({commit}) {
        axios.get('/renta/activo')
            .then(res => {
                console.log('Rentas obtenidas.');
                commit('setRentas', res.data);
            })
            .catch(error => {
                commit('manejarError', error);
            })
      },
      obtenerPrecios({commit}) {
        axios.get('/precios/activo')
            .then(res => {
                console.log('Precios obtenidos.');
                commit('setPrecios', res.data);
            })
            .catch(error => {
                commit('manejarError', error);
            })
      },
      nuevoPrecio({commit}, payload) {
          const date = new Date();
          const format = new Intl.DateTimeFormat('es', { year: 'numeric', month: '2-digit', day: '2-digit' });
          const [{value: day}, , {value: month}, , {value: year}] = format.formatToParts(date);
          const fecha = `${day}/${month}/${year}`; // fecha formateada 'XX/XX/XXXX'
        axios.post('/precios', {
            tiempo: payload.tiempo,
            precio: payload.precio,
            estado: true,
            fecha
        })
            .then(res => {
                commit('addPrecio', res.data);
            })
            .catch(error => {
                commit('manejarError', error);
            })
      },
      actualizarPrecio({commit}, payload) {
        axios.put(`/precios/${payload.id}`, {
            tiempo: payload.tiempo,
            precio: payload.precio,
            estado: payload.estado
        })
            .then(res => {
                commit('updatePrecio', res.data);
            })
            .catch(error =>{
                commit('manejarError', error);
            });
      },
      eliminarPrecio({commit}, payload) {
          axios.delete(`/precios/${payload.id}`)
              .then(res => {
                  console.log(res.data);
                  commit('deletePrecio', payload);
              })
              .catch(error => {
                  commit('manejarError', error);
              });
      },
      terminarRenta({commit, dispatch}, payload) {
        axios.put(`/renta/update-uso/${payload.renta.id},${payload.en_uso}`)
            .then(res => {
                dispatch('actualizarLancha', {lancha: res.data.lancha, estado: 0});
                commit('quitarRenta', res.data);
                dispatch('obtenerUsosDeRentasActivas');
                console.log('Renta terminada.')
            })
            .catch(error => {
                commit('manejarError', error);
            });
      }
  },
  modules: {
  }
})
