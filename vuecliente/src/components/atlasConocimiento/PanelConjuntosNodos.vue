<template>
  <div
    id="panelConjuntosNodos"
    @mouseup.left.stop=""
    @mousedown.left.stop=""
    @touchmove.stop=""
    v-show="abierto"
  >
    <div id="barraConjuntos">
      <div
        class="selectorConjunto"
        :class="{ seleccionado: conjunto.id === idColeccionSeleccionada }"
        @click="seleccionarColeccion($event, conjunto.id)"
        v-for="conjunto of conjuntos"
        :key="'selectorConjunto' + conjunto.id"
      >
        <div
          class="nombreColeccion"
          v-show="
            !editandoNombreColeccion ||
            !conjunto.editable ||
            conjunto.id != idColeccionSeleccionada
          "
        >
          {{ conjunto.titulo }}
        </div>
        <input
          type="text"
          name="nuevoNombreColeccion"
          :id="'inputNombreColeccion' + conjunto.id"
          v-show="
            conjunto.editable &&
            conjunto.id === idColeccionSeleccionada &&
            editandoNombreColeccion
          "
          :class="{ deshabilitado: enviandoQueryColecciones }"
          @keypress.enter="guardarNuevoNombreColeccion($event, conjunto.id)"
          @blur="editandoNombreColeccion = false"
        />
        <img
          src="@/assets/iconos/delete.png"
          alt="Eliminar"
          width="20px"
          title="Eliminar colección"
          v-show="
            !editandoNombreColeccion &&
            conjunto.editable &&
            conjunto.id === idColeccionSeleccionada
          "
          class="botonEliminarColeccion"
          @click.stop="eliminarColeccion(conjunto.id)"
        />
      </div>
      <div
        id="controlesConjuntos"
        :class="{ deshabilitado: enviandoQueryColecciones }"
      >
        <div @click="crearNuevaColeccion" class="botonControlesConjuntos">
          Nueva colección
        </div>
      </div>
    </div>

    <div class="barraSeccion">
      <span @click="idColeccionAbierta=null"> Colecciones</span><span v-if="coleccionAbierta">{{ " > " + coleccionAbierta.titulo }}</span>
    </div>

    <div id="listaConjuntos" v-show="!coleccionAbierta">
      <div class="anuncioZonaVacia" v-if="conjuntos.length < 1">
        Aún no hay colecciones
      </div>
      <selector-conjunto
        @dblclick.native="idColeccionAbierta = coleccion.id"
        @click.native.stop="idColeccionSeleccionada=idColeccionSeleccionada===coleccion.id?null:coleccion.id"
        v-for="coleccion of conjuntos"
        :key="coleccion.id"
        :seleccionado="coleccion.id === idColeccionSeleccionada"
        :estaColeccion="coleccion"
      />
    </div>

    <coleccion-nodos-conocimiento
      :yo="yo"
      v-if="coleccionAbierta"
      :estaColeccion="coleccionAbierta"
    />
    <!-- <div
      id="listaNodosConjunto"
      v-if="coleccionSeleccionada"
      v-show="abierto && coleccionSeleccionada"
      :key="'listaNodos' + idColeccionSeleccionada"
      @click.self.stop="idNodoSeleccionado = null"
    >
      <icono-nodo-conocimiento
        :esteNodo="nodo"
        v-for="nodo of coleccionSeleccionada.nodos"
        v-show="coleccionSeleccionada"
        :key="nodo.id"
        :seleccionado="nodo.id === idNodoSeleccionado"
        @click.native.stop="idNodoSeleccionado = nodo.id"
        @dblclick.native.stop="$emit('centrarEnNodo', nodo.id)"
      /> -->
    <!-- </div> -->
  </div>
</template>

<script>
import gql from "graphql-tag";
import ColeccionNodosConocimiento from "./ColeccionNodosConocimiento.vue";
import SelectorConjunto from "./SelectorConjunto.vue";

const charProhibidosNombreColeccion = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

export default {
  components: { ColeccionNodosConocimiento, SelectorConjunto },
  name: "PanelConjuntosNodos",
  props: {
    yo: Object,
    modoAtlas: String,
  },
  data() {
    return {
      abierto: false,
      idColeccionSeleccionada: 0,
      editandoNombreColeccion: false,

      idNodoSeleccionado: null,

      idColeccionAbierta: null,

      enviandoQueryColecciones: false,
      enviandoQueryNodosSeccion: false,
    };
  },
  methods: {
    abrirPaginaNodo(idNodo) {
      if (!idNodo) return;
      this.$router.push("/nodoConocimiento/" + idNodo);
    },
    crearNuevaColeccion() {
      this.enviandoQueryColecciones = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation {
              crearColeccionNodosAtlasConocimientoUsuario {
                id
                atlas {
                  colecciones {
                    id
                    nombre
                    idsNodos
                    nodos {
                      id
                      nombre
                    }
                  }
                }
              }
            }
          `,
        })
        .then(() => {
          this.enviandoQueryColecciones = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoQueryColecciones = false;
        });
    },
    seleccionarColeccion(e, idColeccion) {
      if (this.idColeccionSeleccionada === idColeccion) {
        const nombreColeccion = this.conjuntos.find(
          (c) => c.id === idColeccion
        ).nombre;
        console.log(`Seting value del input a ${nombreColeccion}`);
        this.editandoNombreColeccion = true;
        document.getElementById("inputNombreColeccion" + idColeccion).value =
          nombreColeccion;
      } else {
        this.editandoNombreColeccion = false;
      }
      this.idColeccionSeleccionada = idColeccion;
      this.idNodoSeleccionado = null;
    },
    guardarNuevoNombreColeccion(e, idColeccion) {
      var nuevoNombre = e.target.value;
      console.log(
        `seting nombre de coleccion ${idColeccion} con value: ${nuevoNombre}`
      );
      if (charProhibidosNombreColeccion.test(nuevoNombre)) {
        alert("¡El nombre contenía caracteres ilegales!");
        return true;
      }
      this.enviandoQueryColecciones = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idColeccion: ID!, $nuevoNombre: String!) {
              setNombreColeccionNodosAtlasConocimientoUsuario(
                idColeccion: $idColeccion
                nuevoNombre: $nuevoNombre
              ) {
                id
                atlas {
                  colecciones {
                    id
                    nombre
                    idsNodos
                    nodos {
                      id
                      nombre
                    }
                  }
                }
              }
            }
          `,
          variables: {
            idColeccion,
            nuevoNombre,
          },
        })
        .then(() => {
          this.enviandoQueryColecciones = false;
          this.editandoNombreColeccion = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoQueryColecciones = false;
        });
    },
    eliminarColeccion(idColeccion) {
      if (
        !confirm(
          "Confirmar eliminación de colección? (Esta acción no se puede deshacer)"
        )
      )
        return;
      this.idColeccionSeleccionada = null;
      this.enviandoQueryColecciones = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idColeccion: ID!) {
              eliminarColeccionNodosAtlasConocimientoUsuario(
                idColeccion: $idColeccion
              ) {
                id
                atlas {
                  colecciones {
                    id
                    idsNodos
                    nodos {
                      id
                      nombre
                    }
                  }
                }
              }
            }
          `,
          variables: {
            idColeccion,
          },
        })
        .then(() => {
          this.enviandoQueryColecciones = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoQueryColecciones = false;
        });
    },
    eliminarNodoSeleccionadoSeccionSeleccionada() {
      if (!this.idColeccionSeleccionada || !this.idNodoSeleccionado) return;

      this.enviandoQueryNodosSeccion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idColeccion: ID!, $idNodo: ID!) {
              removeNodoColeccionNodosAtlasConocimientoUsuario(
                idColeccion: $idColeccion
                idNodo: $idNodo
              ) {
                id
                idsNodos
                nodos {
                  id
                  nombre
                }
              }
            }
          `,
          variables: {
            idColeccion: this.idColeccionSeleccionada,
            idNodo: this.idNodoSeleccionado,
          },
        })
        .then(() => {
          this.enviandoQueryNodosSeccion = false;
          this.idNodoSeleccionado = null;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoQueryNodosSeccion = false;
        });
    },
  },
  computed: {
    idsNodosObjetivos() {
      if (!this.yo || !this.yo.atlas || !this.yo.atlas.datosNodos) {
        return [];
      }
      return this.yo.atlas.datosNodos
        .filter((n) => n.objetivo == true)
        .map((n) => n.idNodo);
    },
    nodosObjetivo() {
      if (!this.yo) return [];

      return this.todosNodos.filter((n) =>
        this.idsNodosObjetivos.includes(n.id)
      );
    },
    conjuntos() {
      return this.conjuntosUsuario;
    },
    conjuntosUsuario() {
      if (!this.yo || !this.yo.atlas || !this.yo.atlas.colecciones) {
        return [];
      }

      var nuevoColecciones = JSON.parse(
        JSON.stringify(this.yo.atlas.colecciones)
      );

      nuevoColecciones.forEach((c) => {
        c.titulo = c.nombre;
        c.modo = "estudiante";
        c.editable = true;
        c.editandoNombre = false;
      });

      return nuevoColecciones;
    },
    coleccionSeleccionada() {
      return this.conjuntos.find((c) => c.id === this.idColeccionSeleccionada);
    },
    coleccionAbierta() {
      if (!this.idColeccionAbierta) {
        return null;
      }

      return this.conjuntos.find((c) => c.id === this.idColeccionAbierta);
    },
  },
  watch: {
    abierto() {
      this.idNodoSeleccionado = null;
    },
  },
};
</script>

<style scoped>
#panelConjuntosNodos {
  position: absolute;
  top: 50px;
  box-shadow: 2px 2px 2px 2px rgb(190, 190, 190);
  min-width: 100px;
  min-height: 100px;
  max-height: 80%;
  background-color: whitesmoke;
  width: min(90%, 650px);
  right: 0px;
}
#grabber {
  width: 30px;
  height: 30px;
  cursor: pointer;
  position: absolute;
  top: 0%;
  right: 100%;
}
#barraConjuntos {
  display: flex;
  width: 100%;
  overflow-x: scroll;
}

#listaConjuntos {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 10px;
}
.botonEliminarColeccion {
  cursor: pointer;
  border-radius: 50%;
  margin-left: 10px;
  width: 20px;
  height: 20px;
}
.botonEliminarColeccion:hover {
  background-color: rgb(219, 63, 63);
}
#controlesConjuntos {
  margin-left: auto;
}
.botonControlesConjuntos {
  font-size: 14px;
  color: gray;
  cursor: pointer;
}
.botonControlesConjuntos:hover {
  background-color: rgba(128, 128, 128, 0.527);
}

#botonRastrearNodo {
  width: 20px;
  min-width: 20px;
  height: 20px;
  cursor: pointer;
  border-radius: 50%;
}
#botonRastrearNodo:hover {
  background-color: rgba(95, 158, 160, 0.658);
}

.botonEliminarNodoColeccion {
  width: 20px;
  min-width: 20px;
  height: 20px;
  cursor: pointer;
  align-self: center;
  border-radius: 50%;
  margin-left: 10px;
}
.botonEliminarNodoColeccion:hover {
  background-color: rgb(236, 68, 68);
}

#listaNodosConjunto {
  display: flex;
  flex-wrap: wrap;
  overflow-y: scroll;
  max-height: 55vh;
  padding-top: 10px;
}
.iconoNodoConocimiento {
  margin: 0px 40px;
  margin-bottom: 90px;
}
#listaClasesNodo {
  width: 100%;
}
.infoClase {
  display: flex;
  min-height: 40px;
  padding: 2px 5px;
}
.infoClase:hover {
  background-color: rgba(95, 158, 160, 0.452);
}
.iconoAbrirNodo {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-right: 10px;
}
.infoInteresados {
  margin-left: auto;
  position: relative;
}
.cantidadInteresados {
  position: absolute;
  top: 25%;
  left: 65%;
  transform: translate(-50%, -50%);
  font-size: 10px;
}
.iconoInteresados {
  width: 27px;
  height: 27px;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  border: 1px solid chocolate;
  background-color: rgba(210, 105, 30, 0.438);
}
</style>