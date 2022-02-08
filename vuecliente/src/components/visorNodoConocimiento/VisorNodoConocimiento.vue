<template>
  <div class="visorNodoConocimiento">
    <div id="zonaTitulo">
      <div id="iconoNodo">
        <img src="@/assets/iconos/lightbulb.svg" alt="Idea" />
      </div>
      <div id="zonaNombre">
        <div id="nombre">
          {{ esteNodo.nombre }}
        </div>
      </div>
    </div>

    <div id="zonaSelectoresContenido">
      <div
        class="boton selectorContenido selector"
        :class="{ activo: mostrandoContenido === 'estudiar' }"
        :title="mostrandoContenido != 'estudiar' ? 'Mostrar contenido' : ''"
        @click="mostrandoContenido = 'estudiar'"
      >
        <img src="@/assets/iconos/readme.svg" alt="Readme" />
      </div>
      <div
        class="boton selectorContenido selector"
        :class="{ activo: mostrandoContenido === 'expertos' }"
        :title="mostrandoContenido != 'expertos' ? 'Mostrar expertos' : ''"
        @click="mostrandoContenido = 'expertos'"
      >
        <img src="@/assets/iconos/teacher.svg" alt="Teacher" />
      </div>
      <div
        class="boton selectorContenido selector"
        :class="{ activo: mostrandoContenido === 'foros' }"
        :title="mostrandoContenido != 'foros' ? 'Mostrar foros' : ''"
        @click="mostrandoContenido = 'foros'"
      >
        <img src="@/assets/iconos/comments.svg" alt="Readme" />
      </div>
    </div>

    <div id="zonaContenidos">
      <div id="zonaSecciones">
        <div id="zonaTituloSeccion">
          <div
            id="nombreSeccionSeleccionada"
            @click="mostrandoMenuSecciones = true"
          >
            {{
              seccionSeleccionada ? seccionSeleccionada.nombre : "Descripción"
            }}
          </div>
        </div>

        <div
          id="contenedorSelectoresSeccion"
          v-show="mostrandoMenuSecciones"
          @click="mostrandoMenuSecciones = false"
        >
          <div class="contenedorControles">
            <div
              class="boton"
              title="Crear nueva sección"
              v-if="usuarioExperto"
              v-show="!creandoNuevaSeccion"
              @click.stop="crearNuevaSeccion"
            >
              <img src="@/assets/iconos/plusCircle.svg" alt="Plus" />
            </div>
            <loading text="" v-show="creandoNuevaSeccion" />
          </div>
          <div class="selectorSeccion" @click="mostrandoSeccion = null">
            Descripcion
          </div>
          <div
            class="selectorSeccion"
            @click="mostrandoSeccion = seccion.id"
            v-for="seccion of esteNodo.secciones"
            :key="seccion.id"
          >
            <div class="nombreSeccionSelector">
              {{ seccion.nombre }}
            </div>
            <div
              class="boton"
              title="Eliminar"
              v-show="usuarioExperto"
              @click.stop="eliminarSeccion(seccion.id)"
            >
              <img src="@/assets/iconos/trash.svg" alt="Eliminar" />
            </div>
          </div>
        </div>
        <div
          id="zonaDescripcion"
          v-show="!seccionSeleccionada && !mostrandoMenuSecciones"
        >
          <div id="descripcion">
            {{ esteNodo.descripcion }}
          </div>
        </div>
        <seccion-nodo-conocimiento
          :key="seccionSeleccionada.id"
          v-show="seccionSeleccionada && !mostrandoMenuSecciones"
          v-if="esteNodo.id && seccionSeleccionada"
          :idNodo="esteNodo.id"
          :estaSeccion="seccionSeleccionada"
          :usuarioExperto="usuarioExperto"
          @subiArchivo="addArchivoSeccionCache($event, seccionSeleccionada.id)"
          @archivoEliminado="
            deleteArchivoSeccionCache($event, seccionSeleccionada.id)
          "
        />
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import SeccionNodoConocimiento from "./SeccionNodoConocimiento.vue";
import Loading from "../utilidades/Loading.vue";

const QUERY_NODO = gql`
  query ($idNodo: ID!) {
    nodo(idNodo: $idNodo) {
      nombre
      id
      descripcion
      clases {
        id
        nombre
        idExperto
        descripcion
        interesados
      }
      keywords
      expertos
      posiblesExpertos
      clases {
        id
      }
      idForoPublico
      idForoExpertos
      secciones {
        id
        nombre
        modo
        archivos {            
          nombre
          primario
        }
        tipoPrimario
      }
      vinculos {
        idRef
        rol
        tipo
      }
    }
  }
`;

export default {
  components: { SeccionNodoConocimiento, Loading },
  name: "VisorNodoConocimiento",
  apollo: {
    esteNodo: {
      query: QUERY_NODO,
      variables() {
        return {
          idNodo: this.$route.params.idNodo,
        };
      },
      update({ nodo }) {
        return nodo;
      },
    },
  },
  data() {
    return {
      esteNodo: {},
      mostrandoContenido: "estudiar",
      mostrandoSeccion: null,
      mostrandoMenuSecciones: false,
      creandoNuevaSeccion: false,
    };
  },
  methods: {
    deleteArchivoSeccionCache(idArchivo, idSeccion) {
      const store = this.$apollo.provider.defaultClient;

      const cache = store.readQuery({
        query: QUERY_NODO,
        variables: {
          idNodo: this.esteNodo.id,
        },
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));

      var laSeccion = nuevoCache.nodo.secciones.find((s) => s.id == idSeccion);
      if (!laSeccion) {
        console.log(`Seccion no encontrada`);
        return;
      }

      var indexA = laSeccion.archivos.findIndex(
        (a) => a.id === idArchivo
      );
      if (indexA > -1) {
        laSeccion.archivos.splice(indexA, 1);
        store.writeQuery({
          query: QUERY_NODO,
          variables: {
            idNodo: this.esteNodo.id,
          },
          data: nuevoCache,
        });
      } else {
        console.log(`Archivo no encontrado`);
      }
    },
    addArchivoSeccionCache(infoArchivo, idSeccion) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_NODO,
        variables: {
          idNodo: this.esteNodo.id,
        },
      });

      var nuevoCache = JSON.parse(JSON.stringify(cache));
      var laSeccion = nuevoCache.nodo.secciones.find((s) => s.id == idSeccion);
      laSeccion.archivos.push(infoArchivo);
      store.writeQuery({
        query: QUERY_NODO,
        variables: {
          idNodo: this.esteNodo.id,
        },
        data: nuevoCache,
      });
    },
    eliminarSeccion(idSeccion) {
      if (!this.usuarioExperto) {
        return;
      }
      if (
        !confirm(
          "Eliminando esta sección con todos sus contenidos. ¿Continuar?"
        )
      ) {
        return;
      }
      console.log(`Enviando mutación de eliminar seccion ${idSeccion}`);
      const dis = this;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idSeccion: ID!) {
              eliminarSeccionNodoConocimiento(
                idNodo: $idNodo
                idSeccion: $idSeccion
              )
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            idSeccion,
          },
        })
        .then(({ data: { eliminarSeccionNodoConocimiento } }) => {
          console.log(`resultado: ${eliminarSeccionNodoConocimiento}`);
          if (eliminarSeccionNodoConocimiento) {
            let store = dis.$apollo.provider.defaultClient;
            const cache = store.readQuery({
              query: QUERY_NODO,
              variables: { idNodo: dis.esteNodo.id },
            });
            var nuevoCache = JSON.parse(JSON.stringify(cache));

            const indexS = nuevoCache.nodo.secciones.findIndex(
              (s) => s.id == idSeccion
            );
            if (indexS > -1) {
              nuevoCache.nodo.secciones.splice(indexS, 1);
              store.writeQuery({
                query: QUERY_NODO,
                variables: {
                  idNodo: dis.esteNodo.id,
                },
                data: nuevoCache,
              });
            } else {
              console.log(`Seccion no encontrada`);
            }
          }
        })
        .catch((error) => {
          console.log(`Error: E: ${error}`);
        });
    },
    crearNuevaSeccion() {
      if (!this.usuarioExperto) {
        return;
      }
      this.creandoNuevaSeccion = true;
      const dis = this;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!) {
              crearNuevaSeccionNodoConocimiento(idNodo: $idNodo) {
                id
                nombre
                modo
                archivos {
                  nombre
                  primario
                }
                tipoPrimario
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
          },
        })
        .then(({ data: { crearNuevaSeccionNodoConocimiento } }) => {
          let store = dis.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_NODO,
            variables: { idNodo: dis.esteNodo.id },
          });
          var nuevoCache = JSON.parse(JSON.stringify(cache));
          nuevoCache.nodo.secciones.push(crearNuevaSeccionNodoConocimiento);

          store.writeQuery({
            query: QUERY_NODO,
            variables: { idNodo: dis.esteNodo.id },
            data: nuevoCache,
          });

          this.creandoNuevaSeccion = false;
        })
        .catch((error) => {
          console.log(`Error. E: ${error}`);
          this.creandoNuevaSeccion = false;
        });
    },
  },
  computed: {
    seccionSeleccionada() {
      if (!this.mostrandoSeccion) return null;
      return this.esteNodo.secciones.find(
        (s) => s.id === this.mostrandoSeccion
      );
    },
    usuarioExperto: function () {
      if (!this.esteNodo.expertos || !this.usuarioLogeado) return false;

      if (this.esteNodo.expertos.includes(this.usuario.id)) {
        return true;
      }
      return false;
    },
  },
};
</script>

<style scoped>
.visorNodoConocimiento {
  font-family: Salsa, cursive;
}
#zonaTitulo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 25px 0px;
}

#iconoNodo {
  width: 20px;
  height: 20px;
}
#iconoNodo img {
  height: 100%;
}

#zonaSelectoresContenido {
  display: flex;
  justify-content: center;
  align-items: center;
}
#zonaSelectoresContenido .boton {
  height: 35px;
  width: 35px;
  margin: 0px 20px;
  padding: 5px;
}

#zonaTituloSeccion {
  padding: 25px 0px;
}
#nombreSeccionSeleccionada {
  text-align: center;
  border-bottom: 2px solid var(--paletaMain);
  width: min(300px, 50vw);
  margin: 0px auto;
}
#contenedorSelectoresSeccion {
  width: min(400px, 90vw);
  margin-left: 5vw;
  background-color: var(--paletaMain);
  border-radius: 10px;
  position: relative;
}
.selectorSeccion {
  padding: 15px 0px;
  text-align: center;
  font-size: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.nombreSeccionSelector {
  margin: 0px auto;
  text-align: center;
  width: 80%;
  margin-left: 10%;
}
.selectorSeccion .boton {
  margin-left: auto;
  margin-right: 10px;
}

#descripcion {
  background-color: var(--paletaMain);
  border-radius: 10px;
  padding: 20px;
  width: min(300px, 90vw);
  margin: 0px auto;
}
</style>


