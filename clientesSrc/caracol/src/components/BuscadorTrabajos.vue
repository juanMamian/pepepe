<template>
  <div class="buscadorTrabajos">
    <div id="zonaCuadroBusqueda">
      <input
        type="text"
        id="inputBusqueda"
        placeholder="Buscar trabajo"
        v-model="textoBusqueda"
        @keypress.enter="buscarTrabajosDB"
      />
      <img
        src="@/assets/iconos/search.png"
        alt="Buscar"
        id="bBuscar"
        class="boton"
        title="Buscar trabajo"
        :class="{deshabilitado:!textoBusqueda}"
        @click.stop="buscarTrabajosDB"
      />
      <div id="textoBuscado" v-show="viendoBusqueda">
        {{ textoBuscado }}
        <div
          class="bCancelar"
          @click.stop="
            viendoBusqueda = false;
            anuncioTrabajosBuscados = null;
          "
        >
          <div class="linea1"><div class="linea2"></div></div>
        </div>
      </div>
    </div>
    <div id="anuncioTrabajosBuscados" v-show="anuncioTrabajosBuscados">
      {{ anuncioTrabajosBuscados }}
    </div>

    <div
      id="zonaListaTrabajos"
      ref="zonaListaTrabajos"
      @scroll="setPosicionIconoTrabajo()"
      @click.left.self="idTrabajoSeleccionado = null"
    >
      <div
        id="listaMisTrabajos"
        class="listaTrabajos"
        :class="{ opaco: idTrabajoSeleccionado != null }"
        v-if="usuarioLogeado"
        v-show="viendoBusqueda === false"
        @click="idTrabajoSeleccionado = null"
      >
        <div
          class="nombreTrabajo"
          :key="'nombreMT-' + trabajo.id"
          v-for="trabajo of misTrabajos"
          @dblclick.stop="
            idTrabajoSeleccionado = trabajo.id;
            setPosicionIconoTrabajo();
          "
        >
          <img
            src="@/assets/iconos/iconoTrabajo.png"
            alt=""
            class="simboloTrabajo simboloMiTrabajo"
            title="Haces parte de este trabajo"
          />
          {{ trabajo.nombre }}
          <img
            src="@/assets/iconos/ir.png"
            alt=""
            class="iconoAbrirTrabajo"
            @click.left.stop="
              idTrabajoSeleccionado = trabajo.id;
              setPosicionIconoTrabajo();
            "
          />
        </div>
      </div>

      <div
        id="listaTodosTrabajos"
        class="listaTrabajos"
        :class="{ opaco: idTrabajoSeleccionado != null }"
        v-show="viendoBusqueda === false"
        @click="idTrabajoSeleccionado = null"
      >
        <div
          class="nombreTrabajo"
          :key="'nombreT-' + infoTrabajo.id"
          v-for="infoTrabajo of todosTrabajos.infoTrabajos"
          v-show="
            !usuarioLogeado || !misTrabajos.some((t) => t.id === infoTrabajo.id)
          "
          @dblclick.stop="
            idTrabajoSeleccionado = infoTrabajo.id;
            setPosicionIconoTrabajo();
          "
        >
          <img
            src="@/assets/iconos/iconoTrabajo.png"
            alt=""
            class="simboloTrabajo"
          />
          {{ infoTrabajo.nombre }}
          <img
            src="@/assets/iconos/ir.png"
            alt=""
            class="iconoAbrirTrabajo"
            @click.left.stop="
              idTrabajoSeleccionado = infoTrabajo.id;
              setPosicionIconoTrabajo();
            "
          />
        </div>

        <div id="bCargarMasTodosTrabajos" v-show="todosTrabajos.hayMas">Más</div>
      </div>

      <div
        id="listaTrabajosBuscados"
        class="listaTrabajos"
        :class="{ opaco: idTrabajoSeleccionado != null }"
        v-show="viendoBusqueda === true"
        @click="idTrabajoSeleccionado = null"
      >
        <div
          class="nombreTrabajo"
          :key="'nombreTB-' + infoTrabajo.id"
          v-for="infoTrabajo of trabajosBuscados"
        >
          <img
            src="@/assets/iconos/iconoTrabajo.png"
            alt=""
            class="simboloTrabajo"
          />
          {{ infoTrabajo.nombre }}
          <img
            src="@/assets/iconos/ir.png"
            alt=""
            class="iconoAbrirTrabajo"
            @click.left.stop="
              idTrabajoSeleccionado = infoTrabajo.id;
              setPosicionIconoTrabajo();
            "
          />
        </div>
      </div>

      <icono-trabajo
        :key="infoTrabajo.id"
        :idTrabajo="infoTrabajo.id"
        :style="posicionIconoTrabajo"
        v-for="infoTrabajo of trabajosSeleccionables"
        v-show="idTrabajoSeleccionado === infoTrabajo.id"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import IconoTrabajo from "./proyecto/IconoTrabajo.vue";

const QUERY_TODOS_TRABAJOS = gql`
  query($pagina: Int!) {
    listaTodosTrabajosProyectos(pagina: $pagina) {
      hayMas
      infoTrabajos {
        id
        nombre
      }
    }
  }
`;

const QUERY_BUSQUEDA_TRABAJOS = gql`
  query($textoBusqueda: String!) {
    busquedaTrabajosProyectos(textoBusqueda: $textoBusqueda) {
      id
      nombre
    }
  }
`;

const QUERY_MIS_TRABAJOS = gql`
  query($idUsuario: ID!) {
    trabajosDeProyectoDeUsuario(idUsuario: $idUsuario) {
      id
      nombre
    }
  }
`;

export default {
  components: { IconoTrabajo },
  name: "BuscadorTrabajos",
  apollo: {
    todosTrabajos: {
      query: QUERY_TODOS_TRABAJOS,
      variables: {
        pagina: 0,
      },
      update({ listaTodosTrabajosProyectos }) {
        return listaTodosTrabajosProyectos;
      },
    },
    misTrabajos: {
      query: QUERY_MIS_TRABAJOS,
      variables() {
        return {
          idUsuario: this.usuario.id,
        };
      },
      update({ trabajosDeProyectoDeUsuario }) {
        return trabajosDeProyectoDeUsuario;
      },
      skip() {
        return !this.usuarioLogeado;
      },
    },
  },
  data() {
    return {
      todosTrabajos: {
        hayMas: true,
        infoTrabajos: [],
      },
      misTrabajos: [],
      trabajosBuscados: [],

      textoBusqueda: null,
      textoBuscado: null,
      paginaTodosTrabajos: 0,
      loadingMasTodosTrabajos: false,
      hayMasTodosTrabajos: true,
      idTrabajoSeleccionado: null,

      posicionIconoTrabajo: {
        top: "0px",
      },

      viendoBusqueda: false,
      buscando: false,
      anuncioTrabajosBuscados: null,
    };
  },
  methods: {
    getMoreTodasActividades() {
      this.paginaTodosTrabajos++;
      console.log(`Fetching more todosTrabajos`);
      this.loadingMasTodosTrabajos = true;
      this.$apollo.queries.todosTrabajos
        .fetchMore({
          variables: {
            pagina: this.paginaTodosTrabajos,
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            const masinfoTrabajos =
              fetchMoreResult.listaTodosTrabajosProyectos.infoTrabajos;
            const hayMas = fetchMoreResult.listaTodosTrabajosProyectos.hayMas;

            this.hayMasTodosTrabajos = hayMas;

            return {
              listaTodosTrabajosProyectos: {
                __typename:
                  previousResult.listaTodosTrabajosProyectos.__typename,
                infoTrabajos: [
                  ...previousResult.listaTodosTrabajosProyectos.infoTrabajos,
                  ...masinfoTrabajos,
                ],
                hayMas,
              },
            };
          },
        })
        .then(() => {
          this.loadingMasTodasActividades = false;
        })
        .catch((error) => {
          this.loadingMasTodasActividades = false;
          console.log(`Error en fetchMore: E: ${error}`);
        });
    },
    setPosicionIconoTrabajo() {
      const scrollLista = this.$refs.zonaListaTrabajos.scrollTop;
      this.$set(this.posicionIconoTrabajo, "top", scrollLista + "px");
    },
    buscarTrabajosDB() {
      if (!this.textoBusqueda || this.textoBusqueda.length < 1) {
        return;
      }
      this.anuncioTrabajosBuscados = "Buscando...";
      console.log(`Refetching búsqueda`);
      this.$apollo
        .query({
          query: QUERY_BUSQUEDA_TRABAJOS,
          variables: {
            textoBusqueda: this.textoBusqueda,
          },
          error(error) {
            console.log(`Error: ${error}`);
          },
        })
        .then(({ data: { busquedaTrabajosProyectos } }) => {
          //console.log(`Busqueda concluida. Res: ${JSON.stringify(res)}`);
          if (busquedaTrabajosProyectos.length < 1) {
            this.anuncioTrabajosBuscados = "¡No se encontraron trabajos!";
          } else {
            this.anuncioTrabajosBuscados = null;
          }
          this.textoBuscado = this.textoBusqueda;
          this.trabajosBuscados = busquedaTrabajosProyectos;
          this.viendoBusqueda = true;
        })
        .catch((error) => {
          this.anuncioTrabajosBuscados = "¡Ocurrió un error con tu búsqueda!";
          console.log(`Error. E: ${error}`);
        });
    },
  },
  computed: {
    trabajosSeleccionables() {
      const idsTodos = this.todosTrabajos.infoTrabajos.map((t) => t.id);
      const idsMisTrabajos = this.misTrabajos.map((t) => t.id);
      return [
        ...this.todosTrabajos.infoTrabajos,
        ...this.misTrabajos.filter((t) => !idsTodos.includes(t.id)),
        ...this.trabajosBuscados.filter((t) => !idsTodos.includes(t.id) && !idsMisTrabajos.includes(t.id))
      ];
      
    },
  },
};
</script>

<style scoped>
#zonaCuadroBusqueda {
  margin-top: 50px;
  margin-bottom: 50px;
}
#inputBusqueda {
  font-size: 16px;
  border-radius: 7px;
  padding: 3px 5px;
  margin: 5px auto;
  display: block;
}
#textoBuscado {
  margin: 10px auto;
  font-size: 15px;
  font-style: italic;
  color: rgb(87, 87, 87);
  justify-content: center;
  display: flex;
}
#zonaListaTrabajos {
  position: relative;
  overflow-y: scroll;
  min-height: 800px;

  max-height: 850px;
  width: max(800px, 90%);
  border: 2px solid rgb(4, 4, 68);
  margin: 10px auto;
  border-radius: 20px;
}
.listaTrabajos {
  display: grid;
  grid-template-columns: 5fr 1fr;
  width: 96%;
  margin: 10px auto;
  height: 100%;
}

#anuncioTrabajosBuscados {
  font-style: italic;
  color: rgb(43, 43, 43);
  text-align: center;
}

.iconoTrabajo {
  position: absolute;
  top: 10px;
  left: 5%;
  width: 90%;
  opacity: 1;
  z-index: 10;
}
.simboloTrabajo {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border-radius: 50%;
  padding: 3px;
}
.simboloMiTrabajo {
  background-color: rgb(184, 98, 184);
}
.nombreTrabajo {
  padding: 5px 10px;
  font-size: 16px;
  grid-column: 1/2;
  cursor: pointer;
}
.nombreTrabajo:hover {
  background-color: bisque;
}
.iconoAbrirTrabajo {
  width: 20px;
  height: 20px;
  float: right;
  cursor: pointer;
  border-radius: 50%;
  padding: 5px;
}
.iconoAbrirTrabajo:hover {
  background-color: cadetblue;
}
.bCancelar {
  width: 20px;
  height: 20px;
  background-color: rgb(255, 113, 113);
  border: 1px solid black;
  position: relative;
  border-radius: 50%;
  margin-left: 10px;
  cursor: pointer;
}
.bCancelar:hover {
  background-color: red;
}

.linea1 {
  height: 16px;
  width: 2px;
  margin-top: 2px;
  margin-left: 9px;
  background-color: black;
  transform: rotate(45deg);
  z-index: 1;
}

.linea2 {
  height: 16px;
  width: 2px;
  background-color: black;
  transform: rotate(90deg);
  z-index: 2;
}

#bBuscar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  margin: 0px auto;
  display: block;
}

#bBuscar:hover {
  background-color: cadetblue;
}
#bCargarMasTodosTrabajos{
  cursor: pointer;
  text-align: center;
  max-width: 200px;
  margin: 5px auto;
  grid-column: 1/3;
}
#bCargarMasTodosTrabajos:hover{
  background-color: royalblue;
}
</style>

