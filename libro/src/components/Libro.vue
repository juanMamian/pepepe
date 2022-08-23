<template>
  <div class="libro" @click="idPaginaSeleccionada = null">
    <div id="zonaTitulo">
      <div id="titulo" v-show="!editandoTitulo">
        {{ libro.titulo }}
      </div>
      <input
        type="text"
        id="inputNuevoTitulo"
        :class="{ letrasRojas: nuevoTituloIlegal }"
        v-model="nuevoTitulo"
        v-show="editandoTitulo"
        @keypress.enter="guardarNuevoTitulo"
      />
      <div id="controlesTitulo">
        <img
          src="@/assets/iconos/editar.png"
          alt="Editar"
          id="bEditarrTitulo"
          class="bEditarTitulo"
          title="Editar titulo del libro"
          @click.stop="toggleEditandoTitulo"
        />
        <img
          src="@/assets/iconos/guardar.png"
          alt="Guardar"
          title="guardar"
          class="bEditarTitulo"
          id="bGuardarNuevoTitulo"
          v-show="editandoTitulo == true && nuevoTituloIlegal == false"
          @click.stop="guardarNuevoTitulo"
        />
      </div>
    </div>

    <img src="@/assets/iconos/loading.png" alt="Cargando" class="simboloLoading" style="width:50px; margin: 30px auto; display: block" v-show="$apollo.queries.libro.loading">

    <div id="contenedorPaginas">
      <pagina
        v-for="(pagina, index) of paginasOrdenadas"
        :key="pagina.id"
        :paginaDerecha="index % 2 > 0 || index == 0"
        :estaPagina="pagina"
        :idLibro="idLibro"
        :seleccionada="idPaginaSeleccionada == pagina.id"
        :segundoPlano="
          idPaginaSeleccionada != null && idPaginaSeleccionada != pagina.id
        "
        @click.native.stop="usuarioEditor || usuarioSuperadministrador?idPaginaSeleccionada = pagina.id:null"
        @meElimine="removePaginaFromCache(pagina.id)"
        @tengoNuevoCuadroTexto="updateCacheConNuevoCuadroTexto($event, pagina.id)"
        @tengoNuevoCuadroImagen="updateCacheConNuevoCuadroImagen($event, pagina.id)"
        @elimineCuadroTexto="removeCuadroTextoFromCache($event, pagina.id)"
        @elimineCuadroImagen="removeCuadroImagenFromCache($event, pagina.id)"
      />
    </div>

    <div
      id="bCrearNuevaPagina"
      @click.stop="crearNuevaPaginaLibro"
      :class="{ deshabilitado: creandoPagina }"
    >
      Crear nueva página
    </div>

    <div id="zonaForos">
      <div class="tituloForo">Foro de editores</div>
      <foro v-if="libro.idForo" :parent="infoAsParent" :idForo="libro.idForo"/>

    </div>



  </div>
</template>

<script>
import gql from "graphql-tag";
import Pagina from "./Pagina.vue";
import Foro from './Foro.vue';
const charProhibidosTitulo = /[^ a-zA-ZÀ-ž0-9_():.,-¿?¡!]/;

export const fragmentoCuadroTexto = gql`
  fragment fragCuadroTexto on CuadroTextoCuento {
    id
    texto
    posicionZeta
    posicion {
      x
      y
    }
    size {
      x
      y
    }
    audio {
      tipoReproduccion
    }
    formato {
      fontSize
      colorLetra
      tipoLetra
      alineacion
    }
  }
`;

export const fragmentoCuadroImagen = gql`
  fragment fragCuadroImagen on CuadroImagenCuento {
    id
    sinArchivo
    tipoActivacionSecundario
    posicionZeta
    posicion {
      x
      y
    }
    size {
      x
      y
    }
    audio {
      tipoReproduccion
    }
  }
`;

const fragmentoPagina = gql`
  fragment fragPagina on PaginaCuento {
    id    
    numPag
    color
    cuadrosTexto {
      ...fragCuadroTexto
    }
    cuadrosImagen {
      ...fragCuadroImagen
    }
  }
  ${fragmentoCuadroTexto}
  ${fragmentoCuadroImagen}
`;

const QUERY_LIBRO = gql`
  query($idLibro: ID!) {
    libro(idLibro: $idLibro) {
      id
      idsEditores
      titulo
      paginas {
        ...fragPagina
      },
      idForo
    }
  }
  ${fragmentoPagina}
`;

export default {
  components: { Pagina, Foro },
  name: "Libro",
  apollo: {
    libro: {
      query: QUERY_LIBRO,
      variables() {
        return {
          idLibro: this.idLibro,
        };
      },      
      skip() {
        return this.idLibro == null;
      },
      fetchPolicy:"cache-and-network"
    },
  },
  props: {
    idLibro: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      libro: {
        paginas: null,
      },
      idPaginaSeleccionada: null,

      creandoPagina: false,

      nuevoTitulo: null,
      editandoTitulo: false,
    };
  },
  computed: {
    paginasOrdenadas() {
      if (this.libro.paginas) {
        var aPags = this.libro.paginas;
        return aPags.sort((a, b) => {
          return parseInt(a.numPag) - parseInt(b.numPag);
        });
      }
      return [];
    },
    nuevoTituloIlegal() {
      if (!this.nuevoTitulo || this.nuevoTitulo.length < 1) {
        return true;
      }
      if (charProhibidosTitulo.test(this.nuevoTitulo)) {
        return true;
      }
      return false;
    },
    infoAsParent() {
      return {
        id: this.idLibro,
        tipo: "libro",
        nombre: this.libro.titulo,
      };
    },
    usuarioEditor(){
      return this.libro.idsEditores.includes(this.usuario.id);
    }
  },
  methods: {
    toggleEditandoTitulo() {
      this.editandoTitulo = !this.editandoTitulo;
      this.nuevoTitulo = this.libro.titulo;
    },
    guardarNuevoTitulo() {
      if (this.nuevoTituloIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoTitulo == this.libro.titulo) {
        this.editandoTitulo = false;
        return;
      }
      console.log(`guardando nuevo título`);
      this.enviandoNuevoTitulo = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idLibro: ID!, $nuevoTitulo: String!) {
              editarTituloLibro(idLibro: $idLibro, nuevoTitulo: $nuevoTitulo) {
                id
                titulo
              }
            }
          `,
          variables: {
            idLibro: this.idLibro,
            nuevoTitulo: this.nuevoTitulo,
          },
        })
        .then(() => {
          this.enviandoNuevoTitulo = false;
          this.editandoTitulo = false;
        })
        .catch((error) => {
          this.enviandoNuevoTitulo = false;
          console.log(`Error. E :${error}`);
        });
    },
    crearNuevaPaginaLibro() {
      this.creandoPagina = true;
      const dis = this;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idLibro: ID!) {
              crearNuevaPaginaLibro(idLibro: $idLibro) {
                ...fragPagina
              }
            }
            ${fragmentoPagina}
          `,
          variables: {
            idLibro: this.idLibro,
          },
        })
        .then(({ data: { crearNuevaPaginaLibro } }) => {
          var store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_LIBRO,
            variables: { idLibro: dis.idLibro },
          });
          var nuevoCache = JSON.parse(JSON.stringify(cache));
          nuevoCache.libro.paginas.push(crearNuevaPaginaLibro);
          store.writeQuery({
            query: QUERY_LIBRO,
            variables: { idLibro: dis.idLibro },
            data: nuevoCache,
          });
          this.creandoPagina = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.creandoPagina = false;
        });
    },
    removePaginaFromCache(idPagina) {
      this.idPaginaSeleccionada=null;
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_LIBRO,
        variables: { idLibro: this.idLibro },
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));

      const indexP = nuevoCache.libro.paginas.findIndex(
        (p) => p.id == idPagina
      );
      if (indexP > -1) {
        nuevoCache.libro.paginas.splice(indexP, 1);

        store.writeQuery({
          query: QUERY_LIBRO,
          variables: { idLibro: this.idLibro },
          data: nuevoCache,
        });        
      } else {
        console.log(`La pagina no estaba en el caché`);
      }
    },
    updateCacheConNuevoCuadroImagen(nuevoCuadroImagen, idPagina){
      console.log(`Se actualizara el cache con info: ${nuevoCuadroImagen} en la pagina ${idPagina}`);
      const store=this.$apollo.provider.defaultClient;
      const cache=store.readQuery({
        query: QUERY_LIBRO,
        variables:{idLibro:this.idLibro}
      });
      var nuevoCache=JSON.parse(JSON.stringify(cache));
      var laPagina=nuevoCache.libro.paginas.find(p=>p.id==idPagina);
      if(!laPagina){
        console.log(`Pagina no existía`);
        return
      }
      if(laPagina.cuadrosImagen.some(c=>c==nuevoCuadroImagen.id)){
        console.log(`Ese cuadro texto ya estaba incluido`);
        return;
      }
      
      laPagina.cuadrosImagen.push((nuevoCuadroImagen));

      store.writeQuery({
         query: QUERY_LIBRO,
        variables:{idLibro:this.idLibro},
        data:nuevoCache
      });

    },
    updateCacheConNuevoCuadroTexto(nuevoCuadroTexto, idPagina){
      console.log(`Se actualizara el cache con info: ${nuevoCuadroTexto} en la pagina ${idPagina}`);
      const store=this.$apollo.provider.defaultClient;
      const cache=store.readQuery({
        query: QUERY_LIBRO,
        variables:{idLibro:this.idLibro}
      });
      var nuevoCache=JSON.parse(JSON.stringify(cache));
      var laPagina=nuevoCache.libro.paginas.find(p=>p.id==idPagina);
      if(!laPagina){
        console.log(`Pagina no existía`);
        return
      }
      if(laPagina.cuadrosTexto.some(c=>c==nuevoCuadroTexto.id)){
        console.log(`Ese cuadro texto ya estaba incluido`);
        return;
      }
      laPagina.cuadrosTexto.push(nuevoCuadroTexto);

      store.writeQuery({
         query: QUERY_LIBRO,
        variables:{idLibro:this.idLibro},
        data:nuevoCache
      })
    },
    removeCuadroTextoFromCache(idCuadroTexto, idPagina){
      const store=this.$apollo.provider.defaultClient;
      const cache=store.readQuery({
        query:QUERY_LIBRO,
        variables:{idLibro:this.idLibro},        
      });
      var nuevoCache=JSON.parse(JSON.stringify(cache));

      var laPagina=nuevoCache.libro.paginas.find(p=>p.id==idPagina);
      if(!laPagina){
        console.log(`No existía la pagina en el caché`);
        return 
      }

      const indexC=laPagina.cuadrosTexto.findIndex(c=>c.id==idCuadroTexto);
      if(indexC>-1){
        laPagina.cuadrosTexto.splice(indexC, 1);
        store.writeQuery({
          query: QUERY_LIBRO,
          variables:{idLibro:this.idLibro},
          data: nuevoCache,
        });
      }
      else{
        console.log(`El cuadro texto no existía en el caché`);
      }
    },
    removeCuadroImagenFromCache(idCuadroImagen, idPagina){
      const store=this.$apollo.provider.defaultClient;
      const cache=store.readQuery({
        query:QUERY_LIBRO,
        variables:{idLibro:this.idLibro},        
      });
      var nuevoCache=JSON.parse(JSON.stringify(cache));

      var laPagina=nuevoCache.libro.paginas.find(p=>p.id==idPagina);
      if(!laPagina){
        console.log(`No existía la pagina en el caché`);
        return 
      }

      const indexC=laPagina.cuadrosImagen.findIndex(c=>c.id==idCuadroImagen);
      if(indexC>-1){
        laPagina.cuadrosImagen.splice(indexC, 1);
        store.writeQuery({
          query: QUERY_LIBRO,
          variables:{idLibro:this.idLibro},
          data: nuevoCache,
        });
      }
      else{
        console.log(`El cuadro texto no existía en el caché`);
      }
    }
  },
};
</script>

<style scoped>
.libro {
  margin: 100px 100px;
  border: 2px solid black;
  padding-bottom: 80vh;
}
#zonaTitulo {
  padding: 5px 10px;
  text-align: center;
  font-size: 22px;
  border: 1px solid purple;
  background-color: rgb(131 94 134);
  margin: 10px auto;
}
#inputNuevoTitulo{
  font-size: inherit;
}

.bEditarTitulo {
  cursor: pointer;
  border-radius: 50%;
  width: 35px;
  height: 35px;
}
.bEditarTitulo:hover {
  background-color: rgba(128, 0, 128, 0.459);
}

#contenedorPaginas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 20px;
}
#bCrearNuevaPagina {
  padding: 5px;
  border: 1px solid rgb(65, 0, 65);
  background-color: rgba(182, 105, 182, 0.267);
  cursor: pointer;
  margin: 10px auto;
  border-radius: 5px;
  max-width: 200px;
}

#bCrearNuevaPagina:hover {
  background-color: rgb(182, 105, 182);
}

.tituloForo{
  font-size: 19px;
  padding: 5px 10px;
  background-color: cadetblue;
}
</style>