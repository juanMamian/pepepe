<template>
  <div
    class="ventanitaObjetivo"
    :class="{ seleccionado }"
    @mouseup.left.stop=""
  >
    <div
      id="zonaNombre"
      :class="{ bordeAbajo: seleccionado }"
      class="zonaPrimerNivel"
    >
      <div id="nombre">
        <div id="elPropioNombre" v-show="!editandoNombre">
          {{ esteObjetivo.nombre }}
        </div>
        <input
          type="text"
          class="inputNuevoNombre"
          :class="{ letrasRojas: nuevoNombreIlegal }"
          v-model="nuevoNombre"
          v-show="editandoNombre"
          @keypress.enter="guardarNuevoNombre"
        />
        <div class="controlesLateralesZona" v-if="usuarioResponsableObjetivo">
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarrNombre"
            class="bEditar"
            title="Editar nombre del objetivo"
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
          iconoCompletado: esteObjetivo.estado === 'cumplido',
          deshabilitado: togglingEstado,
        }"
        @click="usuarioResponsableObjetivo ? toggleEstadoObjetivo() : null"
      />
    </div>
    <div id="zonaDescripcion" class="zonaPrimerNivel">
      <div class="barraSuperiorZona">
        <span class="nombreZona">Descripcion</span>
        <div class="controlesZona" v-show="usuarioResponsableObjetivo">
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarDescripcion"
            class="bEditar"
            title="Editar descripcion del objetivo"
            v-show="usuarioResponsableObjetivo"
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

      <div id="descripcion" ref="descripcion" v-show="!editandoDescripcion">
        {{ esteObjetivo.descripcion }}
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

    <div id="zonaResponsables" class="zonaPrimerNivel">
      <div class="barraSuperiorZona">
        <div
          class="nombreZona"
          @click="mostrandoResponsables = !mostrandoResponsables"
        >
          <div
            class="trianguloBullet"
            :style="{
              transform: mostrandoResponsables
                ? 'rotateZ(90deg)'
                : 'rotateZ(0deg)',
            }"
          ></div>
          Responsable{{ esteObjetivo.responsables.length === 1 ? "" : "s" }}
        </div>
      </div>

      <div v-show="mostrandoResponsables">
        <div id="controlesResponsables" class="controlesZona">
          <loading v-show="enviandoQueryResponsables" texto="Esperando..." />
          <div
            class="controlesResponsables hoverGris botonesControles"
            :class="{ deshabilitado: enviandoQueryResponsables }"
            v-if="
              usuarioLogeado == true && esteObjetivo.responsables.length < 1
            "
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
              usuarioResponsableObjetivo &&
              responsablesSolicitados < 1
            "
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
              !usuarioResponsableObjetivo &&
              !usuarioPosibleResponsableObjetivo &&
              esteObjetivo.responsables.length > 0
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
              (usuarioResponsableObjetivo == true ||
                usuarioPosibleResponsableObjetivo == true)
            "
            @click="abandonarListaResponsables"
          >
            Abandonar
          </div>
          <div
            class="controlesResponsables hoverGris botonesControles"
            :class="{ deshabilitado: enviandoQueryResponsables }"
            v-if="usuarioLogeado == true && usuarioResponsableObjetivo == true"
            v-show="
              idResponsableSeleccionado != null &&
              responsableSeleccionadoEstaAceptado == false
            "
            @click="aceptarResponsable(idResponsableSeleccionado)"
          >
            Aceptar como responsable
          </div>
        </div>
        <div id="listaResponsables">
          <icono-persona-autonomo
            :idPersona="idPersona"
            :key="idPersona"
            v-for="idPersona of esteObjetivo.responsables"
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
            v-for="idPersona of esteObjetivo.posiblesResponsables"
            v-show="
              usuarioResponsableObjetivo ||
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
              :readonly="usuarioResponsableObjetivo ? false : true"
              :style="[
                {
                  backgroundColor:
                    esteObjetivo.responsablesSolicitados !=
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

    <div id="controlesObjetivo"></div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";
import IconoPersonaAutonomo from "../usuario/IconoPersonaAutonomo.vue";
import debounce from "debounce";

const charProhibidosNombreObjetivo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
const charProhibidosDescripcionObjetivo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

export default {
  name: "VentanitaObjetivo",
  components: { Loading, IconoPersonaAutonomo },
  data() {
    return {
      deshabilitado: false,

      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: "Nueva descripcion",
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,

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
    idObjetivo: String,
    esteObjetivo: Object,
    seleccionado: Boolean,
  },
  computed: {
    nuevoNombreIlegal() {
      if (this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreObjetivo.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoDescripcionIlegal() {
      if (this.nuevoDescripcion.length < 1) {
        return true;
      }
      if (charProhibidosDescripcionObjetivo.test(this.nuevoDescripcion)) {
        return true;
      }
      return false;
    },
    usuarioResponsableObjetivo() {
      if (!this.usuario || !this.usuario.id) return false;
      return this.esteObjetivo.responsables.includes(this.usuario.id);
    },
    usuarioPosibleResponsableObjetivo: function () {
      if (!this.esteObjetivo.posiblesResponsables) return false;

      if (this.esteObjetivo.posiblesResponsables.includes(this.usuario.id)) {
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
      if (this.nuevoNombre == this.esteObjetivo.nombre) {
        this.editandoNombre = false;
        return;
      }
      console.log(`guardando nuevo nombre`);
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idObjetivo: ID!, $nuevoNombre: String!) {
              editarNombreObjetivo(
                idObjetivo: $idObjetivo
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idObjetivo: this.esteObjetivo.id,
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
      if (this.nuevoDescripcion == this.esteObjetivo.descripcion) {
        this.editandoDescripcion = false;
        return;
      }
      console.log(`guardando nuevo descripcion`);
      this.enviandoNuevoDescripcion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idObjetivo: ID!, $nuevoDescripcion: String!) {
              editarDescripcionObjetivoObjetivo(
                idObjetivo: $idObjetivo
                nuevoDescripcion: $nuevoDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idObjetivo: this.idObjetivo,
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
    toggleEditandoNombre() {
      this.editandoNombre = !this.editandoNombre;
      this.nuevoNombre = this.esteObjetivo.nombre;
    },
    toggleEditandoDescripcion() {
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.esteObjetivo.descripcion;
    },
    toggleEstadoObjetivo() {
      var nuevoEstado = "noCumplido";
      if (this.esteObjetivo.estado === "noCumplido") {
        nuevoEstado = "cumplido";
      }
      this.togglingEstado = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idObjetivo: ID!, $nuevoEstado: String!) {
              setEstadoObjetivo(
                idObjetivo: $idObjetivo
                nuevoEstado: $nuevoEstado
              ) {
                id
                estado
              }
            }
          `,
          variables: {
            idObjetivo: this.idObjetivo,
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
        `Enviando peticion de entrar a la lista de posibles responsables del objetivo con id ${this.esteObjetivo.id}`
      );
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idObjetivo: ID!, $idUsuario: ID!) {
              addPosibleResponsableObjetivo(
                idObjetivo: $idObjetivo
                idUsuario: $idUsuario
              ) {
                id
                posiblesResponsables
              }
            }
          `,
          variables: {
            idObjetivo: this.esteObjetivo.id,
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
      console.log(`Abandonando la responsabilidad en este objetivo`);
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idObjetivo: ID!, $idUsuario: ID!) {
              removeResponsableObjetivo(
                idObjetivo: $idObjetivo
                idUsuario: $idUsuario
              ) {
                id
                responsables
                posiblesResponsables
              }
            }
          `,
          variables: {
            idObjetivo: this.esteObjetivo.id,
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
            mutation ($idObjetivo: ID!, $idUsuario: ID!) {
              addResponsableObjetivo(
                idObjetivo: $idObjetivo
                idUsuario: $idUsuario
              ) {
                id
                responsables
                posiblesResponsables
                responsablesSolicitados
              }
            }
          `,
          variables: {
            idObjetivo: this.esteObjetivo.id,
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
        `enviando id ${this.$store.state.usuario.id} para la lista de responsables del objetivo con id ${this.esteObjetivo.id}`
      );
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idObjetivo: ID!, $idUsuario: ID!) {
              addResponsableObjetivo(
                idObjetivo: $idObjetivo
                idUsuario: $idUsuario
              ) {
                id
                responsables
                posiblesResponsables
              }
            }
          `,
          variables: {
            idObjetivo: this.esteObjetivo.id,
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

      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idObjetivo: ID!
              $nuevoCantidadResponsablesSolicitados: Int!
            ) {
              setResponsablesSolicitadosObjetivo(
                idObjetivo: $idObjetivo
                nuevoCantidadResponsablesSolicitados: $nuevoCantidadResponsablesSolicitados
              ) {
                id
                responsablesSolicitados
              }
            }
          `,
          variables: {
            idObjetivo: this.esteObjetivo.id,
            nuevoCantidadResponsablesSolicitados: cantidad,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
  },
  watch: {
    responsablesSolicitados(nuevo) {
      if (nuevo === this.esteObjetivo.responsablesSolicitados) return;
      console.log(`Cambio en responsables solicitados`);
      this.debounceSetResponsablesSolicitados();
    },
  },
  mounted() {
    this.responsablesSolicitados = this.esteObjetivo.responsablesSolicitados;
  },
};
</script>

<style scoped>
.ventanitaObjetivo {
  border: 2px solid #585858;
  border-radius: 5px;
  min-height: 10px;

  position: relative;
  padding: 5px 0px;
  padding-bottom: 10px;
  background-color: rgb(231, 182, 182);
}
.ventanitaObjetivo:not(.seleccionado) {
  cursor: pointer;
}

.seleccionado {
  box-shadow: 2px 2px 2px 2px rgb(54, 54, 54);
  padding-bottom: 25px;
}

#controlesObjetivo {
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
  flex-direction: row-reverse;
}
.controlesObjetivo {
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
}

#imagenIcono:hover {
  background-color: cadetblue;
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
}
.nombreZona {
  font-size: 18px;
  padding: 5px 20px;
}
#nombre {
  margin-top: 15px;
  font-size: 19px;
  padding: 5px 20px;
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
  font-size: 23px;
  display: block;
  margin: 10px auto;
  grid-column: 2/3;
  width: 100%;
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
.trianguloBullet {
  border: 10px solid transparent;
  border-left: 10px solid black;
  display: inline-block;
  margin-right: 10px;
  margin-left: 10px;
  transform-origin: left center;
  transition: transform 0.2s;
}
</style>