<template>
  <div
    id="panelConjuntosNodos"
    :style="[offset]"
    @mouseup.left.stop=""
    @mousedown.left.stop=""
  >
    <img
      src="@/assets/iconos/userNodes.png"
      alt="Nodos de usuario"
      title="Mis nodos"
      id="grabber"
      @click.stop="abierto = !abierto"
    />
    <div id="barraConjuntos">
      <div
        class="selectorConjunto"      
        :class="{ seleccionado: conjunto.id === idConjuntoSeleccionado }"
        @click="seleccionarColeccion($event, conjunto.id)"
        v-for="conjunto of conjuntos"
        :key="'selectorConjunto' + conjunto.id"
      >
        <div
          class="nombreColeccion"
          v-show="
            !editandoNombreColeccion ||
            !conjunto.editable ||
            conjunto.id != idConjuntoSeleccionado
          "
        >
          {{ conjunto.titulo }}
        </div>
        <input
          type="text"
          name="nuevoNombreColeccion"
          :id="'inputNombreColeccion'+conjunto.id"
          v-show="
            conjunto.editable &&
            conjunto.id === idConjuntoSeleccionado &&
            editandoNombreColeccion
          "
          :class="{deshabilitado: enviandoQueryColecciones}"
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
            conjunto.id === idConjuntoSeleccionado
          "
          class="botonEliminarColeccion"
          @click.stop="eliminarColeccion(conjunto.id)"
        />
      </div>
      <div
        id="controlesConjuntos"
        :class="{ deshabilitado: enviandoQueryColecciones }"        
      >
        <div @click="crearNuevaColeccion" class="botonControlesConjuntos">Nueva colección</div>
      </div>
    </div>
    <div
      id="controlesListaNodos"
      :style="[
        { visibility: idNodoSeleccionado != null ? 'visible' : 'hidden' },
      ]"
    >
      <div
        class="controlListaNodos hoverGris"
        @click.stop="$emit('centrarEnNodo', idNodoSeleccionado)"
      >
        Centrar
      </div>
      <img
        src="@/assets/iconos/target.png"
        alt="Rastrear"
        title="Rastrear nodo"
        class="controlListaNodos"
        :class="{ deshabilitado: enviandoQueryTarget }"
        id="botonRastrearNodo"
        v-show="idConjuntoSeleccionado != 1"
        @click.stop="toggleNodoTarget(idNodoSeleccionado)"
      />
      <img
        src="@/assets/iconos/delete.png"
        alt="Eliminar"
        :class="{deshabilitado: enviandoQueryNodosSeccion}"
        v-show="idNodoSeleccionado"
        class="botonEliminarNodoColeccion"
        @click.stop="eliminarNodoSeleccionadoSeccionSeleccionada"
      />
    </div>
    <div
      id="listaNodosConjunto"
      v-if="conjuntoSeleccionado"
      v-show="abierto && conjuntoSeleccionado"
      :key="'listaNodos' + idConjuntoSeleccionado"
      @click.self.stop="idNodoSeleccionado = null"
    >
      <icono-nodo-conocimiento
        :esteNodo="nodo"
        v-for="nodo of conjuntoSeleccionado.nodos"
        v-show="conjuntoSeleccionado"
        :key="nodo.id"
        :seleccionado="nodo.id === idNodoSeleccionado"
        :esTarget="idNodoTarget === nodo.id"
        @click.native.stop="idNodoSeleccionado = nodo.id"
        @dblclick.native.stop="$emit('centrarEnNodo', nodo.id)"
      />
    </div>
    <div
      id="listaClasesNodo"
      v-if="conjuntoSeleccionado"
      v-show="conjuntoSeleccionado.nombre === 'nodosConClaseDictada'"
    >
      <div
        class="infoClase"
        v-for="clase of clasesDictadasUsuario"
        :key="'infoClase' + clase.id"
        @click.stop="$emit('centrarEnNodo', clase.idNodoParent)"
      >
        <img
          src="@/assets/iconos/nodoConocimientoDefault.png"
          alt="Abrir nodo"
          title="Abrir el nodo de conocimiento"
          @click.stop="abrirPaginaNodo(clase.idNodoParent)"
          class="iconoAbrirNodo"
        />
        <div class="nombreClase">{{ clase.nombre }}</div>
        <div class="infoInteresados">
          <div class="cantidadInteresados">{{ clase.interesados.length }}</div>
          <img
            src="@/assets/iconos/raiseHand.png"
            alt="Interesados"
            class="iconoInteresados"
            title="Estudiantes interesados en esta clase"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconoNodoConocimiento from "./IconoNodoConocimiento.vue";
import gql from "graphql-tag";

const charProhibidosNombreColeccion = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

export default {
  components: { IconoNodoConocimiento },
  name: "PanelConjuntosNodos",
  props: {
    yo: Object,
    todosNodos: Array,
    idNodoTarget: String,
  },
  data() {
    return {
      abierto: false,
      idConjuntoSeleccionado: 0,
      editandoNombreColeccion: false,

      idNodoSeleccionado: null,

      enviandoQueryTarget: false,
      enviandoQueryColecciones: false,
      enviandoQueryNodosSeccion: false,
    };
  },
  methods: {
    toggleNodoTarget(idNodo) {
      if (!idNodo) return;
      if (this.idNodoTarget == idNodo) {
        this.nulificarNodoTarget();
        return;
      }

      this.enviandoQueryTarget = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!) {
              setNodoAtlasTarget(idNodo: $idNodo)
            }
          `,
          variables: {
            idNodo,
          },
        })
        .then(({ data: { setNodoAtlasTarget } }) => {
          this.enviandoQueryTarget = false;

          if (setNodoAtlasTarget) {
            this.$emit("targetSeleccionado", idNodo);
          }
        })
        .catch((error) => {
          this.enviandoQueryTarget = false;
          console.log(`Error: ${error}`);
        });
    },
    nulificarNodoTarget() {
      this.enviandoQueryTarget = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation {
              nulificarNodoTargetUsuarioAtlas
            }
          `,
        })
        .then(() => {
          this.enviandoQueryTarget = false;
          this.$emit("targetSeleccionado", null);
        })
        .catch((error) => {
          this.enviandoQueryTarget = false;
          console.log(`Error: ${error}`);
        });
    },
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
      if (this.idConjuntoSeleccionado === idColeccion) {
        const nombreColeccion=this.conjuntos.find(c=>c.id===idColeccion).nombre;
        console.log(`Seting value del input a ${nombreColeccion}`);
        this.editandoNombreColeccion = true;
        document.getElementById('inputNombreColeccion'+idColeccion).value=nombreColeccion;

      } else {
        this.editandoNombreColeccion = false;
      }
      this.idConjuntoSeleccionado = idColeccion;
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
      this.idConjuntoSeleccionado = null;
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

      if(!this.idConjuntoSeleccionado || !this.idNodoSeleccionado)return

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
          variables:{
            idColeccion:this.idConjuntoSeleccionado,
            idNodo:this.idNodoSeleccionado
          }
        })
        .then(() => {
          this.enviandoQueryNodosSeccion = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoQueryNodosSeccion = false;
        });
    },    
  },
  computed: {
    offset() {
      if (this.abierto) {
        return {
          right: "0px",
        };
      }
      return {
        left: "100%",
      };
    },
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
    nodosClasesDictadasUsuario() {
      if (!this.usuario || !this.usuario.id) return [];
      return this.todosNodos.filter((n) =>
        n.clases.some((c) => c.idExperto === this.usuario.id)
      );
    },
    clasesDictadasUsuario() {
      if (!this.usuario || !this.usuario.id) return;
      var clasesDictadas = [];
      this.nodosClasesDictadasUsuario.forEach((nodo) => {        
        clasesDictadas = clasesDictadas.concat(
          nodo.clases
            .filter((c) => c.idExperto === this.usuario.id)
            .map((c) => {
              return {
                ...c,
                idNodoParent: nodo.id,
              };
            })
        );
      });
      return clasesDictadas;
    },
    conjuntos() {
      if(this.yo.atlas.configuracion.modo==='experto'){
        return this.conjuntosUsuario.concat([{
          nombre: "nodosConClaseDictada",
          titulo: "Mis clases",
          id: 1,
          nodos: [],
          modo: "experto",
        }])
      }
      return this.conjuntosUsuario
    },
    conjuntoSeleccionado() {
      if (this.idConjuntoSeleccionado === null) return null;
      return this.conjuntos.find((c) => c.id === this.idConjuntoSeleccionado);
    },
    nodoSeleccionado() {
      if (!this.idNodoSeleccionado) return null;
      return this.todosNodos.find((n) => n.id === this.idNodoSeleccionado);
    },
    conjuntosUsuario() {
      if (!this.yo || !this.yo.atlas || !this.yo.atlas.colecciones) {
        return [];
      }

      this.yo.atlas.colecciones.forEach((c) => {
        c.titulo = c.nombre;
        c.modo = "estudiante";
        c.editable = true;
        c.editandoNombre = false;
      });

      return this.yo.atlas.colecciones;
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
  width: min(80%, 650px);
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
}
.selectorConjunto {
  cursor: pointer;
  background-color: rgba(95, 158, 160, 0.637);
  padding: 3px 5px;
  font-style: italic;
  display: flex;
}
.selectorConjunto.seleccionado {
  background-color: cadetblue;
}
.botonEliminarColeccion {
  cursor: pointer;
  border-radius: 50%;
  margin-left: 10px;
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
#controlesListaNodos {
  display: flex;
  width: 100%;
  margin: 20px auto;
}
.controlListaNodos {
  padding: 3px 5px;
  font-size: 12px;
  color: gray;
  cursor: pointer;
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