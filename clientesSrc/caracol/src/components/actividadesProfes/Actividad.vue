<template>
  <div
    class="actividad"
    :class="{
      seleccionada: seleccionada,
      completada: usuarioCompletoActividad,
      deshabilitado: actividadDeshabilitada,
    }"
  >
    <div class="infoFecha" v-show="!seleccionada">{{ fechaFormateada }}</div>
    <div
      id="contenedorAvancesGrupo"
      v-if="usuarioCreadorActividad || usuarioProfe"
    >
      <div
        class="indicadorAvance"
        v-show="estadoAvanceGrupo.numCompletados > 0"
      >
        <div class="numeroIndicadorAvance">
          {{ estadoAvanceGrupo.numCompletados }}
        </div>
        <img
          src="@/assets/iconos/estudiante.png"
          alt="Estudiantes que completaron"
          id="imagenEstudianteCompletado"
          class="imagenAvancesGrupo"
          title="Estudiantes que completaron la actividad"
        />
      </div>
      <div
        class="indicadorAvance"
        v-show="estadoAvanceGrupo.numDesarrollando > 0"
      >
        <div class="numeroIndicadorAvance">
          {{ estadoAvanceGrupo.numDesarrollando }}
        </div>
        <img
          src="@/assets/iconos/estudiante.png"
          alt="Estudiantes desarrollando"
          id="imagenEstudianteDesarrollando"
          class="imagenAvancesGrupo"
          title="Estudiantes desarrollando actividad"
        />
      </div>
      <slot name="avancesGrupo"> </slot>
    </div>
    <div id="contenedorAlertas">
      <img
        v-if="actividadConNuevasRespuestasParaProfe"
        class="alertas alertaNuevoMensaje"
        src="@/assets/iconos/mensaje.png"
        title="Nuevo(s) mensaje(s)"
      />
      <img
        v-if="usuarioCompletoActividad || estadoEstudianteSeleccionado=='completado'"
        class="alertas alertaActividadCompletada"
        src="@/assets/iconos/success.png"
        title="¡Actividad completada!"
      />
      <img
        v-if="estadoEstudianteSeleccionado=='desarrollando'"
        class="alertas alertaActividadEnCurso"
        src="@/assets/iconos/play.png"
        title="¡Actividad en curso!"
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
        usuario.permisos.includes(
          'actividadesEstudiantiles-guia'
        ) ||
        usuario.permisos.includes('actividadesEstudiantiles-profe')
      "
      >{{ estaActividad.infoCreador.nombres }}</span
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
        usuario.permisos.includes(
          'actividadesEstudiantiles-guia'
        ) ||
        usuario.permisos.includes('actividadesEstudiantiles-profe')
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
          :estaPersona="desarrollo.infoEstudiante"
          :key="desarrollo.infoEstudiante.id"
          v-for="desarrollo of estaActividad.desarrollos"
          :seleccionado="
            idEstudianteSeleccionado == desarrollo.infoEstudiante.id
              ? true
              : false
          "
          @click.native="
            idEstudianteSeleccionado = desarrollo.infoEstudiante.id;
            marcarComoLeido(desarrollo.infoEstudiante.id);
          "
        >
          <template v-slot:alertas>
            <img
              v-if="
                idsEstudiantesConNuevaRespuestaParaProfe.includes(
                  desarrollo.infoEstudiante.id
                )
              "
              class="alertas alertaNuevoMensaje"
              src="@/assets/iconos/mensaje.png"
              title="Nuevo mensaje"
            />
            <img
              v-if="desarrollo.estado == 'completado'"
              class="alertas alertaEstudianteCompletoDesarrollo"
              src="@/assets/iconos/success.png"
              title="Completó esta actividad"
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
          idEstudianteSeleccionado == this.usuario.id
        "
      >
        <mi-participacion
          :idActividad="estaActividad.id"
          :idGrupo="idGrupo"
          :nuevoDesarrollo="true"
          :idDesarrollo="'0'"
          :participacionEstudiante="true"
          @hiceDesarrollo="addDesarrolloCreado"
        />
      </div>
      <div id="desarrollosEstudiantes">
        <div
          class="desarrollo"
          :key="desarrollo.id"
          v-for="desarrollo of estaActividad.desarrollos"
          v-show="idEstudianteSeleccionado == desarrollo.infoEstudiante.id"
        >
          {{ desarrollo.infoEstudiante.nombres }}
          <participacion-estudiante
            :key="participacion.id"
            :indice="index"
            :idEstudianteDesarrollo="desarrollo.infoEstudiante.id"
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
            :idGrupo="idGrupo"
            :idActividad="estaActividad.id"
            :idDesarrollo="desarrollo.id"
            :participacionEstudiante="
              desarrollo.infoEstudiante.id == usuario.id
            "
            :nuevoDesarrollo="false"
            v-if="
              desarrollo.estado != 'completado' &&
              (usuarioCreadorActividad ||
                desarrollo.infoEstudiante.id == usuario.id)
            "
            @hiceRespuesta="addRespuestaCreada($event, desarrollo.id)"
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
import Loading from "../utilidades/Loading.vue";
import { fragmentoActividad } from "../utilidades/recursosGql";
var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

const QUERY_ACTIVIDAD = gql`
  query($idGrupo: ID!, $idActividad: ID!) {
    actividadDeGrupoEstudiantil(idGrupo: $idGrupo, idActividad: $idActividad) {
      ...fragActividad
    }
  }
  ${fragmentoActividad}
`;

export default {
  components: {
    MiParticipacion,
    ParticipacionEstudiante,
    IconoPersona,
    Loading,
  },
  apollo: {
    estaActividad: {
      query: QUERY_ACTIVIDAD,
      variables() {
        return {
          idGrupo: this.idGrupo,
          idActividad: this.idActividad,
        };
      },
      update({ actividadDeGrupoEstudiantil }) {
        this.loadingActividad = false;
        return actividadDeGrupoEstudiantil;
      },
      skip() {
        return !this.idGrupo || !this.idActividad;
      },
      fetchPolicy: "cache-and-network",
    },
  },
  name: "Actividad",
  data() {
    return {
      actividadDeshabilitada: false,

      estaActividad: {
        hayGuia: "",
        infoCreador: {},
        desarrollos: [],
      },

      nombreEditandose: false,
      idEstudianteSeleccionado: this.usuario.id,
      uploadingGuia: false,
      nuevoNombre: "",
      botonesNombre: false,
      enviandoNuevoNombre: false,

      loadingActividad: true,
    };
  },
  props: {
    seleccionada: Boolean,
    idActividad: String,
    idGrupo: String,
    idEstudianteSeleccionadoGrupo:String,
  },
  methods: {
    eliminarse() {
      if (confirm("Eliminando actividad completa. ¿Continuar?")) {
        let dis = this;
        this.actividadDeshabilitada = true;
        this.$apollo
          .mutate({
            mutation: gql`
              mutation($idActividad: ID!, $idGrupo: ID!) {
                eliminarActividadDeGrupoEstudiantil(
                  idGrupo: $idGrupo
                  idActividad: $idActividad
                )
              }
            `,
            variables: {
              idActividad: this.idActividad,
              idGrupo: this.idGrupo,
            },
          })
          .then(({ data: { eliminarActividadDeGrupoEstudiantil } }) => {
            console.log(
              `Actividad eliminada: ${eliminarActividadDeGrupoEstudiantil}`
            );
            dis.$router.go();
          })
          .catch((error) => {
            this.actividadDeshabilitada = false;
            console.log("error: " + error);
          });
      }
    },
    async guardarNombre() {
      this.enviandoNuevoNombre = true;
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
            mutation($idActividad: ID!, $nuevoNombre: String!, $idGrupo: ID!) {
              cambiarNombreActividadEstudiantil(
                idGrupo: $idGrupo
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
            idGrupo: this.idGrupo,
            nuevoNombre,
          },
        })
        .then(() => {
          this.enviandoNuevoNombre = false;
        })
        .catch((error) => {
          this.enviandoNuevoNombre = false;
          console.log(`error: ${error}`);
        });
    },
    iniciarEdicionNombre() {
      if (!this.usuarioCreadorActividad || !this.seleccionada) return;
      this.nuevoNombre = this.estaActividad.nombre;
      this.nombreEditandose = true;
      this.$nextTick(() => {
        this.$refs.inputNuevoNombre.focus();
      });
    },
    cancelarEdicionNombre() {
      this.nombreEditandose = false;
      this.$refs.inputNuevoNombre.blur();
    },
    seleccionarGuia() {
      this.$refs.inputNuevaGuia.click();
    },
    subirNuevaGuia() {
      this.uploadingGuia = true;

      let inputGuia = this.$refs.inputNuevaGuia;
      var datos = new FormData();
      const nuevaGuia = inputGuia.files[0];
      datos.append("nuevaGuia", nuevaGuia);
      datos.append("idActividad", this.estaActividad.id);
      datos.append("idGrupo", this.idGrupo);
      axios({
        method: "post",
        url: this.serverUrl + "/api/actividadesProfes/updateGuia",
        data: datos,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + this.usuario.token,
        },
      })
        .then(({ data: { enlace } }) => {
          this.uploadingGuia = false;
          console.log(`Enlace: ${enlace}`);
          this.estaActividad.hayGuia = enlace;
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
        this.estaActividad.infoCreador.id +
        "/" +
        this.estaActividad.id +
        "/";
      axios({
        method: "get",
        url: direccion,
        responseType: "blob",
      })
        .then((res) => {
          FileDownload(res.data, this.estaActividad.nombre + "-Guia.pdf");
        })
        .catch((error) => {
          console.log(`Error: ${JSON.stringify(error)}`);
          alert("Archivo no encontrado");
        });
    },
    eliminarParticipacion(idParticipacion, idDesarrollo) {
      var dis = this;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idParticipacion: ID!
              $idDesarrollo: ID!
              $idActividad: ID!
              $idGrupo: ID!
            ) {
              eliminarParticipacionActividadEstudiantil(
                idParticipacion: $idParticipacion
                idDesarrollo: $idDesarrollo
                idActividad: $idActividad
                idGrupo: $idGrupo
              )
            }
          `,
          variables: {
            idParticipacion,
            idDesarrollo,
            idActividad: this.idActividad,
            idGrupo: this.idGrupo,
          },
          update(
            store,
            { data: { eliminarParticipacionActividadEstudiantil } }
          ) {
            if (!eliminarParticipacionActividadEstudiantil) {
              console.log(`No se eliminó`);
              return;
            }
            console.log(`Retirando participacion`);
            var cache = store.readQuery({
              query: QUERY_ACTIVIDAD,
              variables: {
                idGrupo: dis.idGrupo,
                idActividad: dis.idActividad,
              },
            });
            var elDesarrollo = dis.estaActividad.desarrollos.find(
              (d) => d.id == idDesarrollo
            );

            if (!elDesarrollo) {
              console.log(`Ese desarrollo no estaba`);
              return;
            }
            let indexP = elDesarrollo.participaciones.findIndex(
              (p) => p.id == idParticipacion
            );
            if (indexP > -1) {
              elDesarrollo.participaciones.splice(indexP, 1);
              if (elDesarrollo.participaciones.length < 1) {
                console.log(`Desarrollo quedó vacío`);
                let indexD = dis.estaActividad.desarrollos.findIndex(
                  (d) => d.id == idDesarrollo
                );
                if (indexD > -1) {
                  dis.estaActividad.desarrollos.splice(indexD, 1);
                }
                {
                  console.log(`Desarrollo no encontrado`);
                }
              }

              store.writeQuery({
                query: QUERY_ACTIVIDAD,
                variables: {
                  idGrupo: dis.idGrupo,
                  idActividad: dis.idActividad,
                },
                data: cache,
              });
              console.log(`Participacion retirada`);
            } else {
              console.log(`Esa respuesta ni estaba`);
              return;
            }
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("errores: " + error);
        });
    },
    toggleDesarrolloCompletado(idDesarrollo, actualEstado) {
      let nuevoEstado =
        actualEstado == "completado" ? "desarrollando" : "completado";
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idDesarrollo: ID!
              $idActividad: ID!
              $idGrupo: ID!
              $nuevoEstado: String
            ) {
              setEstadoDesarrolloActividadEstudiantil(
                idDesarrollo: $idDesarrollo
                nuevoEstado: $nuevoEstado
                idActividad: $idActividad
                idGrupo: $idGrupo
              ) {
                id
                estado
              }
            }
          `,
          variables: {
            idDesarrollo,
            nuevoEstado,
            idActividad: this.idActividad,
            idGrupo: this.idGrupo,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    marcarComoLeido(idEstudiante) {
      if (this.usuario.id == this.estaActividad.infoCreador.id) {
        let idDesarrollo = this.estaActividad.desarrollos.find(
          (d) => d.infoEstudiante.id == idEstudiante
        ).id;

        this.$apollo.mutate({
          mutation: gql`
            mutation($idDesarrollo: ID!, $idActividad: ID!, $idGrupo: ID!) {
              setLeidoPorProfeDesarrolloEstudiantil(
                idDesarrollo: $idDesarrollo
                idActividad: $idActividad
                idGrupo: $idGrupo
                nuevoLeidoPorProfe: true
              ) {
                id
                leidoPorProfe
              }
            }
          `,
          variables: {
            idDesarrollo,
            idActividad: this.idActividad,
            idGrupo: this.idGrupo,
          },
        });
      }
    },
    addDesarrolloCreado(nuevoDesarrollo) {
      let store = this.$apollo.provider.defaultClient;
      var cache = store.readQuery({
        query: QUERY_ACTIVIDAD,
        variables: {
          idGrupo: this.idGrupo,
          idActividad: this.idActividad,
        },
      });

      if (
        this.estaActividad.desarrollos.some((d) => d.id == nuevoDesarrollo.id)
      ) {
        console.log(`Ese desarrollo ya estaba`);
      }

      this.estaActividad.desarrollos.push(nuevoDesarrollo);

      store.writeQuery({
        query: QUERY_ACTIVIDAD,
        variables: {
          idGrupo: this.idGrupo,
          idActividad: this.idActividad,
        },
        data: cache,
      });
      console.log(`Nuevo desarrollo añadido`);
    },
    addRespuestaCreada(nuevaRespuesta, idDesarrollo) {
      let store = this.$apollo.provider.defaultClient;
      var cache = store.readQuery({
        query: QUERY_ACTIVIDAD,
        variables: {
          idGrupo: this.idGrupo,
          idActividad: this.idActividad,
        },
      });
      var elDesarrollo = this.estaActividad.desarrollos.find(
        (d) => d.id == idDesarrollo
      );

      if (!elDesarrollo) {
        console.log(`Ese desarrollo no estaba`);
        return;
      }

      if (elDesarrollo.participaciones.some((p) => p.id == nuevaRespuesta.id)) {
        console.log(`Una respuesta con ese id ya estaba`);
        return;
      }
      elDesarrollo.participaciones.push(nuevaRespuesta);

      store.writeQuery({
        query: QUERY_ACTIVIDAD,
        variables: {
          idGrupo: this.idGrupo,
          idActividad: this.idActividad,
        },
        data: cache,
      });
      console.log(`Nueva respuesta añadida`);
    },
    refresh() {
      this.$apollo.queries.estaActividad.refetch();
    },
  },
  computed: {
    usuarioCreadorActividad: function () {
      return this.usuario.id == this.estaActividad.infoCreador.id;
    },
    usuarioTieneDesarrollo: function () {
      if (this.estaActividad.desarrollos.length < 1) {
        return false;
      }
      return this.estaActividad.desarrollos.some(
        (d) => d.infoEstudiante.id == this.usuario.id
      );
    },
    usuarioCompletoActividad: function () {
      if (this.usuarioTieneDesarrollo) {
        let desarrolloUsuario = this.estaActividad.desarrollos.find(
          (d) => d.infoEstudiante.id == this.usuario.id
        );
        if (desarrolloUsuario.estado == "completado") {
          return true;
        }
      }
      return false;
    },
    usuarioProfe: function () {
      if (!this.usuario.permisos) return false;
      return this.usuario.permisos.includes(
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
        return desarrollosConNuevaRespuesta.map((d) => d.infoEstudiante.id);
      }
      return [];
    },
    actividadConNuevasRespuestasParaProfe() {
      return this.idsDesarrollosConNuevaRespuestaParaProfe.length > 0
        ? true
        : false;
    },
    estadoAvanceGrupo() {
      let estadoAvanceGrupo = {
        numCompletados: 0,
        numDesarrollando: 0,
      };

      if (!this.estaActividad.desarrollos) {
        return estadoAvanceGrupo;
      }

      estadoAvanceGrupo.numCompletados = this.estaActividad.desarrollos.filter(
        (d) => d.estado == "completado"
      ).length;
      estadoAvanceGrupo.numDesarrollando = this.estaActividad.desarrollos.filter(
        (d) => d.estado == "desarrollando"
      ).length;
      return estadoAvanceGrupo;
    },
    estadoEstudianteSeleccionado(){
      if(!this.idEstudianteSeleccionadoGrupo){
        return "noIniciado";
      }

      let desarrolloSeleccionado = this.estaActividad.desarrollos.find(
        (d) => d.infoEstudiante.id == this.idEstudianteSeleccionadoGrupo
      );

      if(!desarrolloSeleccionado){
        return "noIniciado";
      }
      return desarrolloSeleccionado.estado;      
    },
    fechaFormateada: function () {
      let laFecha = new Date(this.estaActividad.fechaUpload).toString();
      let indexParentesis = laFecha.indexOf("(");
      let fechaCorta = laFecha.substr(0, indexParentesis);
      let indexGMT = fechaCorta.indexOf("GMT");
      if (indexGMT > -1) {
        fechaCorta = fechaCorta.substr(0, indexGMT);
      }
      return fechaCorta;
    },
  },
  watch: {
    usuarioLogeado: function () {
      this.idEstudianteSeleccionado = this.usuario.id;
    },
    seleccionada(nuevo) {
      if (nuevo) {
        this.$apollo.queries.estaActividad.refetch();
      }
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
.infoFecha{
  font-size: 11px;
  font-style: italic;
  color: gray;
  position: absolute;
  bottom: 100%;
  right: 2%;
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
.alertaActividadEnCurso {  
   background-color: orange;
}
.alertaNuevoMensaje {
  background-color: orange;
}
.alertaEstudianteCompletoDesarrollo {
  background-color: rgb(112, 161, 112);
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
#contenedorAvancesGrupo {
  position: absolute;
  top: 0%;
  left: 30px;
  display: flex;
  padding: 5px;
}
.imagenAvancesGrupo {
  border-radius: 50%;
  width: 35px;
  height: 35px;
  cursor: pointer;
  margin-right: 5px;
}
.indicadorAvance {
  position: relative;
}
#imagenEstudianteDesarrollando {
  background-color: rgb(223, 221, 126);
  border: 1px solid rgb(129, 117, 8);
}
#imagenEstudianteCompletado {
  background-color: rgb(149, 224, 149);
  border: 1px solid green;
}
.numeroIndicadorAvance {
  position: absolute;
  font-size: 15px;
  color: black;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}
</style>