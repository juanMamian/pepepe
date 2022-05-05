<template>
  <div class="personaVistaLista" :class="{ seleccionado }">
    <div id="barraSuperior">
      <div class="iconoPersona">
        <img
          src="@/assets/iconos/teacher.svg"
          alt="Profesor"
          v-if="estaPersona.permisos.includes('maestraVida-profesor')"
        />
        <img
          src="@/assets/iconos/graduationCap.svg"
          alt="CapGraduacion"
          @click="
            usuarioSuperadministrador
              ? togglePermiso('maestraVida-estudiante')
              : ''
          "
          v-if="estaPersona.permisos.includes('maestraVida-estudiante')"
        />
        <img
          src="@/assets/iconos/user.svg"
          alt="Usuario"
          @click="
            usuarioSuperadministrador
              ? togglePermiso('maestraVida-estudiante')
              : ''
          "
          v-if="
            !estaPersona.permisos.includes('maestraVida-profesor') &&
            !estaPersona.permisos.includes('maestraVida-estudiante')
          "
        />
      </div>
      <div id="zonaNombres">
        <div id="nombres">{{ estaPersona.nombres }}</div>
      </div>
      <div id="zonaApellidos">
        <div id="apellidos">{{ estaPersona.apellidos }}</div>
      </div>

      <div
        id="contenedorControlesPersona"
        class="contenedorControles"
        v-show="seleccionado"
      >
        <div
          class="boton selector"
          :title="
            mostrando === 'calendario'
              ? 'Ocultar calendario'
              : 'Mostrar calendario'
          "
          :class="{ activo: mostrando === 'calendario' }"
          v-show="
            usuario &&
            (usuarioProfe ||
              usuario.id === estaPersona.id ||
              usuarioSuperadministrador)
          "
          @click="mostrando = mostrando === 'calendario' ? null : 'calendario'"
        >
          <img src="@/assets/iconos/calendar.svg" alt="calendario" />
        </div>
        <div
          class="boton selector"
          v-if="usuarioSuperadministrador || usuarioProfe"
          :title="
            mostrando === 'nodosSolidaridadPublicitados'
              ? 'Ocultar nodosSolidaridadPublicitados'
              : 'Mostrar nodosSolidaridadPublicitados'
          "
          :class="{ activo: mostrando === 'nodosSolidaridadPublicitados' }"
          @click="
            mostrando =
              mostrando === 'nodosSolidaridadPublicitados'
                ? null
                : 'nodosSolidaridadPublicitados'
          "
        >
          <img src="@/assets/iconos/productHunt.svg" alt="P" />
        </div>
        <div
          class="boton selector"
          v-if="usuarioSuperadministrador"
          :title="
            mostrando === 'administracion'
              ? 'Ocultar administracion'
              : 'Mostrar administracion'
          "
          :class="{ activo: mostrando === 'administracion' }"
          @click="
            mostrando = mostrando === 'administracion' ? null : 'administracion'
          "
        >
          <img src="@/assets/iconos/cog.svg" alt="Cog" />
        </div>
        <div
          class="boton"
          @click="alienar"
          title="alienar"
          v-show="usuarioProfe || usuarioAdministrador"
        >
          <img src="@/assets/iconos/alienar.svg" alt="Virus" />
        </div>
        <div
          class="boton selector"
          v-if="usuarioLogeado && usuarioProfe"
          style="width:100px"
          :title="
            mostrando === 'informe' ? 'Ocultar informe' : 'Mostrar informe'
          "
          @click="mostrando = mostrando === 'informe' ? null : 'informe'"
          :class="{ activo: mostrando === 'informe' }"
        >
        Informe I
          
        </div>
        <div
          class="boton selector"
          v-if="usuarioLogeado"
          :title="
            mostrando === 'objetivos'
              ? 'Ocultar objetivos'
              : 'Mostrar objetivos'
          "
          @click="mostrando = mostrando === 'objetivos' ? null : 'objetivos'"
          :class="{ activo: mostrando === 'objetivos' }"
        >
          <img src="@/assets/iconos/starSolid.svg" alt="Cog" />
        </div>
      </div>
    </div>

    <div id="zonaContenidosMostrando">
      <div id="zonaAdministracion" v-show="mostrando === 'administracion'">
        <div id="barraInfoAdicional" v-show="seleccionado">
          <div id="username" v-if="usuarioSuperadministrador">
            {{ estaPersona.username }}
          </div>
        </div>
        <div id="contenedorAcciones" class="contenedorControles">
          <div
            class="boton selector"
            v-if="usuarioSuperadministrador"
            :class="{ activo: mostrandoPermisos }"
            @click="mostrandoPermisos = !mostrandoPermisos"
            :title="mostrandoPermisos ? 'Ocultar permisos' : 'Mostrar permisos'"
          >
            <img src="@/assets/iconos/idBadge.svg" alt="Id" />
          </div>
          <div
            class="boton"
            title="Restaurar password (123456)"
            v-show="!reseteandoPassword"
            @click="resetearPassword"
          >
            <img src="@/assets/iconos/key.svg" alt="Llave" />
          </div>
          <loading texto="" v-show="reseteandoPassword" />
        </div>
        <div
          id="listaPermisos"
          v-if="usuarioSuperadministrador"
          v-show="mostrandoPermisos"
          :class="{ deshabilitado: togglingPermiso }"
        >
          <div
            class="activadorPermiso"
            @click="togglePermiso(permiso)"
            :class="{ permisoGranted: estaPersona.permisos.includes(permiso) }"
            v-for="permiso of permisosPosibles"
            :key="permiso + 'permiso'"
          >
            {{ permiso }}
          </div>
        </div>
      </div>
      <div id="zonaInforme" v-show="mostrando === 'informe'">
        <div class="contenedorSeccionInforme">
          <div class="tituloSeccionInforme">Sobre objetivos</div>
          <textarea
            id="textAreaInformeObjetivos"
            @blur="guardarInforme('objetivos')"
            ref="inputInformeCategoriaObjetivos"
            class="seccionInforme"
            :value="misInformesActivos.objetivos"
            :class="{deshabilitado: guardandoInformeObjetivos}"
          ></textarea>

          <div class="tituloSeccionInforme">Sobre proyectos</div>
          <textarea
            id="textAreaInformeProyectos"
            @blur="guardarInforme('proyectos')"
            ref="inputInformeCategoriaProyectos"
            class="seccionInforme"
            :value="misInformesActivos.proyectos"
            :class="{deshabilitado: guardandoInformeProyectos}"
          ></textarea>

          <div class="tituloSeccionInforme">Sobre espacios</div>
          <textarea
            id="textAreaInformeProyectos"
            @blur="guardarInforme('espacios')"
            ref="inputInformeCategoriaEspacios"
            class="seccionInforme"
            :class="{deshabilitado: guardandoInformeEspacios}"
            :value="misInformesActivos.espacios"
          ></textarea>

          <div class="tituloSeccionInforme">Comentario</div>
          <textarea
            id="textAreaInformeComentario"
            @blur="guardarInforme('comentario')"
            ref="inputInformeCategoriaComentario"
            class="seccionInforme"
            :class="{deshabilitado: guardandoInformeComentario}"
            :value="misInformesActivos.comentario"
          ></textarea>
        </div>
      </div>
      <div
        v-show="mostrando === 'nodosSolidaridadPublicitados'"
        id="zonaNodosSolidaridadPublicitados"
        class="zonaPrimerNivel"
      >
        <div
          class="selectorNodoSolidaridad"
          :class="{
            deshabilitado: settingPresenciaNodoSolidaridad,
            activo: nodoSolidaridadPublicitado.responsables.includes(
              estaPersona.id
            ),
          }"
          @click="toggleResponsableNodoSolidaridad(nodoSolidaridadPublicitado)"
          v-for="nodoSolidaridadPublicitado of nodosSolidaridadPublicitados"
          :key="nodoSolidaridadPublicitado.id"
        >
          {{ nodoSolidaridadPublicitado.nombre }}
        </div>
      </div>
      <div
        id="zonaCalendario"
        class="zonaPrimerNivel"
        v-if="mostrando === 'calendario'"
      >
        <calendario
          :idUsuarioTarget="estaPersona.id"
          ref="calendario"
          enfasis="eventosPersonales"
        />
      </div>
      <div
        id="zonaObjetivos"
        class="zonaPrimerNivel"
        v-if="mostrando === 'objetivos'"
      >
        <ventana-lista
          ref="ventanaLista"
          :idNodoRoot="estaPersona.id"
          tipoNodoRoot="usuario"
        />
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Calendario from "../utilidades/Calendario.vue";
import Loading from "../utilidades/Loading.vue";
import VentanaLista from "../atlasSolidaridad/ventanaLista/ventanaLista.vue";
export default {
  components: { Calendario, Loading, VentanaLista },
  props: {
    estaPersona: Object,
    seleccionado: Boolean,
    nodosSolidaridadPublicitados: Array,
  },
  name: "PersonaVistaLista",
  data() {
    return {
      permisosPosibles: [
        "usuario",
        "administrador",
        "atlasAdministrador",
        "superadministrador",
        "maestraVida",
        "maestraVida-estudiante",
        "maestraVida-profesor",
        "maestraVida-acompañante",
      ],

      mostrando: null,
      reseteandoPassword: false,
      alienando: false,

      mostrandoPermisos: false,
      togglingPermiso: false,

      settingPresenciaNodoSolidaridad: false,

      guardandoInformeObjetivos: false,
      guardandoInformeEspacios: false,
      guardandoInformeComentario: false,
      guardandoInformeProyectos: false,
      
    };
  },
  methods: {
    resetearPassword() {
      if (
        !confirm(
          "¿Confirmar resetear el password de " + this.estaPersona.nombres + "?"
        )
      ) {
        return;
      }
      console.log(`Reseteando password usuario`);
      this.reseteandoPassword = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idUsuario: ID!) {
              resetearPasswordUsuario(idUsuario: $idUsuario)
            }
          `,
          variables: {
            idUsuario: this.estaPersona.id,
          },
        })
        .then(() => {
          this.reseteandoPassword = false;
          alert("Contraseña reseteada");
        })
        .catch(() => {
          this.reseteandoPassword = false;
        });
    },
    alienar() {
      if (!this.usuarioProfe && !this.usuarioSuperadministrador) {
        return;
      }

      this.alienando = true;
      this.$apollo
        .query({
          query: gql`
            query ($idAlienado: ID!) {
              alienarUsuario(idAlienado: $idAlienado)
            }
          `,
          variables: {
            idAlienado: this.estaPersona.id,
          },
        })
        .then(({ data: { alienarUsuario } }) => {
          console.log(`Alienando`);
          this.alienando = true;
          this.$store.commit("logearse", alienarUsuario);
          this.$router.push("/miPerfil");
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.alienando = false;
        });
    },
    togglePermiso(permiso) {
      if (!this.usuarioSuperadministrador) {
        return;
      }
      this.togglingPermiso = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($permiso: String!, $idUsuario: ID!) {
              togglePermisoUsuario(permiso: $permiso, idUsuario: $idUsuario) {
                id
                permisos
              }
            }
          `,
          variables: {
            permiso,
            idUsuario: this.estaPersona.id,
          },
        })
        .then(() => {
          this.togglingPermiso = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.togglingPermiso = false;
        });
    },
    toggleResponsableNodoSolidaridad(nodo) {
      console.log(
        `Setting presencia de ${this.estaPersona.id} en el nodo ${nodo.id}`
      );
      const personaEnResponsables = nodo.responsables.includes(
        this.estaPersona.id
      );

      if (personaEnResponsables) {
        console.log(`Sacándolo`);

        this.settingPresenciaNodoSolidaridad = true;
        this.$apollo
          .mutate({
            mutation: gql`
              mutation ($idNodo: ID!, $idUsuario: ID!) {
                removeResponsableNodoSolidaridad(
                  idNodo: $idNodo
                  idUsuario: $idUsuario
                ) {
                  id
                  responsables
                }
              }
            `,
            variables: {
              idNodo: nodo.id,
              idUsuario: this.estaPersona.id,
            },
          })
          .then(() => {
            this.settingPresenciaNodoSolidaridad = false;
          })
          .catch((error) => {
            console.log(`Error: ${error}`);
            this.settingPresenciaNodoSolidaridad = false;
          });
      } else {
        console.log(`Dentrándolo`);
        this.settingPresenciaNodoSolidaridad = true;

        this.$apollo
          .mutate({
            mutation: gql`
              mutation ($idNodo: ID!, $idUsuario: ID!) {
                addResponsableNodoSolidaridad(
                  idNodo: $idNodo
                  idUsuario: $idUsuario
                ) {
                  id
                  responsables
                }
              }
            `,
            variables: {
              idNodo: nodo.id,
              idUsuario: this.estaPersona.id,
            },
          })
          .then(() => {
            this.settingPresenciaNodoSolidaridad = false;
          })
          .catch((error) => {
            console.log(`Error: ${error}`);
            this.settingPresenciaNodoSolidaridad = false;
          });
      }
    },
    guardarInforme(categoria) {
      console.log("Guardando informe");
      var texto=null;
      if (categoria === "objetivos") {
        this.guardandoInformeObjetivos = true;
        texto=this.$refs.inputInformeCategoriaObjetivos.value;
      }
      if (categoria === "espacios") {
        this.guardandoInformeEspacios = true;
        texto=this.$refs.inputInformeCategoriaEspacios.value;
      }
      if (categoria === "comentario") {
        this.guardandoInformeComentario = true;
        texto=this.$refs.inputInformeCategoriaComentario.value;
      }
      if (categoria === "proyectos") {
        this.guardandoInformeProyectos = true;
        texto=this.$refs.inputInformeCategoriaProyectos.value;
      }

      if(!texto || texto.lenght<5){
        console.log("Cancelando");
        this.guardandoInformeObjetivos = false;
        this.guardandoInformeEspacios = false;
        this.guardandoInformeComentario = false;
        this.guardandoInformeProyectos = false;

        return;
      }
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idUsuario: ID!
              $year: Int!
              $periodo: String!
              $idProfe: ID!
              $categoria: String!
              $texto: String!
            ) {
              guardarInformeEstudianteMaestraVida(
                idUsuario: $idUsuario
                year: $year
                periodo: $periodo
                idProfe: $idProfe
                categoria: $categoria
                texto: $texto
              ) {
                id
                year
                periodo
                idProfe
                categoria
                texto
              }
            }
          `,
          variables: {
            idUsuario: this.estaPersona.id,
            year: 2022,
            periodo: "primero",
            idProfe: this.usuario.id,
            categoria,
            texto,
          },
        })
        .then(() => {
          if (categoria === "objetivos") {
            this.guardandoInformeObjetivos = false;
          }
          if (categoria === "espacios") {
            this.guardandoInformeEspacios = false;
          }
          if (categoria === "comentario") {
            this.guardandoInformeComentario = false;
          }
          if (categoria === "proyectos") {
            this.guardandoInformeProyectos = false;
          }
        })
        .catch(() => {
          console.log("error");
          if (categoria === "objetivos") {
            this.guardandoInformeObjetivos = false;
          }
          if (categoria === "espacios") {
            this.guardandoInformeEspacios = false;
          }
          if (categoria === "comentario") {
            this.guardandoInformeComentario = false;
          }
          if (categoria === "proyectos") {
            this.guardandoInformeProyectos = false;
          }
        });
    },
  },
  computed:{
    misInformesActivos(){
      if(!this.estaPersona.informesMaestraVida){
        return {
          objetivos: null,
          espacios:null,
          comentario: null,
          proyectos:null,
        }
      }
      var miInformeObjetivos=this.estaPersona.informesMaestraVida.find(i=>i.year===2022 && i.periodo==='primero' && i.idProfe===this.usuario.id && i.categoria==='objetivos');
      var miInformeEspacios=this.estaPersona.informesMaestraVida.find(i=>i.year===2022 && i.periodo==='primero' && i.idProfe===this.usuario.id && i.categoria==='espacios');
      var miInformeComentario=this.estaPersona.informesMaestraVida.find(i=>i.year===2022 && i.periodo==='primero' && i.idProfe===this.usuario.id && i.categoria==='comentario');
      var miInformeProyectos=this.estaPersona.informesMaestraVida.find(i=>i.year===2022 && i.periodo==='primero' && i.idProfe===this.usuario.id && i.categoria==='proyectos');
      return {
        objetivos: miInformeObjetivos?miInformeObjetivos.texto:"",
        espacios: miInformeEspacios?miInformeEspacios.texto:"",
        comentario: miInformeComentario?miInformeComentario.texto:"",
        proyectos: miInformeProyectos?miInformeProyectos.texto:"",
      }
    }
  },
  watch: {
    seleccionado(seleccionado) {
      if (!seleccionado) {
        this.mostrando = null;
      }
    },
  },
};
</script>

<style scoped>
.personaVistaLista {
  width: 100%;
  font-family: Salsa, cursive;
  color: gray;
}
.personaVistaLista.seleccionado {
  background-color: rgba(128, 128, 128, 0.342);
}
#barraSuperior {
  display: flex;
  font-size: 15px;
  padding: 25px 15px;
  flex-wrap: wrap;
  width: 100%;
}
.iconoPersona {
  height: 20px;
  width: 20px;
}
.iconoPersona img {
  height: 100%;
}
#zonaNombres {
  margin: 0px 15px;
}
#barraInfoAdicional {
  display: flex;
}
#contenedorControlesPersona {
  margin-left: auto;
}
#listaPermisos {
  max-width: 150px;
  margin-left: auto;
}
.activadorPermiso {
  padding: 5px 15px;
  cursor: pointer;
  font-size: 13px;
}
.activadorPermiso.permisoGranted {
  background-color: var(--paletaSelect);
  color: whitesmoke;
}
.selectorNodoSolidaridad {
  padding: 5px 15px;
  cursor: pointer;
}
.selectorNodoSolidaridad.activo {
  background-color: var(--paletaSelect);
  color: white;
}

.seccionInforme{
  height: 150px;
  width: 100%;
  margin-bottom: 30px;
}

.tituloSeccionInforme{
  font-weight: bold;
  
}
</style>