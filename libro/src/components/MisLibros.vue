<template>
  <div id="misLibros">
    <h3>Mis libros</h3>
    <div id="controlesMisLibros">
      <img
        src="@/assets/iconos/libro.png"
        class="bControlMisLibros"
        title="Crear nuevo libro"
        @click="crearNuevoLibro"
      />
    </div>

    <div id="listaMisLibros">
        <div class="portadaLibro" v-for="portada of misLibros" :key="portada.id" @click="seleccionarLibro(portada.id)">
            {{portada.titulo}}
        </div>
    </div>
  </div>
</template>

<script>
import { gql } from "apollo-server-core";

const QUERY_MIS_LIBROS = gql`
  query {
    misLibros {
      id
      titulo
    }
  }
`;

export default {
  name: "MisLibros",
  apollo: {
    misLibros: {
      query: QUERY_MIS_LIBROS,
      skip() {
        return this.usuario.id==null;
      },
    },
  },
  data() {
    return {
    };
  },
  methods: {
    crearNuevoLibro() {
      if (!confirm("¿Crear un nuevo libro?")) return;

      this.$apollo.mutate({
        mutation: gql`
          mutation {
            crearNuevoLibro {
              id
              titulo
            }
          }
        `,
      }).then(({data:{crearNuevoLibro}})=>{
          console.log(`Creado ${JSON.stringify(crearNuevoLibro)}`);
          const store=this.$apollo.provider.defaultClient;
          const cache=store.readQuery({
            query:QUERY_MIS_LIBROS,            
          });
          var nuevoCache=JSON.parse(JSON.stringify(cache));
          if(!nuevoCache.misLibros.some(l=>l.id==crearNuevoLibro.id)){
            nuevoCache.misLibros.push(crearNuevoLibro);
            store.writeQuery({
              query:QUERY_MIS_LIBROS,
              data:nuevoCache
            });
          }
          else{
            console.log(`El libro ya estaba incluido en el caché`);
          }
      });
    },
    seleccionarLibro(idLibro){
        this.$emit("libroSeleccionado", idLibro);
    }
  },
  
};
</script>

<style scoped>
#misLibros {
  padding: 10px;
  border: 2px solid cadetblue;
  margin: 10px;
  border-radius: 15px;
  padding: 15px;
  font-size: 22px;
}

.bControlMisLibros {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  margin: 5px 10px;
}
.bControlMisLibros:hover {
  background-color: rgb(241, 153, 241);
}

.portadaLibro{
    padding: 5px 10px;
    font-size: inherit;
    cursor:pointer
}
.portadaLibro:hover{
    background-color: rgba(128, 0, 128, 0.233);
}
</style>