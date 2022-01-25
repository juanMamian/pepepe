<template>
  <div id="buscadorNodos">
    <div id="zonaBuscador">
      <input
        type="text"
        v-model="textoBuscado"
        v-show="mostrarCuadroBusqueda"
        :class="{deshabilitado: buscando}"
        @keypress.enter="buscar"
      />
      <loading texto="" v-show="buscando"/>
      <img
        src="@/assets/iconos/search.svg"
        alt="Buscar"
        title="buscar"
        id="botonBuscar"
        @click="mostrarCuadroBusqueda = true"
        v-show="!mostrarCuadroBusqueda"
      />
      <img
        src="@/assets/iconos/equis.svg"
        alt="Cancelar"
        title="Cancelar búsqueda"
        id="botonCancelarBusqueda"
        v-show="mostrarCuadroBusqueda"
        @click="mostrarCuadroBusqueda = false"
      />
    </div>
    <div id="zonaResultados" v-show="verResultados && mostrarCuadroBusqueda">
      <div id="listaResultados">
        <div
          class="nodoEncontrado"
          v-for="nodo of nodosEncontradosRelevantes"
          :key="nodo.id"
        >
          <a :href="clienteUrl + '/#/homeNodoSolidaridad/' + nodo.id">
            <div class="barraPrincipalNodo">
              <div id="zonaIconoNodo">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="cog"
                  class="svg-inline--fa fa-cog fa-w-16 iconoTipoNodo"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  v-if="nodo.tipoNodo === 'trabajo'"
                >
                  <path
                    fill="currentColor"
                    d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"
                  ></path>
                </svg>
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="star"
                  class="svg-inline--fa fa-star fa-w-18 iconoTipoNodo"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                  v-else
                >
                  <path
                    fill="currentColor"
                    d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"
                  ></path>
                </svg>
              </div>
              <div class="nombre">{{ nodo.nombre }}</div>
              <div class="zonaBotonesNodoResultado" @click.stop.prevent="">
                <div
                  class="botonVerDescripcion"
                  :title="
                    mostrandoDescripcionDe === nodo.id
                      ? 'Ocultar descripción del nodo'
                      : 'Mostrar descripción del nodo'
                  "
                  @click.stop.prevent="
                    mostrandoDescripcionDe =
                      mostrandoDescripcionDe === nodo.id ? null : nodo.id
                  "
                  :class="{
                    deshabilitado:
                      !nodo.descripcion ||
                      nodo.descripcion.length < 1 ||
                      nodo.descripcion === 'Sin descripcion' ||
                      nodo.descripcion === 'Sin descripción',
                  }"
                  :style="{
                    borderColor:
                      mostrandoDescripcionDe === nodo.id ? 'white' : 'black',
                  }"
                >
                  <img src="@/assets/iconos/info.svg" alt="Descripcion" />
                </div>
              </div>
            </div>
          </a>
          <div
            class="zonaDescripcion"
            v-show="mostrandoDescripcionDe === nodo.id"
          >
            <div class="descripcion">{{ nodo.descripcion }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from '../../utilidades/Loading.vue';
export default {
  components: { Loading },
  name: "BuscadorNodos",
  props: {
    idNodoParent: String,
    listaIdsNodosRelevantes: Array,
  },
  data() {
    return {
      textoBuscado: null,
      buscando:false,
      mostrarCuadroBusqueda: false,
      nodosEncontrados: [],
      verResultados: false,

      mostrandoDescripcionDe: null,
    };
  },
  methods: {
    buscar() {
      console.log(`Iniciando búsqueda.`);

      this.buscando = true;
      this.$apollo
        .query({
          query: gql`
            query ($textoBuscado: String!) {
              busquedaAmpliaNodosSolidaridad(textoBuscado: $textoBuscado) {
                id
                nombre
                tipoNodo
                descripcion
              }
            }
          `,
          variables: {
            textoBuscado: this.textoBuscado,
          },
        })
        .then(({ data: { busquedaAmpliaNodosSolidaridad } }) => {
          this.nodosEncontrados = busquedaAmpliaNodosSolidaridad;
          this.buscando = false;
          this.verResultados = true;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.buscando = false;
        });
    },
  },
  computed: {
    nodosEncontradosRelevantes() {
      if (!this.listaIdsNodosRelevantes) {
        return this.nodosEncontrados;
      } else {
        return this.nodosEncontrados.filter((ne) =>
          this.listaIdsNodosRelevantes.includes(ne.id)
        );
      }
    },
  },
};
</script>

<style scoped>
#buscadorNodos {
  width: 100%;
}

#botonCerrar {
  margin-right: 15px;
  margin-left: 5px;
  opacity: 0.7;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
#zonaBuscador {
  display: flex;
  align-items: center;
  padding: 0px 10px;
}

#botonBuscar {
  width: 20px;
  height: 20px;
  opacity: 0.7;
  margin-left: 10px;
  cursor: pointer;
}
#botonBuscar:hover {
  opacity: 1;
}
#botonCancelarBusqueda {
  width: 20px;
  height: 20px;
  margin-left: 10px;
  cursor: pointer;
  opacity: 0.7;
}
#botonCancelarBusqueda:hover {
  opacity: 1;
}

.nodoEncontrado {
  padding: 3px 5px;
  cursor: pointer;
  background-color: var(--atlasFondoNodo);
  font-size: 14px;
}
.barraPrincipalNodo {
  display: flex;
}
.barraPrincipalNodo:hover {
  background-color: rgba(0, 0, 0, 0.123);
}
.iconoTipoNodo {
  width: 13px;
  height: 13px;
  filter: inherit;
  margin: 0px 5px;
}
.zonaBotonesNodoResultado {
  margin-left: auto;
  margin-right: 2%;
}
.botonVerDescripcion {
  margin-right: 2%;
  height: 15px;
  width: 15px;
  padding: 2px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-style: solid;
  border-radius: 50%;
  border-width: 1px;
}

.botonVerDescripcion img {
  width: 90%;
  height: 90%;
}

.zonaDescripcion {
  border: 1px solid white;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.342);
  padding: 10px;
  margin: 0px 10px;
}

.descripcion {
  white-space: pre-wrap;
}
</style>