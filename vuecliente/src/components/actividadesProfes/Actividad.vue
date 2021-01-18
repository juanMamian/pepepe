<template>
  <div class="actividad" :class="{ seleccionada: seleccionada }">
    <div
      id="nombre"
      ref="nombre"
      class="nombreZona"
      :contenteditable="usuarioCreadorActividad == true && seleccionada == true"
      @blur="guardarNombre"
      @input="setNombreEditandose"
      @keypress.enter="blurNombre"
    >
      {{ estaActividad.nombre }}
    </div>

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
      v-if="usuarioCreadorActividad"
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

    <div id="zonaDesarrollos" class="zona" v-show="seleccionada">
      <div class="desarrollo" id="miDesarrollo" v-if="!usuarioCreadorActividad">
        <participacion-estudiante
          :key="participacion.id"
          :indice="index"
          :nombreEstudiante="'yo'"
          v-for="(participacion, index) of miDesarrollo.participaciones"
          :estaParticipacion="participacion"
        />
        <mi-participacion
          :idActividad="estaActividad.id"
          @reloadMiDesarrollo="reloadDesarrolloUsuario()"
        />
      </div>
    </div>

    <div id="controlesActividad" v-show="seleccionada == true">
      <div class="controlesActividad hoverGris" @click="eliminarse">
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
import { fragmentoResponsables } from "../utilidades/recursosGql";
var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

const QUERY_MI_DESARROLLO = gql`
  query($idEstudiante: ID!, $idActividad: ID!) {
    desarrolloUsuarioEnActividadEstudiantil(
      idActividad: $idActividad
      idEstudiante: $idEstudiante
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
  apollo: {
    miDesarrollo: {
      query: QUERY_MI_DESARROLLO,
      variables() {
        return {
          idEstudiante: this.$store.state.usuario.id,
          idActividad: this.estaActividad.id,
        };
      },
      update: ({ desarrolloUsuarioEnActividadEstudiantil }) =>
        desarrolloUsuarioEnActividadEstudiantil,
    },
  },
  data() {
    return {
      nombreEditandose: false,
      idEstudianteSeleccionado: null,
      miDesarrollo: {
        participaciones: [],
      },
    };
  },
  props: {
    estaActividad: Object,
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
    reloadDesarrolloUsuario() {
      
      this.$apollo
        .query({
          query: QUERY_MI_DESARROLLO,
          fetchPolicy: "network-only",
          variables: {
            idEstudiante: this.$store.state.usuario.id,
            idActividad: this.estaActividad.id,
          },
          
        })
        .then(() => {
        })
        .catch((error) => {
          console.log(
            `Error en query de actualizacion de mi desarrollo. E: ${error}`
          );
        });
    },
  },
  computed: {
    usuarioCreadorActividad: function () {
      return this.$store.state.usuario.id == this.estaActividad.creador.id;
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
}

.zona {
  border: 2px solid pink;
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

.nombreNoHayGuia {
  background-color: red;
}
.nombreHayGuia {
  background-color: green;
}

.participacionEstudiante {
  margin-top: 15px;
}
.miParticipacion{
  margin-top:20px;
}
</style>