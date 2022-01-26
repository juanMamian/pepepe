<template>
  <div class="listaEventosEspacio">
    <evento-item-lista
      :esteEvento="evento"
      v-for="evento of eventosPublicosEspacio"
      :key="evento.id"
      :seleccionado="idEventoSeleccionado === evento.id"
      @meElimine="deleteEventoCache(evento); $emit('eventoEliminado', evento)"
    />
  </div>
</template>

<script>
import gql from "graphql-tag";
import { fragmentoEventoPublico } from "./utilidades/fragsCalendario";
import EventoItemLista from "./EventoItemLista.vue";
const QUERY_EVENTOS_PUBLICOS_ESPACIO = gql`
  query ($idEspacio: ID!) {
    eventosPublicosEspacio(idEspacio: $idEspacio) {
      ...fragEventoPublico
    }
  }
  ${fragmentoEventoPublico}
`;

export default {
  components: { EventoItemLista },
  props: {
    idEspacio: String,
  },
  name: "ListaEventosEspacio",
  apollo: {
    eventosPublicosEspacio: {
      query: QUERY_EVENTOS_PUBLICOS_ESPACIO,
      variables() {
        return {
          idEspacio: this.idEspacio,
        };
      },
    },
  },
  data() {
    return {
      idEventoSeleccionado: null,
    };
  },
  methods: {
     deleteEventoCache(evento) {
      const tipoEvento=evento.__typename.charAt(0).toLowerCase()+evento.__typename.slice(1);      
      var infoQuery = null;
      if (tipoEvento === "eventoPublico") {
        infoQuery = {
          query: QUERY_EVENTOS_PUBLICOS_ESPACIO,
          variables: {
            idEspacio: this.idEspacio,
          },
        };
      }
      else if(tipoEvento==='eventoPersonal'){
        console.log(`add cache eventos personales not developed`);
        return 
      }
      else{
        console.log(`Tipo evento ${tipoEvento} no reconocido`);
        return;
      }
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        ...infoQuery
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      var listaEventosCache=null;
      if(tipoEvento==='eventoPublico'){
        listaEventosCache=nuevoCache.eventosPublicosEspacio;
      }
      else if(tipoEvento==='eventoPersonal'){
        listaEventosCache=nuevoCache.eventosPersonalesEspacio;
      }
      const indexE = listaEventosCache.findIndex(
        (e) => e.id === evento.id
      );
      if (indexE > -1) {
        listaEventosCache.splice(indexE, 1);

        store.writeQuery({
          ...infoQuery,
          data: nuevoCache,
        });
      }
    },
    addEventoCache(evento) {
      const tipoEvento=evento.__typename.charAt(0).toLowerCase()+evento.__typename.slice(1);      
      var infoQuery = null;
      if (tipoEvento === "eventoPublico") {
        infoQuery = {
          query: QUERY_EVENTOS_PUBLICOS_ESPACIO,
          variables: {
            idEspacio: this.idEspacio,
          },
        };
      }
      else if(tipoEvento==='eventoPersonal'){
        console.log(`add cache eventos personales not developed`);
        return 
      }
      else{
        console.log(`Tipo evento ${tipoEvento} no reconocido`);
        return;
      }
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        ...infoQuery
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      var listaEventosCache=null;
      if(tipoEvento==='eventoPublico'){
        listaEventosCache=nuevoCache.eventosPublicosEspacio;
      }
      else if(tipoEvento==='eventoPersonal'){
        listaEventosCache=nuevoCache.eventosPersonalesEspacio;
      }
      const indexE = listaEventosCache.findIndex(
        (e) => e.id === evento.id
      );
      if (indexE === -1) {
        listaEventosCache.push(evento);

        store.writeQuery({
          ...infoQuery,
          data: nuevoCache,
        });
      }
    },
  },
};
</script>

<style scoped>
.listaEventosEspacio{
  overflow-y: scroll;
  overflow-x: hidden;
}
.eventoItemLista{
  margin: 15px 0px;
}
</style>