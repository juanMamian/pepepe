<template>
  <div class="actividad" :class="{ seleccionada: seleccionada, completada: usuarioCompletoActividad }">
    <div
      id="triangulito"
      :class="{ arrowDown: seleccionada }"
      @click.stop="$emit('clickTrianguloSeleccion')"
    ></div>
    <span
      id="nombre"
      ref="nombre"
      class="nombreZona"
      :contenteditable="usuarioCreadorActividad == true && seleccionada == true"
      @blur="guardarNombre"
      @input="setNombreEditandose"
      @keypress.enter="blurNombre"
    >
      {{ estaActividad.nombre }}
    </span>
    <br />
    <div id="zonaGuia" v-show="seleccionada" class="zona">
      <div
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

      <div
        id="botonDescargarGuia"
        @click="descargarGuia"
        v-if="estaActividad.hayGuia"
      ></div>
    </div>

    <div
      id="zonaParticipantes"
      class="zona"
      v-if="
        usuarioCreadorActividad || usuarioAdministradorActividadesEstudiantiles
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
          @click.native="idEstudianteSeleccionado = desarrollo.estudiante.id"
        />
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
          <mi-participacion
            :idActividad="estaActividad.id"
            :enDesarrollo="desarrollo.id"
            :participacionEstudiante="
              desarrollo.estudiante.id == $store.state.usuario.id
            "
            v-if="desarrollo.estado != 'completado'"
            @reloadDesarrollo="reloadDesarrollo(desarrollo.id)"
          />
          <div
            v-if="usuarioCreadorActividad"
            id="botonToggleDesarrolloCompletado"
          >
            <img
              :class="{ completado: desarrollo.estado == 'completado' }"
              @click="
                toggleDesarrolloCompletado(desarrollo.id, desarrollo.estado)
              "
              id="botonToggleDesarrolloCompletado"
              src="/iconos/success.png"
              alt="Marcar como completado"
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
        v-if="usuarioCreadorActividad"
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
  components: { MiParticipacion, ParticipacionEstudiante, IconoPersona },
  name: "Actividad",
  data() {
    return {
      nombreEditandose: false,
      idEstudianteSeleccionado: this.$store.state.usuario.id,
    };
  },
  props: {
    estaActividad: {
      type: Object,
      default() {
        return {
          desarrollos: new Array(),
        };
      },
    },
    seleccionada: Boolean,
    idGrupo: String,
  },
  methods: {
    eliminarse() {
      this.$emit("eliminandose", this.estaActividad.id);
    },
    async guardarNombre() {
      let nuevoNombre = this.$refs.nombre.innerHTML.trim();
      let idActividad = this.estaActividad.id;

      if (!this.nombreEditandose || nuevoNombre == this.estaActividad.nombre) {
        return;
      }

      nuevoNombre = nuevoNombre.replace(charProhibidosNombre, "");
      nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");

      this.$emit("cambiandoNombre", { idActividad, nuevoNombre });
    },
    setNombreEditandose() {
      this.nombreEditandose = true;
    },
    blurNombre(e) {
      e.target.blur();
    },
    seleccionarGuia() {
      this.$refs.inputNuevaGuia.click();
    },
    subirNuevaGuia() {
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
          this.reloadDesarrollo(idDesarrollo);
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
  },
  computed: {
    usuarioCreadorActividad: function () {
      return this.$store.state.usuario.id == this.estaActividad.creador.id;
    },
    usuarioTieneDesarrollo: function () {
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
  },
};
</script>

<style scoped>
.actividad {
  border: 2px solid rgb(219, 214, 219);
  padding: 5px 15px;
  position: relative;
}
.actividad:not(.seleccionada) {
  cursor: pointer;
}
.actividad.completada{
  background-color: rgb(172 216 172);
}
.seleccionada {
  background-color: rgb(240, 240, 240);
  padding-bottom: 30px;
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
#botonDescargarGuia {
  margin-top: 15px;
  cursor: pointer;
  background-image: url("/iconos/documento.png");
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-size: 100% 100%;
  margin-left: auto;
  margin-right: auto;
}
.nombreZona {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

#listaParticipantes {
  display: flex;
  padding-bottom: 40px;
}

.iconoPersona {
  margin-left: 5px;
  margin-right: 5px;
}
.nombreNoHayGuia {
  background-color: red;
}
.nombreHayGuia {
  background-color: green;
}

.participacionEstudiante {
  margin-top: 15px;
}
.miParticipacion {
  margin-top: 20px;
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
#botonToggleDesarrolloCompletado {
  margin: 10px auto;
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
#botonToggleDesarrolloCompletado.completado {
  background-color: green;
}
</style>