<template>
  <div class="ventanitaTrabajo" :class="{ seleccionado }" @mouseup.left.stop="">
    <div
      id="zonaNombre"
      :class="{ bordeAbajo: seleccionado }"
      class="zonaPrimerNivel"
    >
      <div id="nombre">
        <div id="elPropioNombre" v-show="!editandoNombre">
          {{ esteTrabajo.nombre }}
        </div>
        <textarea
          :class="{ letrasRojas: nuevoNombreIlegal }"
          class="inputNuevoNombre"
          cols="30"
          rows="2"
          v-model="nuevoNombre"
          v-show="editandoNombre"
          @keypress.enter.prevent="guardarNuevoNombre"
        >
        </textarea>
        <!-- <input
          type="text"
          class="inputNuevoNombre"
          :class="{ letrasRojas: nuevoNombreIlegal }"
          v-model="nuevoNombre"
          v-show="editandoNombre"
          @keypress.enter="guardarNuevoNombre"
        /> -->
        <div
          class="controlesLateralesZona"
          :class="{ deshabilitado: enviandoNuevoNombre }"
          v-if="usuarioAdministrador"
        >
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarrNombre"
            class="bEditar"
            title="Editar nombre del trabajo"
            @click.stop="toggleEditandoNombre"
          />
          <img
            src="@/assets/iconos/guardar.png"
            alt="Guardar"
            title="guardar"
            class="bGuardar"
            id="bGuardarNuevoNombre"
            v-show="editandoNombre == true && nuevoNombreIlegal == false"
            @click.stop="guardarNuevoNombre"
          />
        </div>
      </div>
      <loading v-show="enviandoNuevoNombre" texto="Enviando..." />
      <img
        src="@/assets/iconos/estrella.png"
        alt=""
        id="imagenIcono"
        :class="{
          iconoCompletado: esteTrabajo.estadoDesarrollo === 'completado',
          deshabilitado: togglingEstado,
        }"
        @click="usuarioAdministrador ? toggleEstadoTrabajo() : null"
      />
    </div>
    <div id="zonaDescripcion" class="zonaPrimerNivel">
      <div
        class="barraSuperiorZona"
        @click="mostrandoDescripcion = !mostrandoDescripcion"
      >
        <div class="nombreZona">
          <div
            class="trianguloBullet"
            :style="{
              transform: mostrandoDescripcion
                ? 'rotateZ(90deg)'
                : 'rotateZ(0deg)',
            }"
          ></div>
          Descripción
        </div>
        <div
          class="controlesZona"
          v-show="usuarioAdministrador && mostrandoDescripcion"
          :class="{ deshabilitado: enviandoNuevoDescripcion }"
        >
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarDescripcion"
            class="bEditar"
            title="Editar descripcion del trabajo"
            v-show="usuarioAdministrador"
            @click.stop="toggleEditandoDescripcion"
          />
          <img
            src="@/assets/iconos/guardar.png"
            alt="Guardar"
            title="guardar"
            class="bGuardar"
            id="bGuardarNuevoDescripcion"
            v-show="
              editandoDescripcion == true && nuevoDescripcionIlegal == false
            "
            @click.stop="guardarNuevoDescripcion"
          />
        </div>
      </div>
      <div v-show="mostrandoDescripcion">
        <div id="descripcion" ref="descripcion" v-show="!editandoDescripcion">
          {{ esteTrabajo.descripcion }}
        </div>

        <textarea
          id="inputNuevoDescripcion"
          ref="inputNuevoDescripcion"
          :class="{ letrasRojas: nuevoDescripcionIlegal }"
          v-model="nuevoDescripcion"
          v-show="editandoDescripcion"
        />
        <loading v-show="enviandoNuevoDescripcion" texto="Enviando..." />
      </div>
    </div>

    <div id="zonaResponsables" class="zonaPrimerNivel">
      <div
        class="barraSuperiorZona"
        @click="mostrandoResponsables = !mostrandoResponsables"
      >
        <div class="nombreZona">
          <div
            class="trianguloBullet"
            :style="{
              transform: mostrandoResponsables
                ? 'rotateZ(90deg)'
                : 'rotateZ(0deg)',
            }"
          ></div>
          Responsable{{ esteTrabajo.responsables.length === 1 ? "" : "s" }}
        </div>
      </div>

      <div v-show="mostrandoResponsables">
        <div
          id="controlesResponsables"
          class="controlesZona"
          :class="{ deshabilitado: enviandoQueryResponsables }"
        >
          <loading v-show="enviandoQueryResponsables" texto="Esperando..." />
          <div
            class="controlesResponsables hoverGris botonesControles"
            :class="{ deshabilitado: enviandoQueryResponsables }"
            v-if="usuarioLogeado == true && esteTrabajo.responsables.length < 1"
            id="asumirResponsable"
            @click="asumirComoResponsable"
          >
            Asumir
          </div>
          <div
            class="controlesResponsables hoverGris botonesControles"
            :class="{ deshabilitado: enviandoQueryResponsables }"
            v-if="
              usuarioLogeado == true &&
              usuarioResponsableTrabajo &&
              responsablesSolicitados < 1
            "
            v-show="idResponsableSeleccionado===null"
            id="solicitarResponsable"
            @click="setResponsablesSolicitados(1)"
          >
            Solicitar responsable
          </div>
          <div
            class="controlesResponsables hoverGris botonesControles"
            :class="{ deshabilitado: enviandoQueryResponsables }"
            v-if="
              usuarioLogeado &&
              !usuarioResponsableTrabajo &&
              !usuarioPosibleResponsableTrabajo &&
              esteTrabajo.responsables.length > 0
            "
            id="botonAddResponsable"
            @click="entrarListaPosiblesResponsables"
          >
            Quiero hacerme responsable
          </div>
          <div
            class="controlesResponsables hoverGris botonesControles"
            :class="{ deshabilitado: enviandoQueryResponsables }"
            v-if="
              usuarioLogeado == true &&
              (usuarioResponsableTrabajo == true ||
                usuarioPosibleResponsableTrabajo == true)
            "
            v-show="idResponsableSeleccionado===null"
            @click="abandonarListaResponsables"
          >
            Abandonar
          </div>
          <div
            class="controlesResponsables hoverGris botonesControles"
            :class="{ deshabilitado: enviandoQueryResponsables }"
            v-if="usuarioLogeado == true && usuarioResponsableTrabajo == true"
            v-show="
              idResponsableSeleccionado != null &&
              responsableSeleccionadoEstaAceptado == false
            "
            @click="aceptarResponsable(idResponsableSeleccionado)"
          >
            Aceptar como responsable
          </div>
        </div>
        <div id="listaResponsables" @click.stop="idResponsableSeleccionado=null">
          <icono-persona-autonomo
            :idPersona="idPersona"
            :key="idPersona"
            v-for="idPersona of esteTrabajo.responsables"
            :seleccionado="idResponsableSeleccionado == idPersona"
            @click.native.stop="
              idResponsableSeleccionado = idPersona;
              responsableSeleccionadoEstaAceptado = true;
            "
          />

          <icono-persona-autonomo
            class="personaPosibleResponsable"
            :idPersona="idPersona"
            :key="idPersona"
            v-for="idPersona of esteTrabajo.posiblesResponsables"
            v-show="
              usuarioResponsableTrabajo ||
              (usuario && usuario.id && usuario.id === idPersona)
            "
            :seleccionado="idResponsableSeleccionado == idPersona"
            @click.native.stop="
              idResponsableSeleccionado = idPersona;
              responsableSeleccionadoEstaAceptado = false;
            "
            @dblclick.native.shift="aceptarResponsable(idPersona)"
          />

          <div
            class="iconoResponsablesSolicitados"
            v-show="responsablesSolicitados > 0"
          >
            <img
              src="@/assets/iconos/user.png"
              alt="Usuario solicitado"
              class="imagenResponsablesSolicitados"
              title="Personas adicionales solicitadas"
            />

            <input
              type="number"
              id="inputResponsablesSolicitados"
              v-model="responsablesSolicitados"
              :readonly="usuarioResponsableTrabajo ? false : true"
              :style="[
                {
                  backgroundColor:
                    esteTrabajo.responsablesSolicitados !=
                    responsablesSolicitados
                      ? 'orange'
                      : 'white',
                },
              ]"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      id="zonaKeywords"
      class="zonaPrimerNivel"
      v-show="usuarioAdministrador"
    >
      <div
        class="barraSuperiorZona"
        @click="mostrandoKeywords = !mostrandoKeywords"
      >
        <div class="nombreZona">
          <div
            class="trianguloBullet"
            :style="{
              transform: mostrandoKeywords ? 'rotateZ(90deg)' : 'rotateZ(0deg)',
            }"
          ></div>
          Palabras clave
        </div>
        <div
          class="controlesZona"
          v-show="usuarioAdministrador && mostrandoKeywords"
          :class="{ deshabilitado: enviandoNuevoKeywords }"
        >
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarKeywords"
            class="bEditar"
            title="Editar keywords del trabajo"
            v-show="usuarioAdministrador"
            @click.stop="toggleEditandoKeywords"
          />
          <img
            src="@/assets/iconos/guardar.png"
            alt="Guardar"
            title="guardar"
            class="bGuardar"
            id="bGuardarNuevoKeywords"
            v-show="editandoKeywords == true && nuevoKeywordsIlegal == false"
            @click.stop="guardarNuevoKeywords"
          />
        </div>
      </div>
      <div v-show="mostrandoKeywords">
        <div id="keywords" ref="keywords" v-show="!editandoKeywords">
          {{ esteTrabajo.keywords }}
        </div>

        <textarea
          id="inputNuevoKeywords"
          ref="inputNuevoKeywords"
          :class="{ letrasRojas: nuevoKeywordsIlegal }"
          v-model="nuevoKeywords"
          v-show="editandoKeywords"
          @keypress.enter.stop.prevent="guardarNuevoKeywords"
        />
        <loading v-show="enviandoNuevoDescripcion" texto="Enviando..." />
      </div>
    </div>

    <img
      src="@/assets/iconos/abrirLink.png"
      class="botonIr"
      @click.stop="navegarAlTrabajo"
      title="Abrir la página de este trabajo"
      v-show="true"
    />

    <div id="controlesTrabajo"></div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";
import IconoPersonaAutonomo from "../usuario/IconoPersonaAutonomo.vue";
import debounce from "debounce";

const charProhibidosNombreTrabajo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
const charProhibidosDescripcionTrabajo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
const charProhibidosKeywords = /[^ a-zA-Z0-9]/;

export default {
  name: "VentanitaTrabajo",
  components: { Loading, IconoPersonaAutonomo },
  data() {
    return {
      deshabilitado: false,

      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      mostrandoDescripcion: true,
      nuevoDescripcion: "Nueva descripcion",
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,

      mostrandoKeywords: false,
      nuevoKeywords: null,
      editandoKeywords: false,
      enviandoNuevoKeywords: false,

      togglingEstado: false,

      mostrandoResponsables: false,
      responsablesSolicitados: 0,
      idPosibleResponsableSeleccionado: null,
      idResponsableSeleccionado: null,
      responsableSeleccionadoEstaAceptado: false,
      enviandoQueryResponsables: false,
    };
  },
  props: {
    idTrabajo: String,
    esteTrabajo: Object,
    seleccionado: Boolean,
  },
  computed: {
    nuevoNombreIlegal() {
      if (this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreTrabajo.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoDescripcionIlegal() {
      if (!this.nuevoDescripcion || this.nuevoDescripcion.length < 1) {
        return true;
      }
      if (charProhibidosDescripcionTrabajo.test(this.nuevoDescripcion)) {
        return true;
      }
      return false;
    },
    nuevoKeywordsIlegal() {
      if (!this.nuevoKeywords || this.nuevoKeywords.length < 1) {
        return true;
      }
      if (charProhibidosKeywords.test(this.nuevoKeywords)) {
        return true;
      }
      return false;
    },
    usuarioResponsableTrabajo() {
      if (!this.usuario || !this.usuario.id) return false;
      return this.esteTrabajo.responsables.includes(this.usuario.id);
    },
    usuarioAdministrador() {
      if (!this.usuario || !this.usuario.id) return false;
      return this.esteTrabajo.administradores.includes(this.usuario.id);
    },
    usuarioPosibleResponsableTrabajo: function () {
      if (!this.esteTrabajo.posiblesResponsables) return false;

      if (this.esteTrabajo.posiblesResponsables.includes(this.usuario.id)) {
        return true;
      }
      return false;
    },
  },
  methods: {
    guardarNuevoNombre() {
      if (this.nuevoNombreIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoNombre == this.esteTrabajo.nombre) {
        this.editandoNombre = false;
        return;
      }
      console.log(`guardando nuevo nombre`);
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idTrabajo: ID!, $nuevoNombre: String!) {
              editarNombreTrabajo(
                idTrabajo: $idTrabajo
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idTrabajo: this.esteTrabajo.id,
            nuevoNombre: this.nuevoNombre,
          },
        })
        .then(() => {
          this.enviandoNuevoNombre = false;
          this.editandoNombre = false;
        })
        .catch((error) => {
          this.enviandoNuevoNombre = false;
          console.log(`Error. E :${error}`);
        });
    },
    guardarNuevoDescripcion() {
      if (this.nuevoDescripcionIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoDescripcion == this.esteTrabajo.descripcion) {
        this.editandoDescripcion = false;
        return;
      }
      console.log(`guardando nuevo descripcion`);
      this.enviandoNuevoDescripcion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idTrabajo: ID!, $nuevoDescripcion: String!) {
              editarDescripcionTrabajo(
                idTrabajo: $idTrabajo
                nuevoDescripcion: $nuevoDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idTrabajo: this.esteTrabajo.id,
            nuevoDescripcion: this.nuevoDescripcion,
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
    guardarNuevoKeywords() {
      if (this.nuevoKeywordsIlegal) {
        console.log(`Keywords ilegal`);
        return;
      }
      if (this.nuevoKeywords == this.esteTrabajo.keywords) {
        this.editandoKeywords = false;
        return;
      }
      console.log(`guardando nuevo keywords`);
      this.enviandoNuevoKeywords = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idTrabajo: ID!, $nuevoKeywords: String!) {
              editarKeywordsTrabajo(
                idTrabajo: $idTrabajo
                nuevoKeywords: $nuevoKeywords
              ) {
                id
                keywords
              }
            }
          `,
          variables: {
            idTrabajo: this.esteTrabajo.id,
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
    toggleEditandoNombre() {
      this.editandoNombre = !this.editandoNombre;
      this.nuevoNombre = this.esteTrabajo.nombre;
    },
    toggleEditandoDescripcion() {
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.esteTrabajo.descripcion;
    },
    toggleEditandoKeywords() {
      this.$refs.inputNuevoKeywords.style.height =
        this.$refs.keywords.offsetHeight + "px";
      this.editandoKeywords = !this.editandoKeywords;
      this.nuevoKeywords = this.esteTrabajo.keywords;
    },
    toggleEstadoTrabajo() {
      var nuevoEstado = "noCompletado";
      if (this.esteTrabajo.estadoDesarrollo === "noCompletado") {
        nuevoEstado = "completado";
      }
      this.togglingEstado = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idTrabajo: ID!, $nuevoEstado: String!) {
              setEstadoTrabajo(
                idTrabajo: $idTrabajo
                nuevoEstado: $nuevoEstado
              ) {
                id
                estadoDesarrollo
              }
            }
          `,
          variables: {
            idTrabajo: this.esteTrabajo.id,
            nuevoEstado,
          },
        })
        .then(() => {
          this.togglingEstado = false;
          console.log(`toggled`);
        })
        .catch((error) => {
          this.togglingEstado = false;
          console.log(`Error: E:${error}`);
        });
    },
    entrarListaPosiblesResponsables() {
      console.log(
        `Enviando peticion de entrar a la lista de posibles responsables del trabajo con id ${this.esteTrabajo.id}`
      );
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idTrabajo: ID!, $idUsuario: ID!) {
              addPosibleResponsableTrabajo(
                idTrabajo: $idTrabajo
                idUsuario: $idUsuario
              ) {
                id
                posiblesResponsables
              }
            }
          `,
          variables: {
            idTrabajo: this.esteTrabajo.id,
            idUsuario: this.usuario.id,
          },
        })
        .then(() => {
          this.enviandoQueryResponsables = false;
        })
        .catch((error) => {
          this.enviandoQueryResponsables = false;
          console.log("error: " + error);
        });
    },
    abandonarListaResponsables() {
      console.log(`Abandonando la responsabilidad en este trabajo`);
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idTrabajo: ID!, $idUsuario: ID!) {
              removeResponsableTrabajo(
                idTrabajo: $idTrabajo
                idUsuario: $idUsuario
              ) {
                id
                responsables
                posiblesResponsables
                administradores
              }
            }
          `,
          variables: {
            idTrabajo: this.esteTrabajo.id,
            idUsuario: this.usuario.id,
          },
        })
        .then(() => {
          this.enviandoQueryResponsables = false;
        })
        .catch((error) => {
          this.enviandoQueryResponsables = false;
          console.log("error: " + error);
        });
    },
    aceptarResponsable(idPosibleResponsable) {
      console.log(
        `aceptando como responsable al usuario ${idPosibleResponsable}`
      );
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idTrabajo: ID!, $idUsuario: ID!) {
              addResponsableTrabajo(
                idTrabajo: $idTrabajo
                idUsuario: $idUsuario
              ) {
                id
                responsables
                posiblesResponsables
                responsablesSolicitados
                administradores
              }
            }
          `,
          variables: {
            idTrabajo: this.esteTrabajo.id,
            idUsuario: idPosibleResponsable,
          },
        })
        .then(() => {
          this.enviandoQueryResponsables = false;
          this.responsableSeleccionadoEstaAceptado = true;
          this.versionCalendario++;
        })
        .catch((error) => {
          this.enviandoQueryResponsables = false;
          console.log("error: " + error);
        });
    },
    asumirComoResponsable() {
      console.log(
        `enviando id ${this.$store.state.usuario.id} para la lista de responsables del trabajo con id ${this.esteTrabajo.id}`
      );
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idTrabajo: ID!, $idUsuario: ID!) {
              addResponsableTrabajo(
                idTrabajo: $idTrabajo
                idUsuario: $idUsuario
              ) {
                id
                responsables
                posiblesResponsables
                administradores
              }
            }
          `,
          variables: {
            idTrabajo: this.esteTrabajo.id,
            idUsuario: this.$store.state.usuario.id,
          },
        })
        .then(() => {
          this.enviandoQueryResponsables = false;
          this.versionCalendario++;
        })
        .catch((error) => {
          this.enviandoQueryResponsables = false;
          console.log("error: " + error);
        });
    },
    debounceSetResponsablesSolicitados: debounce(function () {
      this.setResponsablesSolicitados(parseInt(this.responsablesSolicitados));
    }, 2000),
    setResponsablesSolicitados(cantidad) {
      if (cantidad < 0) cantidad = 0;
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idTrabajo: ID!
              $nuevoCantidadResponsablesSolicitados: Int!
            ) {
              setResponsablesSolicitadosTrabajo(
                idTrabajo: $idTrabajo
                nuevoCantidadResponsablesSolicitados: $nuevoCantidadResponsablesSolicitados
              ) {
                id
                responsablesSolicitados
              }
            }
          `,
          variables: {
            idTrabajo: this.esteTrabajo.id,
            nuevoCantidadResponsablesSolicitados: cantidad,
          },
        })
        .then(({ data: { setResponsablesSolicitadosTrabajo } }) => {
          this.enviandoQueryResponsables = false;
          this.responsablesSolicitados =
            setResponsablesSolicitadosTrabajo.responsablesSolicitados;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoQueryResponsables = false;
        });
    },
    navegarAlTrabajo() {
      this.$router.push("/trabajo/" + this.esteTrabajo.id);
    },
  },
  watch: {
    responsablesSolicitados(nuevo) {
      if (nuevo === this.esteTrabajo.responsablesSolicitados) return;
      console.log(`Cambio en responsables solicitados`);
      if (nuevo < 1) {
        this.setResponsablesSolicitados(parseInt(nuevo));
      } else {
        this.debounceSetResponsablesSolicitados();
      }
    },
  },
  mounted() {
    this.responsablesSolicitados = this.esteTrabajo.responsablesSolicitados;
  },
};
</script>

<style scoped>
.ventanitaTrabajo {
  border: 2px solid #585858;
  border-radius: 5px;
  min-height: 10px;
  position: relative;
  padding: 5px 0px;
  padding-bottom: 10px;
  background-color: rgb(231, 182, 182);
}

.seleccionado {
  box-shadow: 2px 2px 2px 2px rgb(54, 54, 54);
  padding-bottom: 25px;
}
.botonesControles {
  padding: 3px 5px;
  cursor: pointer;
}
#controlesTrabajo {
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
  flex-direction: row-reverse;
}
.controlesTrabajo {
  padding: 3px 5px;
  cursor: pointer;
}
#descripcion {
  min-width: 100px;
  min-height: 50px;
  border: 2px solid pink;
  padding: 3px 30px;
}
#imagenIcono {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}

.iconoCompletado {
  background-color: rgb(44, 136, 44);
}

.zonaPrimerNivel {
  position: relative;
  min-height: 50px;
}
.barraSuperiorZona {
  display: flex;
  background-color: teal;
  cursor: pointer;
}
.nombreZona {
  font-size: 18px;
  padding: 5px 5px;
}
#nombre {
  margin-top: 15px;
  font-size: 19px;
  padding: 5px 5px;
  display: grid;
  grid-template-columns: 1fr 5fr 1fr;
  margin-bottom: 15px;
}

#elPropioNombre {
  font-size: 19px;
  padding: 5px;
  font-weight: bolder;
  text-align: center;
  grid-column: 2/3;
}

.inputNuevoNombre {
  font-size: 16px;
  display: block;
  margin: 10px auto;
  grid-column: 2/3;
  width: 100%;
  resize: vertical;
  box-sizing: border-box;
}
#descripcion {
  font-size: 19px;
  width: 95%;
  margin: 10px auto;
  padding: 10px;
  min-height: 100px;
  resize: vertical;
  border: none;
  background-color: transparent;
  white-space: pre-wrap;
}

#inputNuevoDescripcion {
  width: 95%;
  font-size: 19px;
  height: 70px;
  display: block;
  margin: 10px auto;
  resize: vertical;
}

.bEditar {
  width: 30px;
  height: 30px;
  border-radius: 50%;

  cursor: pointer;
}
.bEditar:hover {
  background-color: rgb(209, 209, 209);
}
.bGuardar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}
.bGuardar:hover {
  background-color: rgb(209, 209, 209);
}
.bEliminar:hover {
  background-color: red;
}
.controlesLateralesZona {
  grid-column: 3/4;
  display: flex;
  flex-direction: row-reverse;
}
.controlesZona {
  margin-left: auto;
  display: flex;
  font-size: 13px;
  flex-direction: row-reverse;
}

#listaResponsables {
  display: flex;
  padding: 10px 20px;
  padding-bottom: 65px;
  flex-wrap: wrap;
}
.iconoPersonaAutonomo {
  margin-right: 20px;
  margin-left: 15px;
  vertical-align: middle;
  margin-top: 5px;
  margin-bottom: 55px;
}
.personaPosibleResponsable {
  opacity: 0.5;
}
.iconoResponsablesSolicitados {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}
#inputResponsablesSolicitados {
  height: 20px;
  width: 40px;
  margin: 5px auto;
  display: block;
}
.imagenResponsablesSolicitados {
  width: 100%;
  height: 100%;
}
#keywords {
  border: 1px solid rgb(0, 0, 44);
  background-color: #fdeedb;
  border-radius: 10px;
  margin: 5px auto;
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
  margin: 5px auto;
  resize: vertical;
}
.botonIr {
  cursor: pointer;
  z-index: 10;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  padding: 5px;
  margin: 6px auto;
  display: block;
  background-color: rgb(201, 136, 90);
}
.botonIr:hover {
  background-color: rgb(207, 113, 46);
}
.trianguloBullet {
  border: 10px solid transparent;
  border-left: 10px solid black;
  display: inline-block;

  transform-origin: 25% 70%;
  transition: transform 0.2s;
}
</style>