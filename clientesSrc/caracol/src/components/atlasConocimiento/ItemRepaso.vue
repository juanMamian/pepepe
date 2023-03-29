<template>
  <div class="itemRepaso">
    <div id="barraSuperior" :style="[colorBarraSuperior]">
      <div id="nombre">
        {{ esteRepaso.nombreNodo }}
      </div>
      <div id="bloqueBotones" class="contenedorControles">
        <div
          class="boton"
          title="Abrir"
          @click="
            $router.push({
              name: 'visorNodoConocimiento',
              params: { idNodo: esteRepaso.idNodo },
            })
          "
        >
          <img src="@/assets/iconos/expand.svg" alt="Expandir" />
        </div>
        <div class="boton" title="Ver en el atlas" @click="$emit('centrarEnNodo')">
          <img src="@/assets/iconos/nodos.svg" alt="Nodos" />
        </div>
        <div
          class="boton"
          title="Programar repasos"
          @click="$emit('toggleAbierto')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path
            d="M256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512zM232 256C232 264 236 271.5 242.7 275.1L338.7 339.1C349.7 347.3 364.6 344.3 371.1 333.3C379.3 322.3 376.3 307.4 365.3 300L280 243.2V120C280 106.7 269.3 96 255.1 96C242.7 96 231.1 106.7 231.1 120L232 256z"
            :fill="esteRepaso.porcentajeIntervaloTranscurrido>=100?'var(--atlasConocimientoRepaso)':''"
          />
        </svg>
        </div>
      </div>
    </div>
    <div id="zonaIteraciones" v-show="mostrarRepasos">
      <div id="listaIteraciones">
        <iteracion-repaso
          v-for="(iteracion, index) of esteRepaso.iteracionesRepaso"
          :key="iteracion.id"
          :primero="index===0"
          :porcentajeIntervaloTranscurrido="esteRepaso.porcentajeIntervaloTranscurrido"
          :urgente="index===0 && Date.now()>(new Date(esteRepaso.estudiado).getTime()+iteracion.intervalo)"
          :estaIteracion="iteracion"
          :idNodo="esteRepaso.idNodo"
          @meElimine="eliminarIteracionCache(iteracion.id)"
        />
        <div
        class="boton"
        title="Crear nuevo repaso"
        id="botonCrearIteracionRepaso"
        v-show="!creandoIteracion"
        @click="crearIteracion"
      >
        <img src="@/assets/iconos/plusCircle.svg" alt="Plus" />
      </div>
      <loading texto="" v-show="creandoIteracion" />
      </div>
      
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";
import IteracionRepaso from "./IteracionRepaso.vue";
import { QUERY_DATOS_USUARIO_NODOS } from "./fragsAtlasConocimiento.js";

export default {
  components: { IteracionRepaso, Loading },
  name: "ItemRepaso",
  props: {
    esteRepaso: Object,
    mostrarRepasos: Boolean
  },
  data() {
    return {
      creandoIteracion: false,
    };
  },
  methods: {
    crearIteracion() {
      var intervalo = null;
      this.creandoIteracion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idUsuario: ID!, $idNodo: ID!, $intervalo: Int) {
              crearIteracionRepasoNodoConocimientoUsuario(
                idUsuario: $idUsuario
                idNodo: $idNodo
                intervalo: $intervalo
              ) {
                id
                iteracionesRepaso {
                  id
                  intervalo
                }
              }
            }
          `,
          variables: {
            idUsuario: this.usuario.id,
            idNodo: this.esteRepaso.idNodo,
            intervalo: intervalo,
          },
        })
        .then(() => {
          this.creandoIteracion = false;
        })
        .catch((error) => {
          this.creandoIteracion = false;
          console.log(`Error: ${error}`);
        });
    },
    eliminarIteracionCache(idIteracion) {      
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_DATOS_USUARIO_NODOS,
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      var elDatoNodo = nuevoCache.yo.atlas.datosNodos.find(
        (dn) => dn.id === this.esteRepaso.id
      );
      var indexI = elDatoNodo.iteracionesRepaso.findIndex((i) => i.id === idIteracion);
      if (indexI > -1) {
        elDatoNodo.iteracionesRepaso.splice(indexI, 1);
        store.writeQuery({
          query: QUERY_DATOS_USUARIO_NODOS,
          data: nuevoCache,
        });
      } else {
        console.log(`La iteración no estaba en caché`);
      }
    },
  },
  computed:{
    colorBarraSuperior(){
      var color="transparent"
      if(this.mostrarRepasos){
        color="var(--mainColor)";
      }
      return {
        backgroundColor: color
      }
    }
  },
  mounted(){
    this.$emit("iniciado");
  }
};
</script>

<style scoped>
#barraSuperior {
  display: flex;
  padding: 20px 5px;
  padding-left: 15px;
  align-items: center;
  font-family: Salsa, cursive;
}
.contenedorControles {
  margin-left: auto;
}
#listaIteraciones {
  display: flex;
  flex-wrap: wrap;
  padding: 20px 5px;
  background-color: rgb(216, 216, 216);
  align-items: center;
}
#botonCrearIteracionRepaso{
  height: 28px;
  margin: 0px 10px;
}
</style>