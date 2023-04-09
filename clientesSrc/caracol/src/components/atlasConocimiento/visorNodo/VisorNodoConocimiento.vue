<template>
  <div class="visorNodoConocimiento">
    <loading texto="" v-show="$apollo.queries.esteNodo.loading" />
    <div id="zonaTitulo" v-show="!$apollo.queries.esteNodo.loading">
      <div id="iconoNodo">
        <img src="@/assets/iconos/lightbulb.svg" alt="Idea" />
      </div>
      <div id="zonaNombre">
        <div id="nombre" v-show="!editandoNombre" @click="iniciarEdicionNombre">
          {{ esteNodo.nombre }}
        </div>
        <input
          @keypress.enter.prevent="guardarNuevoNombre"
          ref="inputNuevoNombre"
          style="width: 250px"
          @blur="guardarNuevoNombre"
          v-show="editandoNombre"
          type="text"
          class="inputNombreCosa"
          id="inputNuevoNombre"
        />
      </div>
    </div>

    <div
      id="zonaSelectoresContenido"
      v-show="!$apollo.queries.esteNodo.loading"
    >
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
        class="boton selectorContenido selector deshabilitado"
        :class="{ activo: mostrandoContenido === 'foros' }"
        :title="mostrandoContenido != 'foros' ? 'Mostrar foros' : ''"
        @click="mostrandoContenido = 'foros'"
      >
        <img src="@/assets/iconos/comments.svg" alt="Readme" />
      </div>
    </div>

    <div id="zonaContenidos" v-show="!$apollo.queries.esteNodo.loading">
      <div id="zonaSecciones" v-show="mostrandoContenido === 'estudiar'">
        <div id="zonaTituloSeccion" v-show="!mostrandoMenuSecciones">
          <div
            id="nombreSeccionSeleccionada"
            @click="mostrandoMenuSecciones = true"
          >
            <img
              class="iconoMenuSecciones"
              src="@/assets/iconos/stream.svg"
              alt="Menu"
              v-if="esteNodo?.secciones?.length > 0"
            />
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
          <div class="selectorSeccion" @click="idSeccionVisible = null">
            Descripcion
          </div>
          <div
            class="selectorSeccion"
            @click="idSeccionVisible = seccion.id"
            v-for="(seccion, indexS) of esteNodo.secciones"
            :key="seccion.id"
          >
            <div class="nombreSeccionSelector">
              {{ seccion.nombre }}
            </div>
            <div
              class="contenedorBotonesSelectorSeccion"
              v-if="usuarioExperto || usuarioSuperadministrador"
              v-show="mostrandoBotonesSeccion === seccion.id"
              @click.stop=""
            >
              <div
                class="boton"
                @click="cambiarIndexSeccion(seccion.id, -1)"
                v-show="steppingSeccion != seccion.id && indexS > 0"
              >
                <img
                  style="transform: rotate(90deg)"
                  src="@/assets/iconos/chevron.svg"
                  alt="arrow"
                />
              </div>
              <loading v-show="steppingSeccion === seccion.id" />
              <div
                class="boton"
                @click="cambiarIndexSeccion(seccion.id, 1)"
                v-show="
                  steppingSeccion != seccion.id &&
                  indexS < esteNodo.secciones.length - 1
                "
              >
                <img
                  style="transform: rotate(-90deg)"
                  src="@/assets/iconos/chevron.svg"
                  alt="arrow"
                />
              </div>
              <div
                class="boton"
                title="Eliminar"
                v-show="usuarioExperto || usuarioSuperadministrador"
                @click.stop="eliminarSeccion(seccion.id)"
              >
                <img src="@/assets/iconos/trash.svg" alt="Eliminar" />
              </div>
            </div>
            <div
              class="boton botonMostrarBotonesSeccion"
              v-if="usuarioExperto || usuarioSuperadministrador"
              @click.stop="
                mostrandoBotonesSeccion =
                  mostrandoBotonesSeccion === seccion.id ? null : seccion.id
              "
            >
              <img src="@/assets/iconos/ellipsisVertical.svg" alt="Opciones" />
            </div>
          </div>
          <div
            class="selectorSeccion botonTexto"
            @click.stop="crearNuevaSeccion"
            v-if="usuarioExperto"
          >
            <loading v-show="creandoNuevaSeccion" />
            <img
              src="@/assets/iconos/plusCircle.svg"
              alt="Plus"
              v-show="!creandoNuevaSeccion"
            />
            <span>Crear sección</span>
          </div>
        </div>
        <div
          id="zonaDescripcion"
          v-show="!seccionSeleccionada && !mostrandoMenuSecciones"
        >
          <div
            id="descripcion"
            class="contenidoTexto"
            ref="descripcion"
            v-show="!editandoDescripcion"
            @click="toggleEditandoDescripcion"
          >
            {{ esteNodo.descripcion }}
          </div>

          <textarea
            id="inputNuevoDescripcion"
            ref="inputNuevoDescripcion"
            class="inputTextoNodo"
            v-model="nuevoDescripcion"
            v-show="editandoDescripcion"
          />
          <div class="contenedorBotonesCampo" v-show="editandoDescripcion">
            <img
              src="@/assets/iconos/save.svg"
              class="botonGuardarCampo"
              alt="Guardar"
              title="Guardar descripción"
              id="botonGuardarDescripcion"
              @click="guardarNuevoDescripcion"
            />
            <img
              src="@/assets/iconos/equis.svg"
              class="botonGuardarCampo"
              alt="Cancelar"
              title="Cancelar edición"
              id="botonCancelarEdicionDescripcion"
              @click="editandoDescripcion = false"
            />
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
          @tengoNuevoPrimario="
            setPrimarioSeccionCache($event, seccionSeleccionada.id)
          "
        />
        <div
          id="contenedorSteppersSeccion"
          v-if="esteNodo?.secciones?.length > 0"
        >
          <div
            class="stepperSeccion boton"
            :class="{ deshabilitado: !seccionSeleccionada }"
            @click="stepSeccionVisible(-1)"
          >
            <img
              src="@/assets/iconos/step.svg"
              style="transform: rotate(180deg)"
              alt="step"
            />
          </div>
          <div
            class="stepperSeccion boton"
            :class="{
              deshabilitado:
                indexSeccionSeleccionada >= esteNodo.secciones.length - 1,
            }"
            @click="stepSeccionVisible(1)"
          >
            <img src="@/assets/iconos/step.svg" alt="step" />
          </div>
        </div>
      </div>

      <div id="zonaExpertos" v-show="mostrandoContenido === 'expertos'">
        <div class="contenedorControles">
          <div
            class="boton"
            v-show="
              !enviandoQueryExpertos &&
              !idExpertoSeleccionado &&
              !usuarioExperto
            "
            :title="
              esteNodo.expertos.length < 1
                ? 'Asumir'
                : 'Quiero aportar como experto en este tema'
            "
            @click="intentarEntrarExpertos(usuario.id)"
          >
            <img src="@/assets/iconos/mas.svg" alt="Mas" />
          </div>
          <div
            class="boton"
            v-show="
              !enviandoQueryExpertos &&
              idExpertoSeleccionado &&
              ((esteNodo.posiblesExpertos.includes(idExpertoSeleccionado) &&
                usuarioExperto) ||
                usuarioSuperadministrador ||
                usuarioAdministradorAtlas)
            "
            title="Aceptar como experto"
            @click="intentarEntrarExpertos(idExpertoSeleccionado)"
          >
            <img src="@/assets/iconos/handshake.svg" alt="Handshake" />
          </div>
          <div
            class="boton"
            v-show="
              !enviandoQueryExpertos &&
              !idExpertoSeleccionado &&
              (usuarioExperto ||
                esteNodo.posiblesExpertos.includes(idExpertoSeleccionado))
            "
            title="abandonar"
            @click="abandonarListaExpertos(usuario.id)"
          >
            <img src="@/assets/iconos/minus.svg" alt="Menos" />
          </div>
          <loading texto="" v-show="enviandoQueryExpertos" />
        </div>
        <div
          id="listaExpertos"
          class="listaPersonas"
          @click.self="idExpertoSeleccionado = null"
        >
          <icono-persona-autonomo
            texto=""
            v-for="idExperto of esteNodo.expertos.concat(
              esteNodo.posiblesExpertos
            )"
            :seleccionado="idExpertoSeleccionado === idExperto"
            :key="idExperto"
            factorEscala="0.8"
            :style="{
              opacity: esteNodo.posiblesExpertos.includes(idExperto) ? 0.5 : 1,
            }"
            :idPersona="idExperto"
            @click.native="idExpertoSeleccionado = idExperto"
          />
        </div>
      </div>

      <div
        id="zonaForos"
        ref="zonaForos"
        v-show="mostrandoContenido == 'foros'"
      >
        <div class="nombreForo" v-if="usuarioExperto">Foro expertos</div>
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from "@apollo/client/core";
import SeccionNodoConocimiento from "./SeccionNodoConocimiento.vue";
import Loading from "../../utilidades/Loading.vue";
import IconoPersonaAutonomo from "../../usuario/IconoPersonaAutonomo.vue";
import { charProhibidosNombreCosa } from "../../configs";

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
        enlace
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
  components: { SeccionNodoConocimiento, Loading, IconoPersonaAutonomo },
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
        document.title = nodo.nombre;
        return nodo;
      },
    },
  },
  data() {
    return {
      esteNodo: {
        expertos: [],
        posiblesExpertos: [],
      },
      steppingSeccion: null,
      mostrandoBotonesSeccion: null,

      mostrandoContenido: "estudiar",
      idSeccionVisible: null,
      mostrandoMenuSecciones: false,
      creandoNuevaSeccion: false,
      idExpertoSeleccionado: null,
      enviandoQueryExpertos: false,

      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: null,
      editandoDescripcion: false,
    };
  },
  methods: {
    stepSeccionVisible(step) {
      if (!this.esteNodo?.secciones) {
        return;
      }
      let nuevoIndex = this.indexSeccionSeleccionada != null? this.indexSeccionSeleccionada + step: 0;
      console.log(`Pasando a la sección ${nuevoIndex}`);
      if (nuevoIndex >= this.esteNodo.secciones.length) {
        return;
      }
      if(nuevoIndex < 0){ //Desseleccionar secciones para que quede visible la descripción. Descripción es visible cuando idSeccionVisible=null
        this.idSeccionVisible=null;
        return
      }
      this.idSeccionVisible = this.esteNodo.secciones[nuevoIndex].id;
    },
    cambiarIndexSeccion(idSeccion, step) {
      if (!this.usuarioExperto && !this.usuarioAdministrador) {
        console.log("No autorizado");
        return;
      }

      let indexActual = this.esteNodo.secciones.findIndex(
        (s) => s.id === idSeccion
      );
      if (indexActual < 0) {
        console.log("Sección no encontrada");
        return;
      }
      if (
        indexActual === 0 ||
        indexActual === this.esteNodo.secciones.length - 1
      ) {
        console.log("Estaba en el borde");
      }

      this.steppingSeccion = idSeccion;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idSeccion: ID!, $step: Int!) {
              moverSeccionNodoConocimiento(
                idNodo: $idNodo
                idSeccion: $idSeccion
                movimiento: $step
              ) {
                id
                secciones {
                  id
                }
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            idSeccion,
            step,
          },
        })
        .then(() => {
          this.steppingSeccion = null;
        })
        .catch((error) => {
          this.steppingSeccion = null;
          console.log("Error steping sección: " + error);
        });
    },
    deleteArchivoSeccionCache(nombreArchivo, idSeccion) {
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
        (a) => a.nombre === nombreArchivo
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
      if (!this.usuarioExperto && !this.usuarioSuperadministrador) {
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
      if (!this.usuarioExperto && !this.usuarioSuperadministrador) {
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
                enlace
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
    setPrimarioSeccionCache(nombreNuevoPrimario, idSeccion) {
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
        (a) => a.nombre === nombreNuevoPrimario
      );

      laSeccion.archivos.forEach((a) => (a.primario = false));
      laSeccion.archivos[indexA].primario = true;

      store.writeQuery({
        query: QUERY_NODO,
        variables: {
          idNodo: this.esteNodo.id,
        },
        data: nuevoCache,
      });
    },
    intentarEntrarExpertos(idCandidato) {
      console.log(
        `enviando id ${this.usuario.id} para entrar a expertos del nodo con id ${this.esteNodo.id}`
      );
      this.enviandoQueryExpertos = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idUsuario: ID!) {
              addExpertoNodo(idNodo: $idNodo, idUsuario: $idUsuario) {
                id
                expertos
                posiblesExpertos
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            idUsuario: idCandidato,
          },
        })
        .then(() => {
          this.enviandoQueryExpertos = false;
        })
        .catch((error) => {
          this.enviandoQueryExpertos = false;
          console.log("error: " + error);
        });
    },
    abandonarListaExpertos(idCandidato) {
      console.log(`Abandonando la responsabilidad en este nodo`);
      if (
        !this.usuarioExperto &&
        !this.esteNodo.posiblesExpertos.includes(this.usuario.id)
      ) {
        return;
      }
      this.enviandoQueryExpertos = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idUsuario: ID!) {
              removeExpertoNodo(idNodo: $idNodo, idUsuario: $idUsuario) {
                id
                expertos
                posiblesExpertos
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            idUsuario: idCandidato,
          },
        })
        .then(() => {
          this.enviandoQueryExpertos = false;
        })
        .catch((error) => {
          this.enviandoQueryExpertos = false;
          console.log("error: " + error);
        });
    },
    iniciarEdicionNombre() {
      if (
        !this.usuarioExperto &&
        !this.usuarioAdministradorAtlas &&
        !this.usuarioSuperadministrador
      ) {
        return;
      }
      this.$refs.inputNuevoNombre.value = this.esteNodo.nombre;
      this.editandoNombre = true;
    },
    guardarNuevoNombre() {
      var nuevoNombre = this.$refs.inputNuevoNombre.value.trim();
      if (nuevoNombre == this.esteNodo.nombre) {
        this.editandoNombre = false;
        return;
      }

      if (nuevoNombre.length < 1) {
        return;
      }
      if (charProhibidosNombreCosa.test(nuevoNombre)) {
        console.log(`Caracteres ilegales`);
        return;
      }
      console.log(`guardando nuevo nombre`);
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $nuevoNombre: String!) {
              editarNombreNodo(idNodo: $idNodo, nuevoNombre: $nuevoNombre) {
                modificados {
                  id
                  nombre
                }
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            nuevoNombre: nuevoNombre,
          },
        })
        .then((data) => {
          console.log(`fin de la mutacion. Data: ${JSON.stringify(data)} `);
          this.enviandoNuevoNombre = false;
          this.editandoNombre = false;
        })
        .catch((error) => {
          this.enviandoNuevoNombre = false;
          console.log(`Error. E :${error}`);
        });
    },
    toggleEditandoDescripcion() {
      if (
        !this.usuarioExperto &&
        !this.usuarioSuperadministrador &&
        !this.usuarioAdministradorAtlas
      ) {
        return;
      }
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.esteNodo.descripcion;

      if (this.editandoDescripcion) {
        this.$nextTick(() => {
          this.$refs.inputNuevoDescripcion.focus();
        });
      }
    },
    guardarNuevoDescripcion() {
      var nuevoDescripcion = this.$refs.inputNuevoDescripcion.value;
      if (nuevoDescripcion == this.esteNodo.descripcion) {
        this.editandoDescripcion = false;
        return;
      }
      console.log(`guardando nuevo descripcion`);
      this.enviandoNuevoDescripcion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $nuevoDescripcion: String!) {
              editarDescripcionNodoConocimiento(
                idNodo: $idNodo
                nuevoDescripcion: $nuevoDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            nuevoDescripcion: nuevoDescripcion,
          },
        })
        .then(() => {
          this.enviandoNuevoDescripcion = false;
          this.editandoDescripcion = false;
        })
        .catch((error) => {
          this.enviandoNuevoDescripcion = false;
          console.log(`Error. E :${error}`);
        });
    },
  },
  computed: {
    indexSeccionSeleccionada() {
      if (!this.seccionSeleccionada) {
        return null;
      }
      return this.esteNodo.secciones.findIndex(
        (s) => s.id === this.idSeccionVisible
      );
    },
    seccionSeleccionada() {
      if (!this.idSeccionVisible) return null;
      return this.esteNodo.secciones.find(
        (s) => s.id === this.idSeccionVisible
      );
    },
    usuarioExperto: function () {
      if (!this.esteNodo.expertos || !this.usuarioLogeado) return false;

      if (this.esteNodo.expertos.includes(this.usuario.id)) {
        return true;
      }
      return false;
    },
    usuarioAdministradorAtlas: function () {
      if (!this.usuario.permisos) return false;
      return this.usuario.permisos.includes("atlasAdminstrador") ? true : false;
    },
    infoAsParent() {
      return {
        id: this.esteNodo.id,
        tipo: "nodoConocimiento",
        nombre: this.esteNodo.nombre,
      };
    },
  },
  watch: {
    mostrandoMenuSecciones(mostrando) {
      if (!mostrando) {
        this.mostrandoBotonesSeccion = null;
      }
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
  gap: 10px;
  width: min(400px, 90%);
  margin: 10px auto;
  text-align: center;
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
  border-bottom: 2px solid var(--paletaMain);
  width: min(300px, 50vw);
  margin: 0px auto;
  gap: 10px;
  padding: 3px 3px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
#contenedorSelectoresSeccion {
  width: min(400px, 90vw);
  margin: 20px auto;
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
  cursor: pointer;
}
.iconoMenuSecciones {
  height: 15px;
}
.nombreSeccionSelector {
  margin: 0px auto;
  text-align: center;
  width: 80%;
  margin-left: 10%;
}
.contenedorBotonesSelectorSeccion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
.contenedorBotonesSelectorSeccion .boton {
  width: 25px;
  height: 25px;
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
#contenedorSteppersSeccion{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin: 50px auto;
}
.steperSeccion{

}

#zonaExpertos {
  width: min(800px, 90vw);
  margin: 0px auto;
}
#listaExpertos {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-height: 80vh;
  overflow-y: scroll;
}
</style>
