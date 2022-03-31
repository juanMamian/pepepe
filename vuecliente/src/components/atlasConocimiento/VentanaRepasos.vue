<template>
  <div class="ventanaRepasos">
    <div id="barraSuperior">
      <div id="titulo">Temas para repasar</div>
      <div
        class="boton"
        id="botonCerrar"
        title="Cerrar"
        @click="$router.push({ name: 'atlas' })"
      >
        <img src="@/assets/iconos/equis.svg" alt="Equis" />
      </div>
    </div>
    <div id="zonaTemas">
      <div id="listaTemas">
        <item-repaso
          v-for="repaso of nodosRepasarOrdenados"
          :key="repaso.id"
          ref="itemsRepaso"
          :esteRepaso="repaso"
          :mostrarRepasos="idRepasoAbierto === repaso.id"
          @iniciado="contarIniciados"
          @toggleAbierto="toggleRepasoAbierto(repaso.id)"
          @meElimine="eliminarRepasoCache(repaso.id)"
          @centrarEnNodo="$emit('centrarEnNodo', repaso.idNodo)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { QUERY_DATOS_USUARIO_NODOS } from "./AtlasConocimiento.vue";
import ItemRepaso from "./ItemRepaso.vue";
export default {
  components: { ItemRepaso },
  name: "VentanaRepasos",
  props: {
    yo: Object,
    datosNodosRepasar: Array,
    datosNodosUrgentes: Array,
  },
  data() {
    return {
      idRepasoAbierto: null,
      iniciados: 0,
      scrollIndex: null,
    };
  },
  methods: {
    eliminarRepasoCache(idRepaso) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_DATOS_USUARIO_NODOS,
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      var indexI = nuevoCache.yo.atlas.repasos.findIndex(
        (r) => r.id === idRepaso
      );
      if (indexI > -1) {
        nuevoCache.yo.atlas.repasos.splice(indexI, 1);
        store.writeQuery({
          query: QUERY_DATOS_USUARIO_NODOS,
          data: nuevoCache,
        });
      } else {
        console.log(`El repaso no estaba en caché`);
      }
    },
    toggleRepasoAbierto(idRepaso) {
      if (idRepaso === this.idRepasoAbierto) {
        this.idRepasoAbierto = null;
      } else {
        this.idRepasoAbierto = idRepaso;
      }
    },
    contarIniciados() {
      this.iniciados++;
      console.log(`Iniciados: ${this.iniciados}`);
      if (this.iniciados === this.datosNodosRepasar.length) {
        console.log(`Todos completos`);
        if (this.$route.params.idRepaso) {
          const indexR = this.nodosRepasarOrdenados.findIndex(
            (nr) => nr.id === this.$route.params.idRepaso
          );
          if (indexR > -1) {
            this.scrollIndex = indexR;
          }
        }
      }
    },
  },
  computed: {
    nodosRepasarOrdenados() {
      var datos = this.datosNodosRepasar.map((dn) => {
        var tiempoRestanteToRepaso =
          new Date(dn.estudiado).getTime() +
          dn.iteracionesRepaso[0].intervalo -
          Date.now();

        var porcentajeIntervaloRestante = Math.round(
          (tiempoRestanteToRepaso * 100) / dn.iteracionesRepaso[0].intervalo
        );
        var porcentajeIntervaloTranscurrido = 100 - porcentajeIntervaloRestante;
        if (porcentajeIntervaloTranscurrido > 100)
          porcentajeIntervaloTranscurrido = 100;
        return {
          ...dn,
          tiempoRestanteToRepaso,
          porcentajeIntervaloRestante,
          porcentajeIntervaloTranscurrido,
        };
      });

      datos.sort((a, b) => a.tiempoRestanteToRepaso - b.tiempoRestanteToRepaso);
      return datos;
    },
  },
  mounted() {
    console.log(`Montada con id repaso: ${this.$route.params.idRepaso}`);
    this.idRepasoAbierto = this.$route.params.idRepaso;
    if (this.scrollIndex) {
      setTimeout(() => {
        console.log(`Scrolling into view el item ${this.scrollIndex}`);
        this.$refs.itemsRepaso[this.scrollIndex].$el.scrollIntoView();
      }, 500);
    }
  },
};
</script>

<style scoped>
.ventanaRepasos {
  width: min(500px, 100vw);
}
#barraSuperior {
  display: flex;
  padding: 10px;
  font-family: Salsa, cursive;
  font-size: 20px;
}
#botonCerrar {
  margin-left: auto;
}
#listaTemas {
  padding-bottom: 100px;
  overflow-y: scroll;
  height: min(700px, 80vh);
}
</style>