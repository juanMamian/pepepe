<template>
  <div class="gestorColecciones">
    <div
      id="zonaTitulo"
      :style="[estiloZonaTitulo]"
      v-show="!conectandoNodosColeccion"
    >
      <div
        id="nombreColeccion"
        :class="{ desplegandoLista, mostrandoArbol }"
        @click.stop="desplegandoLista = !desplegandoLista"
      >
        <div
          v-show="
            coleccionSeleccionadaNullificable &&
            !$apollo.queries.coleccionSeleccionada.loading
          "
          class="boton"
          :class="{ activo: mostrandoArbol }"
          id="botonMostrarArbol"
          @click.stop="toggleMostrandoArbol"
        >
          <img
            src="@/assets/iconos/atlas/userNodes.png"
            alt="Colección"
            id="iconoColeccionSeleccionada"
          />
        </div>
        <loading v-show="this.$apollo.queries.coleccionSeleccionada.loading" />
        <span style="z-index: 1">
          {{
            coleccionSeleccionadaNullificable
              ? coleccionSeleccionada.nombre || "Atlas"
              : "Atlas"
          }}
        </span>

        <div id="listaSelectoresColeccion" v-show="desplegandoLista">
          <div
            class="selectorColeccion"
            @click.stop="setIdColeccionSeleccionada(null)"
            v-show="idColeccionSeleccionada"
          >
            <img
              src="@/assets/iconos/userNodes.png"
              alt="Coleccion"
              style="height: 15px"
            />
            Atlas
          </div>
          <div
            class="selectorColeccion"
            @click.stop="setIdColeccionSeleccionada(coleccion.id)"
            v-for="coleccion of coleccionesEnriquecidas.filter(
              (col) => idColeccionSeleccionada != col.id
            )"
            :key="coleccion.id"
          >
            <img
              src="@/assets/iconos/userNodes.png"
              alt="Coleccion"
              style="height: 15px"
            />
            {{ coleccion.nombre }}
          </div>
          <div
            class="botonTexto"
            @click.stop="iniciarCreacionColeccion"
            id="botonCrearColeccion"
          >
            <img src="@/assets/iconos/plusCircle.svg" alt="Nuevo" />
            <span>Crear colección</span>
          </div>
        </div>

        <div
          class="boton"
          id="botonMostrarOpcionesColeccion"
          v-if="coleccionSeleccionadaNullificable"
          v-show="!desplegandoLista"
          @click.stop="mostrandoOpcionesColeccion = !mostrandoOpcionesColeccion"
        >
          <img
            src="@/assets/iconos/ellipsisVertical.svg"
            alt="Opciones"
            style=""
          />
        </div>
      </div>
    </div>
    <div
      id="contenedorOpciones"
      v-show="mostrandoOpcionesColeccion && !conectandoNodosColeccion"
      v-if="coleccionSeleccionadaNullificable"
    >
      <div
        class="botonOpcion botonTexto selector"
        id="botonConectarNodosColeccion"
        v-show="!conectandoNodosColeccion && !mostrandoArbol"
        @click.stop="conectandoNodosColeccion = true"
      >
        <img src="@/assets/iconos/plugSolid.svg" alt="Conectar" />
      </div>
      <div
        class="botonOpcion boton"
        @click.stop="iniciarEdicionNombreColeccion"
      >
        <img src="@/assets/iconos/edit.svg" alt="Editar" />
      </div>
      <div
        class="botonOpcion boton"
        @click.stop="eliminarColeccion"
        v-show="mostrandoArbol"
      >
        <loading v-show="eliminandoColeccion" />
        <img
          src="@/assets/iconos/trash.svg"
          alt="Eliminar"
          v-show="!eliminandoColeccion"
        />
      </div>
    </div>
    <div
      class="anuncio anuncioSeleccion"
      id="anuncioConectandoNodos"
      v-show="conectandoNodosColeccion"
    >
      <img src="@/assets/iconos/plugSolid.svg" alt="Nodos" />
      Editando nodos de la coleccion
      <div
        class="boton"
        id="botonCancelarConectarNodosColeccion"
        v-show="!idNodoSeleccionado"
        @click.stop="conectandoNodosColeccion = false"
      >
        <img src="@/assets/iconos/equis.svg" alt="Cancelar" />
      </div>
    </div>

    <div
      v-if="
        conectandoNodosColeccion &&
        coleccionSeleccionadaNullificable &&
        idNodoSeleccionado
      "
      class="botonTexto"
      id="botonToggleNodoColeccion"
      @click.stop="toggleNodoColeccion"
    >
      <Loading v-show="togglingNodoColeccion" />
      <img
        src="@/assets/iconos/plugSolid.svg"
        alt="Conectar"
        v-show="!nodoSeleccionadoBelongs && !togglingNodoColeccion"
      />
      <img
        src="@/assets/iconos/equis.svg"
        alt="Desconectar"
        v-show="nodoSeleccionadoBelongs && !togglingNodoColeccion"
      />
      <span>{{ nodoSeleccionadoBelongs ? "Desconectar" : "Conectar" }}</span>
    </div>
    <transition name="travelBottom" appear>
      <div
        ref="diagramaPersonal"
        id="diagramaPersonal"
        v-if="coleccionSeleccionadaNullificable"
        v-show="mostrandoArbol"
      >
        <div id="iconoProgresoUsuario" :style="[estiloIconoProgresoUsuario]">
          <pie-progreso
            :progreso="coleccionSeleccionada.progreso"
            :size="120"
            :factorArco="0.1"
            colorFondo="transparent"
          >
            <div id="contenedorFotoUsuario">
              <img
                ref="imagenUsuario"
                :src="serverUrl + '/api/usuarios/fotografias/' + usuario?.id"
                alt="Fotografía"
              />
            </div>
          </pie-progreso>
          <div
            id="indicadorProgreso"
            v-if="coleccionSeleccionadaNullificable"
            v-show="coleccionSeleccionada?.progreso"
          >
            {{ coleccionSeleccionada.progreso }}%
          </div>
        </div>
        <diagrama-arbol
          v-if="coleccionSeleccionadaNullificable && mostrandoArbol"
          ref="diagramaArbol"
          :visible="mostrandoArbol"
          :idsRoot="coleccionSeleccionadaNullificable.idsNodos"
          :idsRed="coleccionSeleccionadaNullificable.idsRed"
        ></diagrama-arbol>
      </div>
    </transition>
    <teleport to="body">
      <div
        id="splashCrearColeccion"
        class="bloqueSplash"
        v-show="preparandoNuevaColeccion"
      >
        <div class="botonEquis">
          <img
            src="@/assets/iconos/equis.svg"
            alt="Salir"
            @click.stop="preparandoNuevaColeccion = false"
          />
        </div>
        <div class="tituloSplash">
          <img src="@/assets/iconos/userNodes.png" alt="Coleccion" />
          <span>Crear una colección</span>
        </div>
        <div class="descripcionSplash">
          Ingresa el nombre de la nueva colección
        </div>
        <input
          type="text"
          ref="inputNombreNuevaColeccion"
          @keypress.enter="$refs.botonCrearNuevaColeccion.click()"
        />
        <div
          class="botonTexto"
          @click="crearNuevaColeccion"
          ref="botonCrearNuevaColeccion"
        >
          Crear
        </div>
      </div>

      <div
        class="bloqueSplash"
        id="splashEditarColeccion"
        v-if="coleccionSeleccionadaNullificable && editandoColeccion"
      >
        <div class="botonEquis" @click="editandoColeccion = false">
          <img src="@/assets/iconos/equis.svg" alt="Salir" />
        </div>
        <div class="tituloSplash">
          <img src="@/assets/iconos/edit.svg" alt="Editar" />
          <span>Editando {{ coleccionSeleccionadaNullificable.nombre }}</span>
        </div>
        <div class="descripcionSplash">
          Introduce un nuevo nombre para esta colección.
        </div>
        <input
          type="text"
          ref="inputNuevoNombreColeccion"
          @keypress.enter="$refs.botonGuardarNuevoNombreColeccion.click()"
        />

        <div
          class="botonTexto"
          @click="guardarNuevoNombreColeccion"
          ref="botonGuardarNuevoNombreColeccion"
          :class="{ deshabilitado: guardandoNuevoNombreColeccion }"
        >
          <loading v-show="guardandoNuevoNombreColeccion" />
          <img
            src="@/assets/iconos/save.svg"
            alt="Guardar"
            v-show="!guardandoNuevoNombreColeccion"
          />
          Guardar
        </div>
      </div>
    </teleport>
  </div>
</template>
<script>
import { gql } from "@apollo/client/core";
import PieProgreso from "@/components/utilidades/PieProgreso.vue";
import Loading from "@/components/utilidades/Loading.vue";
import NodoConocimientoVistaArbol from "@/components/atlasConocimiento/NodoConocimientoVistaArbol.vue";
import DiagramaArbol from "./diagramaArbol.vue";
import { validarNombreCosa } from "../../utilidades/validacion";
import { fragmentoColecciones } from "./fragsAtlasConocimiento";

export default {
  name: "GestorColecciones",
  components: {
    PieProgreso,
    Loading,
    NodoConocimientoVistaArbol,
    DiagramaArbol,
  },
  props: {
    yo: {
      type: Object,
      required: true,
    },
    todosNodos: {
      type: Array,
      default: [],
    },
    idNodoSeleccionado: {
      type: String,
      default: "",
    },
  },
  apollo: {
    coleccionSeleccionada: {
      query: gql`
        query ($idColeccion: ID!, $idUsuario: ID!) {
          coleccionNodosConocimiento(
            idColeccion: $idColeccion
            idUsuario: $idUsuario
          ) {
            id
            nombre
            progreso
            idsNodos
            idsRed
          }
        }
      `,
      variables() {
        return {
          idColeccion: this.idColeccionSeleccionada,
          idUsuario: this.usuario?.id,
        };
      },
      update({ coleccionNodosConocimiento }) {
        return coleccionNodosConocimiento;
      },
      skip() {
        return !this.idColeccionSeleccionada;
      },
      fetchPolicy: "cache-and-network",
    },
  },
  data() {
    return {
      editandoColeccion: false,
      guardandoNuevoNombreColeccion: false,

      eliminandoColeccion: false,

      preparandoNuevaColeccion: false,
      creandoNuevaColeccion: false,

      montado: false,
      anchoContenedorArbol: null,
      refreshLineaHorizontal: 0,

      coleccionSeleccionada: {
        idsNodos: [],
        idsRed: [],
      },
      desplegandoLista: false,
      idColeccionSeleccionada: null,
      mostrandoOpcionesColeccion: false,
      conectandoNodosColeccion: false,
      togglingNodoColeccion: false,
    };
  },
  computed: {
    mostrandoArbol() {
      return this.$route.name === "coleccionNodosConocimiento";
    },
    nodoTargetRelevante() {
      return (
        this.idNodoTarget &&
        this.coleccionSeleccionadaNullificable?.idsRed.includes(
          this.idNodoTarget
        )
      );
    },
    nodoSeleccionadoBelongs() {
      if (!this.idNodoSeleccionado || !this.coleccionSeleccionadaNullificable) {
        return false;
      }
      return this.coleccionSeleccionadaNullificable.idsNodos.includes(
        this.idNodoSeleccionado
      );
    },
    estiloZonaTitulo() {
      let width = "fit-content";
      if (this.mostrandoArbol) {
        width = "100%";
      }
      return {
        width,
      };
    },
    estiloIconoProgresoUsuario() {
      let left = "50%";
      let anchoAjustado = this.anchoContenedorArbol;
      if (anchoAjustado) {
        left = anchoAjustado / 2 + "px";
      }
      return {
        left: left,
      };
    },
    coleccionesEnriquecidas() {
      if (!this.yo.atlas?.colecciones) return [];

      return this.yo.atlas.colecciones.map((col) => {
        //Get first nodes and go level by level finding dependencies.
        let idsNodosActuales = col.idsNodos;

        let idsCompletos = [...idsNodosActuales];
        let guarda = 0;

        while (idsNodosActuales.length > 0 && guarda < 100) {
          guarda++;
          let nodosActuales = this.todosNodos.filter((nodo) =>
            idsNodosActuales.includes(nodo.id)
          );
          let idsSiguientes = nodosActuales
            .map((nodo) =>
              nodo.vinculos
                .filter((v) => v.tipo === "continuacion" && v.rol == "target")
                .map((vinculo) => vinculo.idRef)
            )
            .flat();
          idsCompletos.push(...idsSiguientes);
          idsNodosActuales = idsSiguientes;
        }

        return {
          ...col,
          idsRedNodos: idsCompletos,
        };
      });
    },
    coleccionSeleccionadaNullificable() {
      if (!this.idColeccionSeleccionada) {
        return null;
      }

      return this.coleccionSeleccionada;
    },
  },
  methods: {
    toggleMostrandoArbol() {
      if (!this.idColeccionSeleccionada) {
        return;
      }
      if (!this.mostrandoArbol) {
        this.$router.push({
          name: "coleccionNodosConocimiento",
          params: { idColeccion: this.idColeccionSeleccionada },
        });
        return;
      }
      console.log("regresando ruta");
      this.$router.push({ name: "atlas" });
    },
    iniciarEdicionNombreColeccion() {
      if (!this.coleccionSeleccionadaNullificable) {
        console.log(
          "Error tratando de editar nombre de colección mientras no había colección seleccionada"
        );
      }
      this.editandoColeccion = true;
      this.inputNombreEditarColeccion =
        this.coleccionSeleccionadaNullificable.nombre;
    },
    guardarNuevoNombreColeccion() {
      if (!this.coleccionSeleccionadaNullificable) {
        console.log(
          "Error: Tratando de guardar un nuevo nombre de colección pero no hay colección seleccionada"
        );
        return;
      }
      let nuevoNombre = this.$refs.inputNuevoNombreColeccion.value;
      if (!nuevoNombre) {
        console.log("Se debe introducir un nombre");
        this.raiseAccion("Debes escribir un nombre");
        return;
      }
      nuevoNombre = nuevoNombre.trim();
      if (!validarNombreCosa()) {
        console.log("Nombre no válido");
        return;
      }
      if (nuevoNombre === this.coleccionSeleccionadaNullificable.nombre) {
        this.raiseAccion("El nombre no ha sido modificado");
        return;
      }
      let idColeccion = this.coleccionSeleccionadaNullificable.id;

      this.guardandoNuevoNombreColeccion = true;
      this.mostrandoOpcionesColeccion = false;
      console.log("Se guardará la colección con nuevo nombre: " + nuevoNombre);
      this.enviandoOperacion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($nuevoNombre: String!, $idColeccion: ID!) {
              setNombreColeccionNodosAtlasConocimientoUsuario(
                nuevoNombre: $nuevoNombre
                idColeccion: $idColeccion
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            nuevoNombre,
            idColeccion,
          },
        })
        .then(() => {
          this.guardandoNuevoNombreColeccion = false;
          this.raiseAccion("Nombre de colección guardado");
          this.$apollo.queries.coleccionSeleccionada.refetch();
        })
        .catch((error) => {
          console.log("Error: " + error);
          this.guardandoNuevoNombreColeccion == false;
        });
    },
    eliminarColeccion() {
      console.log("Eliminando colección seleccionada");
      if (!this.coleccionSeleccionadaNullificable) {
        return;
      }
      if (
        !confirm(
          "¿Confirmar la eliminación de la colección? (Esta acción no puede deshacerse)"
        )
      ) {
        return;
      }
      let idColeccion = this.coleccionSeleccionadaNullificable.id;
      console.log("con id " + idColeccion);
      this.eliminandoColeccion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idColeccion: ID!) {
              eliminarColeccionNodosAtlasConocimientoUsuario(
                idColeccion: $idColeccion
              )
            }
          `,
          variables: {
            idColeccion,
          },
        })
        .then(() => {
          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: gql`
              query {
                yo {
                  atlas {
                    colecciones {
                      ...fragColecciones
                    }
                  }
                }
              }
              ${fragmentoColecciones}
            `,
          });
          let nuevoCache = JSON.parse(JSON.stringify(cache));
          let indexC = nuevoCache.yo.atlas.colecciones.findIndex(
            (c) => c.id === idColeccion
          );
          if (indexC < 0) {
            console.log("La colección no estaba en el caché");
            return;
          }
          nuevoCache.yo.atlas.colecciones.splice(indexC, 1);

          // Seleccionar el index de la colección que quedará seleccionada.
          if (nuevoCache.yo.atlas.colecciones.length < 1) {
            this.idColeccionSeleccionada = null;
          } else {
            let siguienteIndex = indexC - 1;
            if (siguienteIndex < 0) {
              siguienteIndex = nuevoCache.yo.atlas.colecciones.length - 1;
            }
            console.log("pasando a la coleccion " + siguienteIndex);
            console.table(nuevoCache.yo.atlas.colecciones);
            this.idColeccionSeleccionada =
              nuevoCache.yo.atlas.colecciones[siguienteIndex].id;
          }
          // Seleccionado el id de la nueva coleccion seleccionada.

          store.writeQuery({
            query: gql`
              query {
                yo {
                  atlas {
                    colecciones {
                      ...fragColecciones
                    }
                  }
                }
              }
              ${fragmentoColecciones}
            `,
            data: nuevoCache,
          });
          //Cambiar a otra colección después de eliminar esta.

          this.eliminandoColeccion = false;
          this.mostrandoOpcionesColeccion = false;
        })
        .catch((error) => {
          console.log("Error: " + error);
          this.eliminandoColeccion = false;
        });
    },
    crearNuevaColeccion() {
      console.log("Creando nueva coleccion");
      let nombre = this.$refs.inputNombreNuevaColeccion.value.trim();

      console.log(`Con nombre ${nombre}`);
      if (!nombre || nombre.length < 1) {
        console.log("Se debe introducir un nombre");
        return;
      }
      if (nombre.length > 30) {
        console.log("El nombre es demasiado largo");
        return;
      }

      this.creandoNuevaColeccion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($nombre: String, $idsNodos: [String]) {
              crearColeccionNodosAtlasConocimientoUsuario(
                nombre: $nombre
                idsNodos: $idsNodos
              ) {
                ...fragColecciones
              }
            }
            ${fragmentoColecciones}
          `,
          variables: {
            nombre,
            idsNodos: [],
          },
        })
        .then(({ data: { crearColeccionNodosAtlasConocimientoUsuario } }) => {
          this.creandoNuevaColeccion = false;
          this.preparandoNuevaColeccion = false;

          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: gql`
              query {
                yo {
                  atlas {
                    colecciones {
                      ...fragColecciones
                    }
                  }
                }
              }
              ${fragmentoColecciones}
            `,
          });
          let nuevoCache = JSON.parse(JSON.stringify(cache));
          let indexC = nuevoCache.yo.atlas.colecciones.findIndex(
            (c) => c.id === crearColeccionNodosAtlasConocimientoUsuario.id
          );
          if (indexC >= 0) {
            console.log("La colección ya estaba en el caché");
            return;
          }
          nuevoCache.yo.atlas.colecciones.push(
            crearColeccionNodosAtlasConocimientoUsuario
          );

          store.writeQuery({
            query: gql`
              query {
                yo {
                  atlas {
                    colecciones {
                      ...fragColecciones
                    }
                  }
                }
              }
              ${fragmentoColecciones}
            `,
            data: nuevoCache,
          });
          this.idColeccionSeleccionada =
            crearColeccionNodosAtlasConocimientoUsuario.id;

          this.$nextTick(() => {
            this.conectandoNodosColeccion = true;
          });
        })
        .catch((error) => {
          console.log("Error: " + error);
          this.creandoNuevaColeccion = false;
        });
    },
    iniciarCreacionColeccion() {
      this.preparandoNuevaColeccion = true;
    },
    toggleNodoColeccion() {
      if (!this.idNodoSeleccionado || !this.coleccionSeleccionadaNullificable) {
        return;
      }
      this.togglingNodoColeccion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idColeccion: ID!, $idNodo: ID!, $idUsuario: ID!) {
              toggleNodoColeccionNodosAtlasConocimientoUsuario(
                idColeccion: $idColeccion
                idNodo: $idNodo
                idUsuario: $idUsuario
              ) {
                id
                idsNodos
                idsRed
              }
            }
          `,
          variables: {
            idColeccion: this.coleccionSeleccionadaNullificable.id,
            idNodo: this.idNodoSeleccionado,
            idUsuario: this.usuario.id,
          },
        })
        .then(() => {
          this.togglingNodoColeccion = false;
        })
        .catch((error) => {
          console.log("Error: " + error);
          this.togglingNodoColeccion = false;
        });
    },
    clickNodo(idNodo) {
      this.idNodoSeleccionado =
        this.idNodoSeleccionado === idNodo ? null : idNodo;
    },
    setIdColeccionSeleccionada(nuevoId) {
      this.idColeccionSeleccionada = nuevoId;
    },
  },
  watch: {
    idNodoSeleccionado(val) {
      this.$emit("idNodoSeleccionado", val);
    },
    estiloIconoProgresoUsuario() {
      if (this.$refs?.imagenUsuario && this.$refs.diagramaPersonal) {
        this.$nextTick(() => {
          let screenWidth = screen.width;
          this.$refs.diagramaPersonal.scrollLeft =
            this.$refs.diagramaPersonal.scrollWidth / 2 - screenWidth / 2;
        });
      }
    },
    coleccionSeleccionadaNullificable: {
      handler: function (col) {
        this.$emit("coleccionSeleccionada", col);
        if (!col) {
          this.mostrandoOpcionesColeccion = false;
        }
      },
      immediate: true,
    },
    idColeccionSeleccionada() {
      this.desplegandoLista = false;
      this.conectandoNodosColeccion = false;
    },
    conectandoNodosColeccion(val) {
      if (!val) {
        this.mostrandoOpcionesColeccion = false;
      }
      this.$router.push({ name: "atlas" });
      console.log("Emitiendo un cambio en conectandoNodosColeccion");
      this.$emit("conectandoNodosColeccion", val);
    },
    mostrandoArbol: {
      handler: function (val) {
        this.$emit("mostrandoArbol", val);
        if (this.$refs.diagramaArbol) {
          this.$refs.diagramaArbol.idNodoSeleccionado = null;
        }
      },
      immediate: true,
    },
    $route: {
      handler: function ({ name, params }) {
        if (name === "coleccionNodosConocimiento" && params?.idColeccion) {
          this.idColeccionSeleccionada = params.idColeccion;
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.montado = true;
    });
  },
};
</script>
<style scoped lang="css">
.gestorColecciones {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  --colorFondoGestionColecciones: rgb(233, 233, 233);
}
#botonMostrarArbol {
  position: absolute;
  top: 50%;
  right: calc(100% + 10px);
  transform: translateY(-50%);
  background-color: var(--mainColor);
  border-radius: 50%;
}
#botonMostrarArbol.activo {
  background-color: var(--atlasConocimientoSeleccion);
}
#iconoColeccionSeleccionada {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  align-self: center;
}
#zonaTitulo {
  margin: 0px auto;
  display: flex;
  padding: 10px 20px;
  gap: 10px;
  align-items: center;
  justify-content: center;
  background-color: inherit;
}

#contenedorOpciones {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 10px auto;
  margin-top: 0px;
  width: fit-content;
}
#contenedorOpciones .botonOpcion {
  height: 20px;
}
#botonConectarNodosColeccion {
  background-color: transparent;
  box-shadow: none;
}
#anuncioConectandoNodos {
  top: 10px;
  position: relative;
}
#botonCancelarConectarNodosColeccion {
  background-color: var(--mainColor);
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
}
#botonToggleNodoColeccion {
  width: fit-content;
  margin: 10px auto;
}
#nombreColeccion {
  position: relative;
  z-index: 10;
  padding: 10px 30px;
  background-color: var(--atlasConocimientoSeleccion);
  border-radius: 45px;
  cursor: pointer;
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  transition: border-radius 0.2s;
}

#nombreColeccion.mostrandoArbol {
  border-radius: 5px;
}

#nombreColeccion.desplegandoLista {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

#listaSelectoresColeccion {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: min(200px, 90vw);
}

#botonMostrarOpcionesColeccion {
  position: absolute;
  top: 50%;
  left: calc(100% + 5px);
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
}

#contenedorControlesColeccion {
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  justify-content: center;
}

.controlColeccion {
  background-color: rgba(58, 58, 58, 0.445);
  box-shadow: 2px 2px 2px gray;
}

.selectorColeccion {
  padding: 15px 15px;
  font-size: 16px;
  cursor: pointer;
  background-color: var(--mainColor);
  display: flex;
  gap: 10px;
  align-items: center;
}
#contenedorControlesColeccion {
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  justify-content: center;
}

.controlColeccion {
  background-color: rgba(58, 58, 58, 0.445);
  box-shadow: 2px 2px 2px gray;
}

.selectorColeccion {
  padding: 15px 15px;
  font-size: 16px;
  cursor: pointer;
  background-color: var(--mainColor);
  display: flex;
  gap: 10px;
  align-items: center;
}

#diagramaPersonal {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 5px;
  background-color: var(--colorFondoGestionColecciones);
}
#iconoProgresoUsuario {
  width: fit-content;
  position: relative;
  transform: translateX(-50%);
}
#contenedorFotoUsuario {
  border-radius: 50%;
  height: 100px;
  width: 100px;
  overflow: hidden;
}
#contenedorFotoUsuario img {
  height: 100%;
}
#indicadorProgreso {
  font-size: 0.7em;
  text-align: center;
  margin: 10px auto;
  margin-top: 0px;
}

.diagramaArbol {
  flex-grow: 1;
}
</style>
