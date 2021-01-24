<template>
  <div
    class="actividad"
    :class="{
      seleccionada: seleccionada,
      completada: usuarioCompletoActividad,
    }"
  >
    <div id="contenedorAlertas">
      <img
        v-if="actividadConNuevasRespuestasParaProfe"
        class="alertas alertaNuevoMensaje"
        src="@/assets/iconos/mensaje.png"
        title="Nuevo(s) mensaje(s)"
      />
      <img
        v-if="usuarioCompletoActividad"
        class="alertas alertaActividadCompletada"
        src="@/assets/iconos/success.png"
        title="¡Completaste esta actividad!"
      />
    </div>
    <div
      id="triangulito"
      :class="{ arrowDown: seleccionada }"
      @click.stop="$emit('clickTrianguloSeleccion')"
    ></div>
    <div
      id="zonaNombre"
      @mouseover="botonesNombre = true"
      @mouseout="botonesNombre = false"
    >
      <span
        id="nombre"
        ref="nombre"
        :class="{ enEdicion: nombreEditandose }"
        class="nombreZona"
      >
        {{ estaActividad.nombre }}
        <img
          src="@/assets/iconos/editar.png"
          v-if="usuarioCreadorActividad"
          v-show="seleccionada"
          alt="Editar nombre"
          title="Editar nombre"
          id="botonEditarNombre"
          @click="iniciarEdicionNombre"
        />
      </span>
      <loading
        v-if="usuarioCreadorActividad"
        v-show="enviandoNuevoNombre"
        texto="Guardando nombre..."
      />
      <div
        id="zonaNuevoNombre"
        v-if="usuarioCreadorActividad"
        v-show="nombreEditandose == true && seleccionada == true"
      >
        <label style="font-style: italic" for="inputNuevoNombre"
          >Nuevo nombre:
        </label>
        <input
          ref="inputNuevoNombre"
          name="inputNuevoNombre"
          type="text"
          class="nuevoNombreActividad"
          v-model="nuevoNombre"
          @keydown.esc="cancelarEdicionNombre"
          @keypress.enter="guardarNombre"
          @blur="guardarNombre"
        />
      </div>
    </div>
    <span
      id="nombreCreador"
      v-if="
        usuarioAdministradorActividadesEstudiantiles == true ||
        $store.state.usuario.permisos.includes('actividadesEstudiantiles-guia')
      "
      >{{ estaActividad.creador.nombres }}</span
    >
    <br />
    <div id="zonaGuia" v-show="seleccionada" class="zona">
      <div
        id="nombreZonaGuia"
        class="nombreZona"
        :class="{
          nombreHayGuia: estaActividad.hayGuia,
          nombreNoHayGuia: !estaActividad.hayGuia,
        }"
      >
        Guía
      </div>
      <input
        type="file"
        id="inputNuevaGuia"
        ref="inputNuevaGuia"
        @change="subirNuevaGuia"
        v-if="usuarioCreadorActividad"
        accept="application/pdf"
      />
      <loading v-show="uploadingGuia" :texto="'Subiendo archivo...'" />
      <div id="descargarGuia" v-if="estaActividad.hayGuia.length > 5">
        <a
          :href="estaActividad.hayGuia"
          :download="estaActividad.nombre + '-Guia'"
        >
          <img
            src="@/assets/iconos/documento.png"
            alt="Descargar guia"
            id="botonDescargarGuia"
          />
        </a>
      </div>
    </div>

    <div
      id="zonaParticipantes"
      class="zona"
      v-if="
        usuarioCreadorActividad ||
        usuarioAdministradorActividadesEstudiantiles ||
        $store.state.usuario.permisos.includes('actividadesEstudiantiles-guia')
      "
      v-show="seleccionada"
    >
      <div class="nombreZona">Participantes</div>
      <div id="controlesParticipantes" class="controlesZona"></div>
      <div
        id="listaParticipantes"
        @click.self="idParticipanteSeleccionado = null"
      >
        <icono-persona
          :estaPersona="desarrollo.estudiante"
          :key="desarrollo.estudiante.id"
          v-for="desarrollo of estaActividad.desarrollos"
          :seleccionado="
            idEstudianteSeleccionado == desarrollo.estudiante.id ? true : false
          "
          @click.native="
            idEstudianteSeleccionado = desarrollo.estudiante.id;
            marcarComoLeido(desarrollo.estudiante.id);
          "
        >
          <template v-slot:alertas>
            <img
              v-if="
                idsEstudiantesConNuevaRespuestaParaProfe.includes(
                  desarrollo.estudiante.id
                )
              "
              class="alertas alertaNuevoMensaje"
              src="@/assets/iconos/mensaje.png"
              title="Nuevo mensaje"
            />
          </template>
        </icono-persona>
      </div>
    </div>

    <div
      id="zonaDesarrollos"
      class="zona"
      v-show="
        seleccionada &&
        (idEstudianteSeleccionado != null || !usuarioCreadorActividad)
      "
    >
      <div
        class="desarrollo"
        id="miNuevoDesarrollo"
        v-if="
          !usuarioCreadorActividad &&
          !usuarioTieneDesarrollo &&
          idEstudianteSeleccionado == this.$store.state.usuario.id
        "
      >
        <mi-participacion
          :idActividad="estaActividad.id"
          @reloadDesarrollo="reloadDesarrollosActividad()"
          :participacionEstudiante="true"
        />
      </div>
      <div id="desarrollosEstudiantes">
        <div
          class="desarrollo"
          :key="desarrollo.id"
          v-for="desarrollo of estaActividad.desarrollos"
          v-show="idEstudianteSeleccionado == desarrollo.estudiante.id"
        >
          {{ desarrollo.estudiante.nombres }}
          <participacion-estudiante
            :key="participacion.id"
            :indice="index"
            :idEstudianteDesarrollo="desarrollo.estudiante.id"
            v-for="(participacion, index) of desarrollo.participaciones"
            :estaParticipacion="participacion"
            @eliminandose="
              eliminarParticipacion(participacion.id, desarrollo.id)
            "
          />
          <div
            class="anuncioActividadCompletada"
            v-if="desarrollo.estado == 'completado'"
          >
            ¡Actividad completada!
          </div>
          <mi-participacion
            :idActividad="estaActividad.id"
            :enDesarrollo="desarrollo.id"
            :participacionEstudiante="
              desarrollo.estudiante.id == $store.state.usuario.id
            "
            v-if="desarrollo.estado != 'completado'"
            @reloadDesarrollo="reloadDesarrollo(desarrollo.id)"
          />
          <div v-if="usuarioCreadorActividad" id="toggleDesarrolloCompletado">
            <img
              :class="{ completado: desarrollo.estado == 'completado' }"
              @click="
                toggleDesarrolloCompletado(desarrollo.id, desarrollo.estado)
              "
              id="botonToggleDesarrolloCompletado"
              src="@/assets/iconos/success.png"
              alt="Marcar como completado"
              title="Marcar como completado"
            />
          </div>
        </div>
      </div>
    </div>

    <div id="controlesActividad" v-show="seleccionada == true">
      <div
        id="botonEliminarActividad"
        class="controlesActividad"
        @click="eliminarse"
        v-if="
          usuarioCreadorActividad ||
          usuarioAdministradorActividadesEstudiantiles
        "
      >
        Eliminar
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import FileDownload from "js-file-download";
import gql from "graphql-tag";
import MiParticipacion from "./MiParticipacion.vue";
import ParticipacionEstudiante from "./ParticipacionEstudiante.vue";
import IconoPersona from "../proyecto/IconoPersona.vue";
import {
  fragmentoDesarrollo,
  fragmentoResponsables,
} from "../utilidades/recursosGql";
import Loading from "../utilidades/Loading.vue";
var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

const QUERY_DESARROLLOS_ACTIVIDAD = gql`
  query($idActividad: ID!) {
    actividadEstudiantil(idActividad: $idActividad) {
      id
      desarrollos {
        ...fragDesarrollo
      }
    }
  }
  ${fragmentoDesarrollo}
`;

const QUERY_DESARROLLO = gql`
  query($idDesarrollo: ID!, $idActividad: ID!) {
    desarrolloEnActividadEstudiantil(
      idActividad: $idActividad
      idDesarrollo: $idDesarrollo
    ) {
      id
      estado
      participaciones {
        id
        fechaUpload
        comentario
        archivo {
          extension
          nombre
          accesible
        }
        autor {
          ...fragResponsables
        }
      }
    }
  }
  ${fragmentoResponsables}
`;

export default {
  components: {
    MiParticipacion,
    ParticipacionEstudiante,
    IconoPersona,
    Loading,
  },
  name: "Actividad",
  data() {
    return {
      nombreEditandose: false,
      idEstudianteSeleccionado: this.$store.state.usuario.id,
      uploadingGuia: false,
      nuevoNombre: "",
      botonesNombre: false,
      enviandoNuevoNombre: false,
    };
  },
  props: {
    estaActividad: {
      type: Object,
      default() {
        return {
          desarrollos: new Array(),
          hayGuia: "",
        };
      },
    },
    seleccionada: Boolean,
    idGrupo: String,
  },
  methods: {
    eliminarse() {
      if (confirm("Eliminando actividad completa. ¿Continuar?")) {
        this.$emit("eliminandose", this.estaActividad.id);
      }
    },
    async guardarNombre() {
      this.enviandoNuevoNombre = true;
      console.log(`Evento de cambio de nombre`);
      let nuevoNombre = this.nuevoNombre.trim();
      let idActividad = this.estaActividad.id;

      if (!this.nombreEditandose || nuevoNombre == this.estaActividad.nombre) {
        this.nombreEditandose = false;
        this.enviandoNuevoNombre = false;
        return;
      }
      this.nombreEditandose = false;
      nuevoNombre = nuevoNombre.replace(charProhibidosNombre, "");
      nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idActividad: ID!, $nuevoNombre: String!) {
              cambiarNombreActividadEstudiantil(
                idActividad: $idActividad
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idActividad,
            nuevoNombre,
          },
        })
        .then((data) => {
          this.enviandoNuevoNombre = false;
          console.log(`fin de la mutacion. Data: ${JSON.stringify(data)} `);
        })
        .catch((error) => {
          this.enviandoNuevoNombre = false;
          console.log(`error: ${error}`);
        });
    },
    iniciarEdicionNombre() {
      if (!this.usuarioCreadorActividad || !this.seleccionada) return;
      console.log(`iniciando edicion de nombre`);
      this.nuevoNombre = this.estaActividad.nombre;
      this.nombreEditandose = true;
      this.$nextTick(() => {
        this.$refs.inputNuevoNombre.focus();
      });
    },
    cancelarEdicionNombre() {
      console.log(`cancelando edición de nombre`);

      this.nombreEditandose = false;
      this.$refs.inputNuevoNombre.blur();
    },
    seleccionarGuia() {
      this.$refs.inputNuevaGuia.click();
    },
    subirNuevaGuia() {
      this.uploadingGuia = true;
      let dis = this;
      let inputGuia = this.$refs.inputNuevaGuia;
      var datos = new FormData();
      const nuevaGuia = inputGuia.files[0];
      const fileType = nuevaGuia["type"];
      console.log(`subiendo un ${fileType}`);
      datos.append("nuevaGuia", nuevaGuia);
      datos.append("idActividad", this.estaActividad.id);
      datos.append("idGrupo", this.idGrupo);
      //console.log(`enviando nuevo icono con datos: : `);
      axios({
        method: "post",
        url: this.serverUrl + "/api/actividadesProfes/updateGuia",
        data: datos,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + this.$store.state.token,
        },
      })
        .then((res) => {
          this.uploadingGuia = false;
          console.log(`res: ${JSON.stringify(res)}`);
          dis.$apollo.query({
            query: gql`
              query($idGrupo: ID!, $idActividad: ID!) {
                actividadDeGrupoEstudiantil(
                  idGrupo: $idGrupo
                  idActividad: $idActividad
                ) {
                  id
                  hayGuia
                }
              }
            `,
            variables: {
              idGrupo: dis.idGrupo,
              idActividad: dis.estaActividad.id,
            },
          });
        })
        .catch((error) => {
          this.uploadingGuia = false;
          console.log(`Errores: ${error}`);
          if (error.response.data.msjUsuario) {
            alert(error.response.data.msjUsuario);
          }
        });
    },
    descargarGuia() {
      let direccion =
        this.serverUrl +
        "/" +
        "api/actividadesProfes/guia" +
        "/" +
        this.idGrupo +
        "/" +
        this.estaActividad.creador.id +
        "/" +
        this.estaActividad.id +
        "/";
      console.log(`solicitando guia a ${direccion}`);
      axios({
        method: "get",
        url: direccion,
        responseType: "blob",
      })
        .then((res) => {
          console.log(`Respuesta: ${JSON.stringify(res)}`);
          FileDownload(res.data, this.estaActividad.nombre + "-Guia.pdf");
        })
        .catch((error) => {
          console.log(`Error: ${JSON.stringify(error)}`);
          alert("Archivo no encontrado");
        });
    },
    reloadDesarrollosActividad() {
      let idActividad = this.estaActividad.id;
      this.$apollo
        .query({
          query: QUERY_DESARROLLOS_ACTIVIDAD,
          fetchPolicy: "network-only",
          variables: {
            idActividad,
          },
        })
        .then(() => {
          console.log(`Desarrollos de actividad reloaded`);
        })
        .catch((error) => {
          console.log(
            `Error en query de actualizacion de mi desarrollo. E: ${error}`
          );
        });
    },
    reloadDesarrollo(idDesarrollo) {
      this.$apollo
        .query({
          query: QUERY_DESARROLLO,
          fetchPolicy: "network-only",
          variables: {
            idDesarrollo,
            idActividad: this.estaActividad.id,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log(
            `Error en query de actualizacion de mi desarrollo. E: ${error}`
          );
        });
    },
    eliminarParticipacion(idParticipacion, idDesarrollo) {
      let dis = this;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idParticipacion: ID!) {
              eliminarParticipacionActividadEstudiantil(
                idParticipacion: $idParticipacion
              )
            }
          `,
          variables: {
            idParticipacion,
          },
        })
        .then(() => {
          dis.$emit("participacionEliminada", {
            idParticipacion,
            idDesarrollo,
            idActividad: this.estaActividad.id,
          });
          //this.reloadDesarrollo(idDesarrollo);
        })
        .catch((error) => {
          console.log("errores: " + error);
        });
    },
    toggleDesarrolloCompletado(idDesarrollo, actualEstado) {
      console.log(
        `Toggling estado de desarrollo ${idDesarrollo} que estaba en ${actualEstado}`
      );
      let nuevoEstado =
        actualEstado == "completado" ? "desarrollando" : "completado";
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idDesarrollo: ID!, $nuevoEstado: String) {
              setEstadoDesarrolloActividadEstudiantil(
                idDesarrollo: $idDesarrollo
                nuevoEstado: $nuevoEstado
              ) {
                id
                estado
              }
            }
          `,
          variables: {
            idDesarrollo,
            nuevoEstado,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    marcarComoLeido(idEstudiante) {
      if (this.$store.state.usuario.id == this.estaActividad.creador.id) {
        let idDesarrollo = this.estaActividad.desarrollos.find(
          (d) => d.estudiante.id == idEstudiante
        ).id;
        console.log(
          `Marcando el desarrollo con id ${idDesarrollo} como leído por profe`
        );
        this.$apollo.mutate({
          mutation: gql`
            mutation($idDesarrollo: ID!) {
              setLeidoPorProfeDesarrolloEstudiantil(
                idDesarrollo: $idDesarrollo
                nuevoLeidoPorProfe: true
              ) {
                id
                leidoPorProfe
              }
            }
          `,
          variables: {
            idDesarrollo,
          },
        });
      }
    },
  },
  computed: {
    usuarioCreadorActividad: function () {
      return this.$store.state.usuario.id == this.estaActividad.creador.id;
    },
    usuarioTieneDesarrollo: function () {
      if (this.estaActividad.desarrollos.length < 1) {
        console.log(`Actividad sin desarrollos`);

        return false;
      }
      return this.estaActividad.desarrollos.some(
        (d) => d.estudiante.id == this.$store.state.usuario.id
      );
    },
    usuarioCompletoActividad: function () {
      if (this.usuarioTieneDesarrollo) {
        let desarrolloUsuario = this.estaActividad.desarrollos.find(
          (d) => d.estudiante.id == this.$store.state.usuario.id
        );
        if (desarrolloUsuario.estado == "completado") {
          return true;
        }
      }
      return false;
    },
    usuarioProfe: function () {
      if (!this.$store.state.usuario.permisos) return false;
      return this.$store.state.usuario.permisos.includes(
        "actividadesEstudiantiles-profe"
      );
    },
    idsDesarrollosConNuevaRespuestaParaProfe() {
      let desarrollosConNuevaRespuesta = this.estaActividad.desarrollos.filter(
        (d) => d.leidoPorProfe == false
      );
      if (this.usuarioCreadorActividad) {
        return desarrollosConNuevaRespuesta.map((d) => d.id);
      }
      return [];
    },
    idsEstudiantesConNuevaRespuestaParaProfe() {
      let desarrollosConNuevaRespuesta = this.estaActividad.desarrollos.filter(
        (d) => d.leidoPorProfe == false
      );
      if (this.usuarioCreadorActividad) {
        return desarrollosConNuevaRespuesta.map((d) => d.estudiante.id);
      }
      return [];
    },
    actividadConNuevasRespuestasParaProfe() {
      return this.idsDesarrollosConNuevaRespuestaParaProfe.length > 0
        ? true
        : false;
    },
  },
};
</script>

<style scoped>
.actividad {
  border: 2px solid rgb(219, 214, 219);
  padding: 5px 10px;
  position: relative;
  border-radius: 10px;
}
.actividad:not(.seleccionada) {
  cursor: pointer;
}
.actividad.completada {
  border-color: rgb(172 216 172);
}
.seleccionada {
  background-color: rgb(240, 240, 240);
  padding-bottom: 30px;
}
#contenedorAlertas {
  position: absolute;
  top: 0;
  right: 0;
}
.alertas {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
}
.alertaActividadCompletada {
  background-color: rgb(112, 161, 112);
}
.alertaNuevoMensaje {
  background-color: orange;
}

#nombre {
  padding-top: 10px;
  padding-bottom: 10px;
  margin-top: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 18px;
  margin-left: auto;
  margin-right: auto;
  display: block;
}
#botonEditarNombre {
  width: 20px;
  height: 20px;
  opacity: 0.8;
  position: absolute;
  right: 5px;
  cursor: pointer;
  border-radius: 50%;
}
#botonEditarNombre:hover {
  background-color: gray;
}
.enEdicion {
  color: gray;
  pointer-events: none;
}
#zonaNuevoNombre {
  text-align: center;
}
#controlesActividad {
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
  flex-direction: row-reverse;
}
.controlesActividad {
  padding: 3px 5px;
  cursor: pointer;
}
#botonEliminarActividad:hover {
  background-color: red;
}
.zona {
  border: 2px solid rgb(9, 53, 66);
  border-radius: 10px;
  padding: 10px;
}
#nombreZonaGuia {
  text-align: center;
}
.nombreNoHayGuia {
  background-color: rgb(228, 86, 86);
}
.nombreHayGuia {
  background-color: rgb(92, 179, 92);
}
#descargarGuia {
  margin-top: 15px;
  text-align: center;
}
#botonDescargarGuia {
  cursor: pointer;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: rgb(123, 214, 123);
}
.nombreZona {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

#listaParticipantes {
  display: flex;
  padding-bottom: 40px;
  flex-flow: row wrap;
}

.iconoPersona {
  margin-left: 25px;
  margin-right: 25px;
  margin-bottom: 55px;
}

.participacionEstudiante {
  margin-top: 15px;
}

#triangulito {
  position: absolute;

  left: 4px;
  cursor: pointer;
}
#triangulito:not(.arrowDown) {
  width: 0;
  height: 0;
  border-top: 15px solid transparent;
  border-bottom: 15px solid transparent;
  border-left: 15px solid gray;
  top: 50%;
  transform: translateY(-50%);
}
.arrowDown {
  top: 10px;
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 15px solid gray;
}
#toggleDesarrolloCompletado {
  text-align: center;
}
#botonToggleDesarrolloCompletado {
  margin: 10px auto;
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
#botonToggleDesarrolloCompletado:hover {
  background-color: rgb(98, 151, 98);
}
#botonToggleDesarrolloCompletado.completado {
  background-color: green;
}
.anuncioActividadCompletada {
  border-radius: 5px;
  padding: 5px 8px;
  text-align: center;
  background-color: rgb(86, 160, 86);
  min-width: 40%;
  margin-left: auto;
  margin-right: auto;
}
</style>