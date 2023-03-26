<template>
  <div class="objetivo">
    <div id="zonaNombre" class="bordeAbajo">
      <div class="barraSuperiorZona"></div>
      <div id="nombre">
        {{ esteObjetivo.nombre }}
      </div>
      <img src="@/assets/iconos/iconoObjetivo.png" alt="" id="imagenIcono" />
    </div>
    <div id="zonaDescripcion" class="zonaPrimerNivel">
      <div class="barraSuperiorZona">
        <span class="nombreZona">Descripcion</span>
      </div>

      <div id="descripcion" ref="descripcion">
        {{ esteObjetivo.descripcion }}
      </div>
    </div>

    <div id="zonaEnlaces" class="zonaPrimerNivel">
      <div
        class="barraSuperiorZona"
        @click="mostrandoEnlaces = !mostrandoEnlaces"
      >
        <div class="nombreZona">
          <div
            class="trianguloBullet"
            :style="{
              transform: mostrandoEnlaces ? 'rotateZ(90deg)' : 'rotateZ(0deg)',
            }"
          ></div>
          Enlaces
        </div>
      </div>

      <div v-show="mostrandoEnlaces">
        <div
          id="controlesEnlaces"
          class="controlesZona"
          :class="{ deshabilitado: enviandoQueryEnlaces }"
        >
          <loading v-show="enviandoQueryEnlaces" texto="Esperando..." />
          <div
            class="controlesEnlaces hoverGris botonesControles"
            :class="{ deshabilitado: enviandoQueryEnlaces }"
            v-if="usuarioLogeado == true && usuarioResponsable"
            id="botonCrearEnlace"
            @click="crearNuevoEnlace"
          >
            Crear enlace
          </div>
        </div>
        <div id="listaEnlaces">
          <enlace-nodo-solidaridad
            v-for="enlace of esteObjetivo.enlaces"
            :key="enlace.id"
            :esteEnlace="enlace"
            :idNodo="esteObjetivo.id"
            tipoNodo="objetivo"
            @meElimine="eliminarEnlaceCache(enlace.id)"
          />
        </div>
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
          Responsable{{ esteObjetivo.responsables.length === 1 ? "" : "s" }}
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
              usuarioResponsable &&
              responsablesSolicitados < 1
            "
            v-show="idResponsableSeleccionado === null"
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
              !usuarioResponsable &&
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
              (usuarioResponsable == true ||
                usuarioPosibleResponsableObjetivo == true)
            "
            v-show="idResponsableSeleccionado === null"
            @click="abandonarListaResponsables"
          >
            Abandonar
          </div>
          <div
            class="controlesResponsables hoverGris botonesControles"
            :class="{ deshabilitado: enviandoQueryResponsables }"
            v-if="usuarioLogeado == true && usuarioResponsable == true"
            v-show="
              idResponsableSeleccionado != null &&
              responsableSeleccionadoEstaAceptado == false
            "
            @click="aceptarResponsable(idResponsableSeleccionado)"
          >
            Aceptar como responsable
          </div>
        </div>
        <div
          id="listaResponsables"
          @click.stop="idResponsableSeleccionado = null"
        >
          <icono-persona-autonomo
            :idPersona="idPersona"
            :key="idPersona"
            v-for="idPersona of esteObjetivo.responsables"
            :seleccionado="idResponsableSeleccionado == idPersona"
            @click.native.stop="idResponsableSeleccionado = idPersona"
          />

          <icono-persona-autonomo
            class="personaPosibleResponsable"
            :idPersona="idPersona"
            :key="idPersona"
            v-for="idPersona of esteObjetivo.posiblesResponsables"
            v-show="
              usuarioResponsable ||
              (usuario && usuario.id && usuario.id === idPersona)
            "
            :seleccionado="idResponsableSeleccionado == idPersona"
            @click.native.stop="idResponsableSeleccionado = idPersona"
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
              :readonly="usuarioResponsable ? false : true"
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

    <div
      id="zonaForo"
      ref="zonaForo"
      class="zonaPrimerNivel"
      v-if="esteObjetivo.idForoResponsables && usuarioResponsable"
    >
      <div class="barraSuperiorZona">
        <div class="nombreZona">foro</div>
      </div>
      <foro :parent="infoAsParent" :idForo="esteObjetivo.idForoResponsables" />
    </div>

    <div id="controlesObjetivo"></div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Foro from "./Foro.vue";
import IconoPersonaAutonomo from "./usuario/IconoPersonaAutonomo.vue";
import Loading from "./utilidades/Loading.vue";
import debounce from "debounce";
import EnlaceNodoSolidaridad from "./paginaNodoSolidaridad/EnlaceNodoSolidaridad.vue";

const QUERY_OBJETIVO = gql`
  query ($idObjetivo: ID!) {
    objetivo(idObjetivo: $idObjetivo) {
      id
      nombre
      descripcion
      idForoResponsables
      responsables
      posiblesResponsables
      responsablesSolicitados
      enlaces {
        id
        nombre
        descripcion
        link
        tipo
      }
      nodoParent {
        idNodo
        tipo
      }
    }
  }
`;

export default {
  name: "Objetivo",
  components: {
    Foro,
    IconoPersonaAutonomo,
    Loading,
    EnlaceNodoSolidaridad,
  },
  apollo: {
    esteObjetivo: {
      query: QUERY_OBJETIVO,
      variables() {
        return {
          idObjetivo: this.$route.params.idObjetivo,
        };
      },
      update({ objetivo }) {
        this.responsablesSolicitados = objetivo.responsablesSolicitados;
        return objetivo;
      },
      skip() {
        return !this.$route.params.idObjetivo;
      },
    },
  },
  data() {
    return {
      esteObjetivo: {
        responsables: [],
        materiales: [],
        enlaces:[]
      },
      responsablesSolicitados: 0,
      idResponsableSeleccionado: null,

      idNodoSeleccionado: null,
      deshabilitado: false,

      idMaterialSeleccionado: null,
      creandoMaterial: false,

      enviandoQueryResponsables: false,
      mostrandoResponsables: true,

      enviandoQueryEnlaces: false,
      mostrandoEnlaces: true,
    };
  },
  computed: {
    usuarioResponsable: function () {
      return this.esteObjetivo.responsables.includes(this.usuario.id);
    },
    infoAsParent() {
      return {
        id: this.esteObjetivo.id,
        tipo: "objetivo",
        nombre: this.esteObjetivo.nombre,
      };
    },
    usuarioPosibleResponsableObjetivo: function () {
      if (!this.esteObjetivo.posiblesResponsables) return false;

      if (this.esteObjetivo.posiblesResponsables.includes(this.usuario.id)) {
        return true;
      }
      return false;
    },
    responsableSeleccionadoEstaAceptado() {
      return this.esteObjetivo.responsables.includes(
        this.idResponsableSeleccionado
      );
    },
  },
  methods: {
    asumirComoResponsable() {
      console.log(
        `enviando id ${this.usuario.id} para la lista de responsables del objetivo con id ${this.esteObjetivo.id} en el proyecto con id ${this.idEsteProyecto}`
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
      console.log(`Abandonando este objetivo`);
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
    crearNuevoEnlace() {
      this.enviandoQueryEnlaces = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $tipoNodo: String!) {
              crearEnlaceNodoSolidaridad(idNodo: $idNodo, tipoNodo: $tipoNodo) {
                id
                nombre
                descripcion
                link
                tipo
              }
            }
          `,
          variables: {
            idNodo: this.esteObjetivo.id,
            tipoNodo: "objetivo",
          },
        })
        .then(({ data: { crearEnlaceNodoSolidaridad } }) => {
          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_OBJETIVO,
            variables: {
              idObjetivo: this.esteObjetivo.id,
            },
          });
          var nuevoCache = JSON.parse(JSON.stringify(cache));
          var indexE = nuevoCache.objetivo.enlaces.findIndex(
            (e) => e.id === crearEnlaceNodoSolidaridad.id
          );
          if (indexE > -1) {
            console.log(`El enlace ya estaba en el caché`);
          } else {
            nuevoCache.objetivo.enlaces.push(crearEnlaceNodoSolidaridad);
          }
          store.writeQuery({
            query: QUERY_OBJETIVO,
            variables: {
              idObjetivo: this.esteObjetivo.id,
            },
            data: nuevoCache,
          });
          this.enviandoQueryEnlaces = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoQueryEnlaces = false;
        });
    },
    eliminarEnlaceCache(idEnlace) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_OBJETIVO,
        variables: {
          idObjetivo: this.esteObjetivo.id,
        },
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      const indexE = nuevoCache.objetivo.enlaces.findIndex(
        (e) => e.id === idEnlace
      );
      if (indexE > -1) {
        nuevoCache.objetivo.enlaces.splice(indexE, 1);        
      } else {
        console.log(`El enlace no estaba en el caché`);
      }
      store.writeQuery({
        query: QUERY_OBJETIVO,
        variables: {
          idObjetivo: this.esteObjetivo.id,
        },
        data: nuevoCache,
      });
      this.enviandoQueryEnlaces = false;
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
    this.$apollo.mutate({
      mutation: gql`
        mutation ($idNodo: ID!) {
          setNodoSolidaridadAsCoordsVistaUsuario(idNodo: $idNodo)
        }
      `,
      variables: {
        idNodo: this.$route.params.idObjetivo,
      },
    });
  },
};
</script>

<style scoped>
.objetivo {
  border: 2px solid #0b8794;
  border-radius: 5px;
  position: relative;
  padding: 5px 10px;
  padding-bottom: 20px;
  background-color: rgb(230, 247, 247);
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
  white-space: pre-wrap;
}
#imagenIcono {
  width: 30px;
  height: 30px;
}

.zonaPrimerNivel {
  position: relative;
  min-height: 50px;
  border-bottom: 2px solid black;
}
.barraSuperiorZona {
  display: flex;
  cursor: pointer;
  background-color: cadetblue;
}
.nombreZona {
  font-size: 18px;
  padding: 5px 20px;
  font-weight: bold;
}
#zonaNombre {
  position: relative;
  min-height: 50px;
}
#nombre {
  margin-top: 15px;
  font-size: 19px;
  padding: 5px 20px;
  font-weight: bolder;
  text-align: center;
  margin-bottom: 15px;
}

.inputNuevoNombre {
  font-size: 23px;
  display: block;
  margin: 10px auto;
  width: 80%;
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
.controlesZona {
  margin-left: auto;
  display: flex;
  font-size: 13px;
  flex-direction: row-reverse;
}
.botonesControles {
  border-radius: 3px;
  cursor: pointer;
  padding: 3px 5px;
}
.bEliminar:hover {
  background-color: red;
}
#listaResponsables {
  display: flex;
  padding: 10px 20px;
  padding-bottom: 65px;
}
.iconoPersonaAutonomo {
  margin-right: 25px;
  margin-left: 5px;
  vertical-align: middle;
  margin-top: 5px;
  margin-bottom: 5px;
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
#listaMateriales {
  padding: 10px 0px;
  border-radius: 15px;
  border: 2px solid cadetblue;
}
.trianguloBullet {
  border: 10px solid transparent;
  border-left: 10px solid black;
  display: inline-block;

  transform-origin: 25% 70%;
  transition: transform 0.2s;
}
</style>