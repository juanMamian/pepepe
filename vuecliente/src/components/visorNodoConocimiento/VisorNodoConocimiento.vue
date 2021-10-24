<template>
  <div class="visorNodoConocimiento">
    <div id="layout">
      <div id="zonaNombre">
        <div
          class="controlesZona"
          v-show="
            usuarioExperto ||
            usuarioSuperadministrador ||
            usuarioAdministradorAtlas
          "
        >
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarrNombre"
            class="bEditar botonesControlesZona"
            title="Editar nombre del nodo"
            @click="toggleEditandoNombre"
          />
          <img
            src="@/assets/iconos/guardar.png"
            alt="Guardar"
            title="guardar"
            class="bGuardar botonesControlesZona"
            id="bGuardarNuevoNombre"
            v-show="editandoNombre == true && nuevoNombreIlegal == false"
            @click="guardarNuevoNombre"
          />
        </div>
        <p id="nombre" v-show="!editandoNombre && !$apollo.queries.esteNodo.loading">{{ esteNodo.nombre }}</p>
        <loading id="loadingInfoNodo" texto="Cargando información..." v-show="$apollo.queries.esteNodo.loading"/>
        <input
          type="text"
          id="inputNuevoNombre"
          :class="{ letrasRojas: nuevoNombreIlegal }"
          v-model="nuevoNombre"
          v-show="editandoNombre"
          @keypress.enter="guardarNuevoNombre"
        />
        <loading v-show="enviandoNuevoNombre" texto="Enviando..." />
      </div>

      <!--  -->
      <img
        src="@/assets/iconos/menuMobile.png"
        id="bAbrirBarraLateral"
        @click="mostrandoBarraLateral = !mostrandoBarraLateral"
      />

      <div
        id="barraLateral"
        :class="{ barraLateralInvisible: !mostrandoBarraLateral }"
        @click="mostrandoBarraLateral = false"
      >
        <div
          class="selectorSeccion"
          v-for="seccion of seccionesOrganizadas"
          :class="{
            selectorSeleccionado: seccion.id == idSeccionSeleccionada,
            selectorSeccionBasica: seccion.seccionBasica,
            seccionFuncional:
              seccion.seccionBasica && seccion.id != 'seccionBasica1',
          }"
          :key="seccion.id"
          @click="idSeccionSeleccionada = seccion.id"
          v-show="
            seccion.id != 'seccionBasica4' ||
            usuarioSuperadministrador ||
            usuarioAdministradorAtlas
          "
        >
          {{ seccion.texto }}
          <img
            src="@/assets/iconos/clase.png"
            alt="Clases"
            title="Hay clases ofrecidas acerca de este tema"
            v-show="
              seccion.nombre === 'expertos' &&
              esteNodo.clases &&
              esteNodo.clases.length > 0
            "
            class="anuncioSelectorSeccion"
          />
          <div
            class="controlesSeccion"
            :class="{ deshabilitado: seccion.editandose }"
            v-if="
              usuarioSuperadministrador ||
              usuarioAdministradorAtlas ||
              usuarioExperto
            "
          >
            <div
              class="bControlesSeccion"
              @click.stop="moverSeccion(seccion.id, 'bajar')"
            >
              <div class="bSubirBajar"></div>
            </div>
            <div
              class="bControlesSeccion"
              @click.stop="moverSeccion(seccion.id, 'subir')"
            >
              <div
                class="bSubirBajar bSubir"
                style="
                  transform: rotateZ(180deg);
                  transform-origin: center center;
                "
              ></div>
            </div>
            <img
              src="@/assets/iconos/delete.png"
              alt="Eliminar"
              title="Eliminar esta seccion"
              class="bEliminarSeccion bControlesSeccion"
              v-if="
                usuarioSuperadministrador ||
                usuarioAdministradorAtlas ||
                usuarioExperto
              "
              @click="eliminarSeccion(seccion.id)"
            />
          </div>
        </div>
        <div
          id="bAddSeccion"
          class="botonZonaCrearSeccion"
          v-if="
            usuarioSuperadministrador ||
            usuarioAdministradorAtlas ||
            usuarioExperto
          "
          @click="
            creandoNuevaSeccion = !creandoNuevaSeccion;
            nombreNuevaSeccion = null;
          "
        >
          {{ creandoNuevaSeccion ? "Cancelar" : "Crear sección" }}
        </div>
        <div
          id="creadorSeccion"
          v-if="
            usuarioSuperadministrador ||
            usuarioAdministradorAtlas ||
            usuarioExperto
          "
          v-show="creandoNuevaSeccion"
        >
          <input
            type="text"
            v-model="nombreNuevaSeccion"
            max="30"
            placeholder="Nombre"
            style="font-size: 16px"
            :class="{ letrasRojas: nombreNuevaSeccionIlegal }"
          />
          <div
            id="bCrearNuevaSeccion"
            class="botonZonaCrearSeccion"
            :class="{ deshabilitado: nombreNuevaSeccionIlegal }"
            @click="crearNuevaSeccion"
          >
            Crear
          </div>
        </div>
      </div>

      <!--  -->

      <div id="contenedorSecciones">
        <div
          id="seccionDescripcion"
          class="seccionPrimerNivel"
          v-show="idSeccionSeleccionada == 'seccionBasica1'"
        >
          <div
            class="controlesZona"
            v-show="
              usuarioExperto ||
              usuarioSuperadministrador ||
              usuarioAdministradorAtlas
            "
          >
            <img
              src="@/assets/iconos/editar.png"
              alt="Editar"
              id="bEditarDescripcion"
              class="bEditar botonesControlesZona"
              title="Editar Descripción del nodo"
              @click.stop="toggleEditandoDescripcion"
            />
            <img
              src="@/assets/iconos/guardar.png"
              alt="Guardar"
              title="guardar"
              class="bGuardar botonesControlesZona"
              id="bGuardarNuevoDescripcion"
              v-show="
                editandoDescripcion == true && nuevoDescripcionIlegal == false
              "
              @click.stop="guardarNuevoDescripcion"
            />
          </div>
          <div id="descripcion" ref="descripcion" v-show="!editandoDescripcion">
            {{ esteNodo.descripcion }}
          </div>

          <textarea
            id="inputNuevoDescripcion"
            ref="inputNuevoDescripcion"
            :class="{ letrasRojas: nuevoDescripcionIlegal }"
            v-model="nuevoDescripcion"
            v-show="editandoDescripcion"
            placeholder="¡Escribe una descripción acerca de este tema!"
          />
          <loading v-show="enviandoNuevoDescripcion" texto="Enviando..." />
        </div>
        <div
          :key="seccion.id"
          v-for="seccion of esteNodo.secciones"
          class="seccionPrimerNivel seccionContenidoExterno"
          :class="'seccion' + seccion.nombre"
          v-show="idSeccionSeleccionada == seccion.id"
        >
          <div
            class="barraControlesContenidosExternos"
            v-if="
              usuarioExperto == true ||
              usuarioAdministradorAtlas == true ||
              usuarioSuperadministrador == true
            "
          >
            <img
              src="@/assets/iconos/editar.png"
              alt="Editar"
              :id="'bEditarSeccion' + seccion.nombre"
              class="bEditar botonesEditarContenidosExternos"
              title="Seleccionar archivos de contenido"
              @click.stop="
                editandoArchivosContenidos = !editandoArchivosContenidos
              "
            />
          </div>
          <iframe
            id="visorContenido"
            :ref="'contenidoExterno' + seccion.id"
            :key="'version'+seccion.version"
            :src="direccionNodo + '/' + seccion.id + '/'"
            v-if="!seccion.tipoPrimario || seccion.tipoPrimario.substr(0, 5)!='image'"
            v-show="!editandoArchivosContenidos"
          ></iframe>
          <img 
            :src="direccionNodo + '/' + seccion.id + '/'"           
            alt="Esperando imágen"
            :key="'version'+seccion.version"
            v-show="!editandoArchivosContenidos"
            v-else
            class="imagenContenidoSeccion"
          >
          <div
            class="cuadroCargaArchivos"
            v-if="
              usuarioExperto == true ||
              usuarioAdministradorAtlas == true ||
              usuarioSuperadministrador == true
            "
            v-show="editandoArchivosContenidos"
          >
            <div
              class="archivoExistente"
              :class="{ deshabilitado: archivo.enviandoInfo }"
              :key="index"
              v-for="(archivo, index) of seccion.archivos"
            >
              <div
                class="botonMarcarPrimario"
                :class="{ rojo: archivo.primario }"
                @click="marcarPrimario(archivo, seccion.id)"
              ></div>
              {{ archivo.nombre }}
              <span
                class="botonBorrarArchivoExistente"
                @click="borrarArchivoExistenteSeccionNodo(archivo, seccion.id)"
                >Borrar</span
              >
            </div>
            <input
              type="file"
              class="inputArchivoContenido"
              @change="subirArchivoContenido($event, seccion)"
            />
          </div>
        </div>

        <div
          id="seccionExpertos"
          class="seccionPrimerNivel"
          v-show="idSeccionSeleccionada == 'seccionBasica2'"
        >
          <div id="controlesExpertos" class="controlesZona">
            <loading v-show="enviandoQueryExpertos" texto="Esperando..." />
            <div
              class="controlesExpertos hoverGris botonesControles"
              :class="{ deshabilitado: enviandoQueryExpertos }"
              v-if="
                usuarioLogeado == true &&
                !usuarioExperto &&
                (usuarioSuperadministrador == true ||
                  usuarioAdministradorAtlas == true ||
                  esteNodo.expertos.length == 0)
              "
              id="asumirExperto"
              @click="asumirComoExperto"
            >
              Asumir
            </div>
            <div
              class="controlesExpertos hoverGris botonesControles"
              :class="{ deshabilitado: enviandoQueryExpertos }"
              v-if="
                usuarioLogeado &&
                !usuarioExperto &&
                !usuarioPosibleExperto &&
                esteNodo.expertos.length > 0
              "
              id="botonAddExperto"
              @click="entrarListaPosiblesExpertos"
            >
              Quiero aportar como experto
            </div>
            <div
              class="controlesExpertos hoverGris botonesControles"
              :class="{ deshabilitado: enviandoQueryExpertos }"
              v-if="
                usuarioLogeado == true &&
                (usuarioExperto == true || usuarioPosibleExperto == true)
              "
              @click="abandonarListaExpertos"
            >
              Abandonar
            </div>
            <div
              class="controlesExpertos hoverGris botonesControles"
              :class="{ deshabilitado: enviandoQueryExpertos }"
              v-if="
                (usuarioLogeado == true && usuarioExperto == true) ||
                usuarioSuperadministrador == true
              "
              v-show="
                idExpertoSeleccionado != null &&
                expertoSeleccionadoEstaAceptado == false
              "
              @click="aceptarExperto(idExpertoSeleccionado)"
            >
              Aceptar como experto
            </div>
            <div
              class="controlesExpertos hoverGris botonesControles"
              :class="{ deshabilitado: enviandoQueryExpertos }"
              v-if="usuarioLogeado == true && usuarioExperto == true"
              @click="ofrecerClase()"
            >
              Ofrezco una clase
            </div>
          </div>
          <div id="listaExpertos">
            <icono-persona-autonomo
              :idPersona="idPersona"
              :key="idPersona"
              v-for="idPersona of esteNodo.expertos"
              :seleccionado="idExpertoSeleccionado == idPersona"
              @click.native.stop="
                idExpertoSeleccionado = idPersona;
                expertoSeleccionadoEstaAceptado = true;
              "
            >
              <template v-slot:alertas>
                <img
                  v-show="
                    esteNodo.clases.some((c) => c.idExperto === idPersona)
                  "
                  src="@/assets/iconos/clase.png"
                  alt="Clase"
                  class="iconoExpertoConClase"
                  style="width: 20px"
                />
              </template>
            </icono-persona-autonomo>

            <icono-persona-autonomo
              class="personaPosibleExperto"
              :idPersona="idPersona"
              :key="idPersona"
              v-for="idPersona of esteNodo.posiblesExpertos"
              :seleccionado="idExpertoSeleccionado == idPersona"
              @click.native.stop="
                idExpertoSeleccionado = idPersona;
                expertoSeleccionadoEstaAceptado = false;
              "
              v-show="
                usuarioExperto ||
                (usuario && usuario.id && usuario.id === idPersona)
              "
              @dblclick.native.shift="aceptarExperto(idPersona)"
            />
          </div>

          <div id="zonaClases">
            <div id="listaClases">
              <clase-nodo
                @meElimine="eliminarClaseCache(clase.id)"
                :usuarioExperto="usuarioExperto"
                :idNodo="esteNodo.id"
                v-for="clase of esteNodo.clases"
                :key="clase.id"
                :estaClase="clase"
              />
            </div>
          </div>
        </div>

        <div
          id="seccionForos"
          ref="zonaForos"
          class="seccionPrimerNivel"
          v-show="idSeccionSeleccionada == 'seccionBasica3'"
        >
          <div class="nombreForo" v-if="usuarioExperto">Foro expertos</div>
          <foro
            :parent="infoAsParent"
            v-if="usuarioExperto"
            :idForo="esteNodo.idForoExpertos"
          />
          <br v-if="usuarioExperto" />
          <div class="nombreForo">Foro público</div>
          <foro :parent="infoAsParent" :idForo="esteNodo.idForoPublico" />
        </div>

        <div
          id="seccionKeywords"
          class="seccionPrimerNivel"
          v-show="
            idSeccionSeleccionada == 'seccionBasica4' &&
            (usuarioSuperadministrador || usuarioAdministradorAtlas)
          "
        >
          <div
            class="controlesZona"
            v-show="
              usuarioExperto ||
              usuarioSuperadministrador ||
              usuarioAdministradorAtlas
            "
          >
            <img
              src="@/assets/iconos/editar.png"
              alt="Editar"
              id="bEditarKeywords"
              class="bEditar botonesControlesZona"
              title="Editar keywords del nodo"
              @click.stop="toggleEditandoKeywords"
            />
            <img
              src="@/assets/iconos/guardar.png"
              alt="Guardar"
              title="guardar"
              class="bGuardar botonesControlesZona"
              id="bGuardarNuevoKeywords"
              v-show="editandoKeywords == true && nuevoKeywordsIlegal == false"
              @click.stop="guardarNuevoKeywords"
            />
          </div>
          <div id="keywords" ref="keywords" v-show="!editandoKeywords">
            {{ esteNodo.keywords }}
          </div>

          <textarea
            id="inputNuevoKeywords"
            ref="inputNuevoKeywords"
            :class="{ letrasRojas: nuevoKeywordsIlegal }"
            v-model="nuevoKeywords"
            v-show="editandoKeywords"
            placeholder="Escribe las palabras clave para encontrar este nodo"
            @keypress.enter.prevent.stop="guardarNuevoKeywords"
          />
          <loading v-show="enviandoNuevoKeywords" texto="Enviando..." />
        </div>
      </div>

      <!--  -->
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";
import IconoPersonaAutonomo from "../usuario/IconoPersonaAutonomo.vue";
import Foro from "../foros/Foro.vue";
import axios from "axios";
import ClaseNodo from "./ClaseNodo.vue";

const charProhibidosDescripcionNodo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?"@=-]/;
const charProhibidosNombreNodo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
const charProhibidosNombreNuevaSeccion = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
const charProhibidosKeywordsNodo = /[^ a-zA-Z0-9]/;

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
  components: { Loading, IconoPersonaAutonomo, Foro, ClaseNodo },
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
        var nuevoNodo=JSON.parse(JSON.stringify(nodo));
        nuevoNodo.secciones.forEach((seccion) => {
          seccion.subiendoArchivo = false;
          seccion.editandose = false;
          seccion.texto = seccion.nombre;
          seccion.archivos.forEach((archivo) => {
            archivo.enviandoInfo = false;
          });
          seccion.version=0
        });        
        return nuevoNodo;
      },
    },
  },
  data() {
    return {
      esteNodo: {
        expertos: [],
        posiblesExpertos: [],
        secciones: [],
        clases: [],
      },
      seccionesBasicas: [
        {
          nombre: "descripcion",
          texto: "Descripción",
          id: "seccionBasica1",
          seccionBasica: true,
        },
        {
          nombre: "expertos",
          texto: "Expertos",
          id: "seccionBasica2",
          seccionBasica: true,
        },
        {
          nombre: "foros",
          texto: "Foros",
          id: "seccionBasica3",
          seccionBasica: true,
        },
        {
          nombre: "keywords",
          texto: "Palabras clave",
          id: "seccionBasica4",
          seccionBasica: true,
        },
      ],
      indexInicioContenidos: 1,
      seccionesContenidos: [
        {
          nombre: "explicacion",
          texto: "Explicación",
          editandose: false,
          subiendoArchivo: false,
        },
      ],
      idSeccionSeleccionada: "seccionBasica1",

      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: null,
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,

      nuevoKeywords: null,
      editandoKeywords: false,
      enviandoNuevoKeywords: false,

      idExpertoSeleccionado: null,
      expertoSeleccionadoEstaAceptado: false,
      enviandoQueryExpertos: false,

      editandoArchivosContenidos: false,

      versionExplicacionRef: 0,

      nombreNuevaSeccion: "",
      creandoNuevaSeccion: false,

      mostrandoBarraLateral: false,
    };
  },
  computed: {
    seccionesOrganizadas() {
      let lasSecciones = [
        this.seccionesBasicas[0],
        ...this.esteNodo.secciones,
        ...this.seccionesBasicas.slice(1),
      ];

      return lasSecciones;
    },
    direccionNodo: function () {
      return (
        this.serverUrl +
        "/assetsAtlas/contenidosNodos/" +
        this.$route.params.idNodo
      );
    },
    usuarioExperto: function () {
      if (!this.esteNodo.expertos) return false;

      if (this.esteNodo.expertos.includes(this.usuario.id)) {
        return true;
      }
      return false;
    },
    usuarioPosibleExperto: function () {
      if (!this.esteNodo.posiblesExpertos) return false;

      if (this.esteNodo.posiblesExpertos.includes(this.usuario.id)) {
        return true;
      }
      return false;
    },
    nuevoNombreIlegal() {
      if (this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreNodo.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoDescripcionIlegal() {
      if (!this.nuevoDescripcion || this.nuevoDescripcion.length < 1) {
        return true;
      }
      if (charProhibidosDescripcionNodo.test(this.nuevoDescripcion)) {
        return true;
      }
      return false;
    },
    nuevoKeywordsIlegal() {
      if (!this.nuevoKeywords || this.nuevoKeywords.length < 1) {
        return true;
      }
      if (charProhibidosKeywordsNodo.test(this.nuevoKeywords)) {
        return true;
      }
      return false;
    },
    infoAsParent() {
      return {
        id: this.esteNodo.id,
        tipo: "nodoConocimiento",
        nombre: this.esteNodo.nombre,
      };
    },
    usuarioAdministradorAtlas: function () {
      if (!this.$store.state.usuario.permisos) return false;
      return this.$store.state.usuario.permisos.includes("atlasAdministrador")
        ? true
        : false;
    },
    nombreNuevaSeccionIlegal() {
      if (!this.nombreNuevaSeccion || this.nombreNuevaSeccion.length < 1) {
        return true;
      }
      if (charProhibidosNombreNuevaSeccion.test(this.nombreNuevaSeccion)) {
        return true;
      }
      return false;
    },
  },
  methods: {
    toggleEditandoDescripcion() {
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.esteNodo.descripcion;
    },
    toggleEditandoKeywords() {
      this.$refs.inputNuevoKeywords.style.height =
        this.$refs.keywords.offsetHeight + "px";
      this.editandoKeywords = !this.editandoKeywords;
      this.nuevoKeywords = this.esteNodo.keywords;
    },
    toggleEditandoNombre() {
      this.editandoNombre = !this.editandoNombre;
      this.nuevoNombre = this.esteNodo.nombre;
    },
    guardarNuevoDescripcion() {
      if (this.nuevoDescripcionIlegal) {
        console.log(`Descripción ilegal`);
        return;
      }
      if (this.nuevoDescripcion == this.esteNodo.descripcion) {
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
            nuevoDescripcion: this.nuevoDescripcion,
          },
        })
        .then(() => {
          this.enviandoNuevoDescripcion = false;
          this.editandoDescripcion = false;
        })
        .catch(({ graphQLErrors }) => {
          this.enviandoNuevoDescripcion = false;
          console.log(`Error. E :${graphQLErrors}`);
        });
    },
    guardarNuevoKeywords() {
      if (this.nuevoKeywordsIlegal) {
        console.log(`Keywords ilegal`);
        return;
      }
      if (this.nuevoKeywords == this.esteNodo.keywords) {
        this.editandoKeywords = false;
        return;
      }
      console.log(`guardando nuevo keywords`);
      this.enviandoNuevoKeywords = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $nuevoKeywords: String!) {
              editarKeywordsNodoConocimiento(
                idNodo: $idNodo
                nuevoKeywords: $nuevoKeywords
              ) {
                id
                keywords
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            nuevoKeywords: this.nuevoKeywords,
          },
        })
        .then(() => {
          this.enviandoNuevoKeywords = false;
          this.editandoKeywords = false;
        })
        .catch(({ graphQLErrors }) => {
          this.enviandoNuevoKeywords = false;
          console.log(`Error. E :${graphQLErrors}`);
        });
    },
    abandonarListaExpertos() {
      console.log(`Abandonando la responsabilidad en este nodo`);
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
            idUsuario: this.usuario.id,
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
    aceptarExperto(idPosibleExperto) {
      console.log(`aceptando como experto al usuario ${idPosibleExperto}`);
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
            idUsuario: idPosibleExperto,
          },
        })
        .then(() => {
          this.enviandoQueryExpertos = false;
          this.expertoSeleccionadoEstaAceptado = true;
        })
        .catch((error) => {
          this.enviandoQueryExpertos = false;
          console.log("error: " + error);
        });
    },
    entrarListaPosiblesExpertos() {
      console.log(
        `Enviando peticion de entrar a la lista de posibles expertos del nodo con id ${this.esteNodo.id}`
      );
      this.enviandoQueryExpertos = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idUsuario: ID!) {
              addPosibleExpertoNodo(idNodo: $idNodo, idUsuario: $idUsuario) {
                id
                posiblesExpertos
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            idUsuario: this.$store.state.usuario.id,
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
    asumirComoExperto() {
      console.log(
        `enviando id ${this.$store.state.usuario.id} para la lista de expertos del nodo con id ${this.esteNodo.id}`
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
            idUsuario: this.usuario.id,
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
    guardarNuevoNombre() {
      if (this.nuevoNombreIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoNombre == this.esteNodo.nombre) {
        this.editandoNombre = false;
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
            nuevoNombre: this.nuevoNombre,
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
    subirArchivoContenido(e, seccion) {
      let inputArchivo = e.target;
      var datos = new FormData();
      const nuevoArchivo = inputArchivo.files[0];

      datos.append("nuevoArchivo", nuevoArchivo);
      datos.append("idNodo", this.esteNodo.id);
      datos.append("idSeccion", seccion.id);
      seccion.subiendoArchivo = true;
      axios({
        method: "post",
        url: this.serverUrl + "/api/atlas/subirArchivoContenidoSeccionNodo",
        data: datos,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + this.$store.state.token,
        },
      })
        .then(({ data: { infoArchivo } }) => {
          seccion.subiendoArchivo = false;

          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_NODO,
            variables: {
              idNodo: this.$route.params.idNodo,
            },
          });

          var nuevoCache = JSON.parse(JSON.stringify(cache));
          var laSeccion = nuevoCache.nodo.secciones.find(
            (s) => s.id == seccion.id
          );
          laSeccion.archivos.push(infoArchivo);
          store.writeQuery({
            query: QUERY_NODO,
            variables: {
              idNodo: this.$route.params.idNodo,
            },
            data: nuevoCache,
          });
        })
        .catch((error) => {
          seccion.subiendoArchivo = false;
          console.log(`Error subiendo archivo. E: ${error}`);
        });
    },
    borrarArchivoExistenteSeccionNodo(archivo, idSeccion) {
      const nombreArchivo = archivo.nombre;
      if (!confirm("Borrando archivo ¿Continuar?")) {
        console.log(`Cancelado`);
        return;
      }
      const dis = this;
      archivo.enviandoInfo = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idSeccion: ID!, $nombreArchivo: String!) {
              eliminarArchivoSeccionNodo(
                idNodo: $idNodo
                idSeccion: $idSeccion
                nombreArchivo: $nombreArchivo
              )
            }
          `,
          variables: {
            idNodo: this.$route.params.idNodo,
            idSeccion,
            nombreArchivo,
          },
          update(store, { data: { eliminarArchivoSeccionNodo } }) {
            archivo.enviandoInfo = false;

            if (!eliminarArchivoSeccionNodo) {
              console.log(`Archivo no eliminado`);
              return;
            }
            const cache = store.readQuery({
              query: QUERY_NODO,
              variables: {
                idNodo: dis.$route.params.idNodo,
              },
            });
            var nuevoCache = JSON.parse(JSON.stringify(cache));

            var laSeccion = nuevoCache.nodo.secciones.find(
              (s) => s.id == idSeccion
            );
            if (!laSeccion) {
              console.log(`Seccion no encontrada`);
              return;
            }

            var indexA = laSeccion.archivos.findIndex(
              (a) => a.nombre == nombreArchivo
            );
            if (indexA > -1) {
              laSeccion.archivos.splice(indexA, 1);
              store.writeQuery({
                query: QUERY_NODO,
                variables: {
                  idNodo: dis.$route.params.idNodo,
                },
                data: nuevoCache,
              });
            } else {
              console.log(`Archivo no encontrado`);
            }
          },
        })
        .then(() => {})
        .catch((error) => {
          archivo.enviandoInfo = false;
          console.log(`Error. E: ${error}`);
        });
    },
    marcarPrimario(archivo, idSeccion) {
      const nombreArchivo = archivo.nombre;

      console.log(
        `Marcando ${nombreArchivo} como primario en la sección ${idSeccion}`
      );

      // const dis = this;
      archivo.enviandoInfo = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idSeccion: ID!, $nombreArchivo: String!) {
              marcarPrimarioArchivoSeccionNodo(
                idNodo: $idNodo
                idSeccion: $idSeccion
                nombreArchivo: $nombreArchivo
              ){
                id
                tipoPrimario
              }
            }
          `,
          variables: {
            idNodo: this.$route.params.idNodo,
            idSeccion,
            nombreArchivo,
          },
          // update(store, { data } ) {
          //   archivo.enviandoInfo = false;
            
          //   const cache = store.readQuery({
          //     query: QUERY_NODO,
          //     variables: {
          //       idNodo: dis.$route.params.idNodo,
          //     },
          //   });
          //   var nuevoCache = JSON.parse(JSON.stringify(cache));

          //   var laSeccion = nuevoCache.nodo.secciones.find(
          //     (s) => s.id == idSeccion
          //   );
          //   if (!laSeccion) {
          //     console.log(`Seccion no encontrada`);
          //     return;
          //   }

          //   laSeccion.archivos.forEach((archivo) => {
          //     archivo.primario = archivo.nombre == nombreArchivo ? true : false;
          //   });

          //   store.writeQuery({
          //     query: QUERY_NODO,
          //     variables: {
          //       idNodo: dis.$route.params.idNodo,
          //     },
          //     data: nuevoCache,
          //   });
          // },
        })
        .then(() => {
          var laSeccion=this.esteNodo.secciones.find(s=>s.id===idSeccion);
          if(!laSeccion){
            console.log(`Seccion no encontrada`);
          }
          laSeccion.version++;
          laSeccion.archivos.forEach((archivo) => {
            archivo.primario = archivo.nombre == nombreArchivo ? true : false;
          });
        })
        .catch((error) => {
          archivo.enviandoInfo = false;
          console.log(`Error. E: ${error}`);
        });
    },
    crearNuevaSeccion() {
      console.log(
        `Creando nueva sección con nombre ${this.nombreNuevaSeccion}`
      );
      const dis = this;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $nombreNuevaSeccion: String!) {
              crearNuevaSeccionNodoConocimiento(
                idNodo: $idNodo
                nombreNuevaSeccion: $nombreNuevaSeccion
              ) {
                id
                nombre
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
            nombreNuevaSeccion: this.nombreNuevaSeccion,
          },
        })
        .then(({ data: { crearNuevaSeccionNodoConocimiento } }) => {
          console.log(
            `Seccion creada: ${JSON.stringify(
              crearNuevaSeccionNodoConocimiento
            )}`
          );
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
          this.nombreNuevaSeccion = null;
        })
        .catch((error) => {
          console.log(`Error. E: ${error}`);
        });
    },
    eliminarSeccion(idSeccion) {
      if (
        !confirm(
          "Eliminando esta sección con todos sus contenidos. ¿Continuar?"
        )
      ) {
        return;
      }
      var laSeccion = this.esteNodo.secciones.find((s) => s.id == idSeccion);
      laSeccion.editandose = true;
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
          laSeccion.editandose = false;
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
          laSeccion.editandose = false;
          console.log(`Error: E: ${error}`);
        });
    },
    moverSeccion(idSeccion, movimiento) {
      const index = this.esteNodo.secciones.findIndex((s) => s.id == idSeccion);
      if (
        index < 0 ||
        (movimiento == "subir" && index == 0) ||
        (movimiento == "bajar" && index == this.esteNodo.secciones.length - 1)
      )
        return;

      var laSeccion = this.esteNodo.secciones.find((s) => s.id == idSeccion);

      this.$set(laSeccion, "editandose", true);

      var mov = 0;
      if (movimiento == "subir") mov = -1;
      if (movimiento == "bajar") mov = 1;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idSeccion: ID!, $movimiento: Int!) {
              moverSeccionNodoConocimiento(
                idNodo: $idNodo
                idSeccion: $idSeccion
                movimiento: $movimiento
              )
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            idSeccion,
            movimiento: mov,
          },
        })
        .then(({ data: { moverSeccionNodoConocimiento } }) => {
          laSeccion.editandose = false;
          if (moverSeccionNodoConocimiento) {
            const store = this.$apollo.provider.defaultClient;
            const cache = store.readQuery({
              query: QUERY_NODO,
              variables: { idNodo: this.esteNodo.id },
            });
            var nuevoCache = JSON.parse(JSON.stringify(cache));
            const indexS = nuevoCache.nodo.secciones.findIndex(
              (s) => s.id == idSeccion
            );
            if (indexS > -1) {
              nuevoCache.nodo.secciones.splice(
                indexS + mov,
                0,
                nuevoCache.nodo.secciones.splice(indexS, 1)[0]
              );
              store.writeQuery({
                query: QUERY_NODO,
                variables: { idNodo: this.esteNodo.id },
                data: nuevoCache,
              });
            }
          }
        })
        .catch(() => {
          laSeccion.editandose = false;
          console.log(`Error moviendo sección`);
        });
    },
    ofrecerClase() {
      console.log(`Ofreciendo clase`);
      if (!this.usuario || !this.usuario.id) return;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idExperto: ID!) {
              crearClaseNodoConocimiento(
                idNodo: $idNodo
                idExperto: $idExperto
              ) {
                id
                nombre
                idExperto
                descripcion
                interesados
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            idExperto: this.usuario.id,
          },
        })
        .then(({ data: { crearClaseNodoConocimiento } }) => {
          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_NODO,
            variables: {
              idNodo: this.$route.params.idNodo,
            },
          });

          var nuevoCache = JSON.parse(JSON.stringify(cache));
          const indexC = nuevoCache.nodo.clases.findIndex(
            (c) => c.id === crearClaseNodoConocimiento.id
          );
          if (indexC > -1) {
            nuevoCache.nodo.clases.splice(indexC, 1);
          }
          nuevoCache.nodo.clases.push(crearClaseNodoConocimiento);
          store.writeQuery({
            query: QUERY_NODO,
            variables: {
              idNodo: this.$route.params.idNodo,
            },
            data: nuevoCache,
          });
        });
    },
    eliminarClaseCache(idClase) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_NODO,
        variables: {
          idNodo: this.$route.params.idNodo,
        },
      });

      var nuevoCache = JSON.parse(JSON.stringify(cache));
      const indexC = nuevoCache.nodo.clases.findIndex((c) => c.id === idClase);
      if (indexC > -1) {
        nuevoCache.nodo.clases.splice(indexC, 1);
      } else {
        console.log(`La clase que se iba a eliminar no estaba en el caché`);
      }
      store.writeQuery({
        query: QUERY_NODO,
        variables: {
          idNodo: this.$route.params.idNodo,
        },
        data: nuevoCache,
      });
    },
  },
  mounted(){
    this.$apollo.mutate({
      mutation:gql`
        mutation($idNodo: ID!){
          setNodoConocimientoAsCoordsVistaUsuario(idNodo: $idNodo)
        }
      `,
      variables:{
        idNodo:this.$route.params.idNodo
      }
    }).catch((error)=>{
      console.log(`Error setting coordenadas de usuario: ${error}`);
    })
  }
};
</script>

<style scoped>
.visorNodoConocimiento {
  width: 100%;
  height: 100%;
  background-color: #ffdbaf;
  overflow-x: hidden;
}
#layout {
  width: 100%;
  height: 100%;
  position: relative;
}
#zonaNombre {
  display: flex;
  background-color: burlywood;
  height: 100px;
  width: 100%;
}
#loadingInfoNodo{
  margin: 10px auto;
}
#nombre {
  font-size: 23px;
  text-align: center;
  padding: 10px 30px;
  border-radius: 13px;
  border: 1px solid rgb(80, 0, 0);
  background-color: rgb(255 219 175);
  margin: auto;
}
#inputNuevoNombre {
  font-size: 23px;
  display: block;
  margin: 10px auto;
}
#bAbrirBarraLateral {
  display: block;
  margin: 10px auto;
  width: 50px;
  height: 50px;
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  background-color: rgb(221, 174, 116);
}
#bAbrirBarraLateral:hover {
  background-color: rgb(255, 219, 175);
}
#barraLateral {
  position: absolute;
  top: 180px;
  width: 100%;
  background-color: burlywood;
  z-index: 1;
}
.barraLateralInvisible {
  display: none;
}
#contenedorSecciones {
  width: 100%;
  height: 100%;
}
#visorContenido {
  width: 100%;
  height: 100%;
}
.anuncioSelectorSeccion {
  width: 20px;
  height: 20px;
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background-color: rgba(255, 99, 71, 0.384);
  border-radius: 50%;
}
.selectorSeccion {
  padding: 15px;
  font-size: 23px;
  cursor: pointer;
  position: relative;
}
.selectorSeccion:hover {
  background-color: bisque;
}
.selectorSeccion:hover > .anuncioSelectorSeccion {
  display: block;
  background-color: tomato;
}
.selectorSeleccionado {
  background-color: bisque;
}

.selectorSeccion:not(.selectorSeccionBasica):hover > .controlesSeccion {
  display: block;
}
.bControlesSeccion {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
  display: inline-block;
  margin-right: 5px;
  position: relative;
}
.bControlesSeccion:hover {
  background-color: gray;
}
.bSubirBajar {
  border: 10px solid transparent;
  border-top: 10px solid black;
  width: 1px;
  height: 1px;
  border-radius: 0%;
  position: relative;
  top: 7px;
  left: 2px;
}
.bSubir {
  top: -6px;
}

.controlesSeccion {
  display: none;
  position: absolute;
  top: 0%;
  right: 0%;
}
.botonZonaCrearSeccion {
  cursor: pointer;
  padding: 3px 5px;
  text-align: center;
}
.botonZonaCrearSeccion:hover {
  background-color: cadetblue;
}

.bEliminarSeccion:hover {
  background-color: chocolate;
}
.seccionPrimerNivel {
  width: 100%;
  height: 100%;
}
#seccionDescripcion {
  min-width: 100px;
  min-height: 100px;
}

#descripcion {
  border: 1px solid rgb(0, 0, 44);
  background-color: #fdeedb;
  border-radius: 10px;
  margin: 65px auto;
  width: min(600px, 90%);
  font-size: 19px;
  padding: 10px;
  min-height: 100px;
  resize: vertical;
  white-space: pre-wrap;
}

#inputNuevoDescripcion {
  width: min(600px, 90%);
  font-size: 19px;
  height: 70px;
  display: block;
  margin: 65px auto;
  resize: vertical;
}
.imagenContenidoSeccion{
  max-width:100%;
  margin: 0px auto;
  display: block;
}
#keywords {
  border: 1px solid rgb(0, 0, 44);
  background-color: #fdeedb;
  border-radius: 10px;
  margin: 65px auto;
  width: min(600px, 90%);
  font-size: 19px;
  padding: 10px;
  min-height: 100px;
  resize: vertical;
  white-space: pre-wrap;
}
#inputNuevoKeywords {
  width: min(600px, 90%);
  font-size: 19px;
  height: 70px;
  display: block;
  margin: 65px auto;
  resize: vertical;
}
.botonesControlesZona {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}
.controlesZona {
  display: flex;
  font-size: 13px;
  flex-direction: row-reverse;
}
.botonesControles {
  padding: 3px 5px;
  cursor: pointer;
}
#listaExpertos {
  display: flex;
  padding: 10px 20px;
  padding-bottom: 65px;
}
.iconoPersonaAutonomo {
  margin: 25px;
}
.personaPosibleExperto {
  opacity: 0.5;
}
.iconoExpertoConClase {
  border-radius: 50%;
  background-color: chocolate;
}
.nombreForo {
  padding: 5px 10px;
  background-color: #5fbf78;
}
.seccionContenidoExterno {
  position: relative;
}
.barraControlesContenidosExternos {
  position: absolute;
  bottom: 100%;
  right: 0%;
  width: 20%;
  display: flex;
  flex-direction: row-reverse;
  opacity: 0.5;
  padding: 5px;
}
.barraControlesContenidosExternos:hover {
  opacity: 1;
}
.botonesEditarContenidosExternos {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  margin-right: 10px;
}
.botonesEditarContenidosExternos:hover {
  background-color: grey;
}
.cuadroCargaArchivos {
  margin: 50px auto;
}
.archivoExistente {
  padding: 5px 10px;
  border-radius: 5px;
  background-color: rgb(107, 235, 107);
  border: 1px solid rgb(0, 48, 0);
  margin: 2px 10px;
  display: flex;
  font-size: 17px;
}
.botonBorrarArchivoExistente {
  margin-left: auto;
  cursor: pointer;
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 13px;
}
.botonBorrarArchivoExistente:hover {
  background-color: grey;
}
.botonMarcarPrimario {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid black;
  cursor: pointer;
  margin-right: 10px;
}
.rojo {
  background-color: red;
}

@media only screen and (min-width: 768px) {
  #layout {
    display: grid;
    grid-template-columns: 250px 1fr 250px;
    grid-template-rows: 70px 1fr;
    grid-template-areas:
      "nombre nombre nombre"
      "barraLateral contenido contenido";
  }
  #zonaNombre {
    grid-area: nombre;
    display: flex;
    height: 100%;
    background-color: burlywood;
  }
  #bAbrirBarraLateral {
    display: none;
  }
  #barraLateral {
    position: unset;
    grid-area: barraLateral;
    background-color: burlywood;
  }
  .barraLateralInvisible {
    display: block;
  }
  #contenedorSecciones {
    grid-area: contenido;
    width: 100%;
    height: 100%;
  }
  .seccionFuncional {
    font-size: 14px;
  }
}
</style>
