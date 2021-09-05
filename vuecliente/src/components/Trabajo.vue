<template>
  <div class="trabajo">
    <div id="zonaNombre" class="bordeAbajo">
      <div class="barraSuperiorZona"></div>
      <div id="nombre">
        {{ esteTrabajo.nombre }}
      </div>
      <img src="@/assets/iconos/iconoTrabajo.png" alt="" id="imagenIcono" />
    </div>
    <div id="zonaDescripcion" class="zonaPrimerNivel">
      <div class="barraSuperiorZona">
        <span class="nombreZona">Descripcion</span>
      </div>

      <div id="descripcion" ref="descripcion">
        {{ esteTrabajo.descripcion }}
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
              usuarioResponsable &&
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
              !usuarioResponsable &&
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
              (usuarioResponsable == true ||
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
        <div id="listaResponsables" @click.stop="idResponsableSeleccionado=null">
          <icono-persona-autonomo
            :idPersona="idPersona"
            :key="idPersona"
            v-for="idPersona of esteTrabajo.responsables"
            :seleccionado="idResponsableSeleccionado == idPersona"
            @click.native.stop="
              idResponsableSeleccionado = idPersona;
            "
          />

          <icono-persona-autonomo
            class="personaPosibleResponsable"
            :idPersona="idPersona"
            :key="idPersona"
            v-for="idPersona of esteTrabajo.posiblesResponsables"
            v-show="
              usuarioResponsable ||
              (usuario && usuario.id && usuario.id === idPersona)
            "
            :seleccionado="idResponsableSeleccionado == idPersona"
            @click.native.stop="
              idResponsableSeleccionado = idPersona;
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
              :readonly="usuarioResponsable ? false : true"
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
      id="zonaMateriales"
      ref="zonaMateriales"
      class="zonaPrimerNivel"
      @click.stop="idMaterialSeleccionado = null"
    >
      <div class="barraSuperiorZona">
        <div class="nombreZona">Materiales</div>
      </div>
      <div id="controlesMateriales" class="controlesZona">
        <div
          class="controlesMateriales botonesControles hoverGris"
          v-if="usuarioResponsable"
          @click="crearNuevoMaterial"
        >
          Añadir material
        </div>
      </div>

      <div id="listaMateriales" v-show="esteTrabajo.materiales.length > 0">
        <material-trabajo
          v-for="material of esteTrabajo.materiales"
          :key="material.id"
          :esteMaterial="material"
          :seleccionado="material.id == idMaterialSeleccionado"
          :usuarioResponsable="usuarioResponsable"
          :idTrabajo="esteTrabajo.id"
          @click.native.stop="idMaterialSeleccionado = material.id"
          @meElimine="eliminarMaterialDeCache(material.id)"
        />
      </div>
    </div>

    <div
      id="zonaForo"
      ref="zonaForo"
      class="zonaPrimerNivel"
      v-if="esteTrabajo.idForoResponsables && usuarioResponsable"
    >
      <div class="barraSuperiorZona">
        <div class="nombreZona">foro</div>
      </div>
      <foro :parent="infoAsParent" :idForo="esteTrabajo.idForoResponsables" />
    </div>

    <div id="controlesTrabajo"></div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Foro from "./Foro.vue";
import IconoPersonaAutonomo from "./usuario/IconoPersonaAutonomo.vue";
import MaterialTrabajo from "./trabajos/Material.vue";
import Loading from "./utilidades/Loading.vue";
import debounce from "debounce"

const QUERY_TRABAJO = gql`
  query ($idTrabajo: ID!) {
    trabajo(idTrabajo: $idTrabajo) {
      id
      nombre
      descripcion
      idForoResponsables
      responsables
      posiblesResponsables
      responsablesSolicitados
      nodoParent{
        idNodo
        tipo
      }      
      materiales {
        id
        nombre
        descripcion
        cantidadNecesaria
        cantidadDisponible
      }
    }
  }
`;

export default {
  name: "Trabajo",
  components: {
    Foro,
    IconoPersonaAutonomo,
    MaterialTrabajo,
    Loading,
  },
  apollo: {
    esteTrabajo: {
      query: QUERY_TRABAJO,
      variables() {
        return {
          idTrabajo: this.$route.params.idTrabajo,
        };
      },
      update({ trabajo }) {
        this.responsablesSolicitados=trabajo.responsablesSolicitados;
        return trabajo;
      },
      skip() {
        return !this.$route.params.idTrabajo;
      },
    },
  },
  data() {
    return {
      esteTrabajo: {
        responsables: [],
        materiales: [],
      },
      responsablesSolicitados:0,
      idResponsableSeleccionado: null,

      idNodoSeleccionado: null,
      deshabilitado: false,

      idMaterialSeleccionado: null,
      creandoMaterial: false,

      enviandoQueryResponsables: false,
      mostrandoResponsables:true,
    };
  },
  computed: {
    usuarioResponsable: function () {
      return this.esteTrabajo.responsables.includes(this.usuario.id);
    },
    infoAsParent() {
      return {
        id: this.esteTrabajo.id,
        tipo: "trabajo",
        nombre: this.esteTrabajo.nombre,
      };
    },
    usuarioPosibleResponsableTrabajo: function () {
      if (!this.esteTrabajo.posiblesResponsables) return false;

      if (this.esteTrabajo.posiblesResponsables.includes(this.usuario.id)) {
        return true;
      }
      return false;
    },
    responsableSeleccionadoEstaAceptado() {
      return this.esteTrabajo.responsables.includes(
        this.idResponsableSeleccionado
      );
    },
  },
  methods: {
    asumirComoResponsable() {
      console.log(
        `enviando id ${this.usuario.id} para la lista de responsables del trabajo con id ${this.esteTrabajo.id} en el proyecto con id ${this.idEsteProyecto}`
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
        })
        .catch((error) => {
          this.enviandoQueryResponsables = false;
          console.log("error: " + error);
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
            idUsuario: this.$store.state.usuario.id,
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
      console.log(`Abandonando este trabajo`);
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
        })
        .catch((error) => {
          this.enviandoQueryResponsables = false;
          console.log("error: " + error);
        });
    },
    crearNuevoMaterial() {
      console.log(`enviando mutacion de crear nuevo material`);
      this.creandoMaterial = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idTrabajo: ID!) {
              crearMaterialEnTrabajoSolidaridad(                
                idTrabajo: $idTrabajo
              ) {
                id
                nombre
                descripcion
                cantidadNecesaria
                cantidadDisponible
              }
            }
          `,
          variables: {            
            idTrabajo: this.esteTrabajo.id,
          },
          update: (store, { data: { crearMaterialEnTrabajoSolidaridad } }) => {
            
            const nuevoMaterial = crearMaterialEnTrabajoSolidaridad;
            try {
              let cache = store.readQuery({
                query: QUERY_TRABAJO,
                variables: {                  
                  idTrabajo: this.esteTrabajo.id,
                },
              });

              let nuevoCache = JSON.parse(JSON.stringify(cache));
              nuevoCache.trabajo.materiales.push(nuevoMaterial);

              store.writeQuery({
                query: QUERY_TRABAJO,
                variables: {                  
                  idTrabajo: this.esteTrabajo.id,
                },
                data: nuevoCache,
              });
              console.log(`cache actualizado`);
            } catch (error) {
              console.log(`Error actualizando cache: ${error}`);
              return;
            }
          },
        })
        .then((respuesta) => {
          console.log(`respuesta. ${respuesta}`);
          this.creandoMaterial = false;
        })
        .catch((error) => {
          this.creandoMaterial = false;
          console.log(`error: ${error}`);
        });
    },
    eliminarMaterialDeCache(idMaterial) {
      let store = this.$apollo.provider.defaultClient;
      let cache = store.readQuery({
        query: QUERY_TRABAJO,
        variables: {
          idTrabajo: this.esteTrabajo.id,
        },
      });
      let nuevoCache = JSON.parse(JSON.stringify(cache));
      let indexT = nuevoCache.trabajo.materiales.findIndex(
        (t) => t.id == idMaterial
      );
      if (indexT > -1) {
        nuevoCache.trabajo.materiales.splice(indexT, 1);
      } else {
        console.log(`El material no existía en el trabajo`);
      }
      store.writeQuery({
        query: QUERY_TRABAJO,
        variables: {
          idTrabajo: this.esteTrabajo.id,
        },
        data: nuevoCache,
      });
    },
    debounceSetResponsablesSolicitados: debounce(function(){
      this.setResponsablesSolicitados(parseInt(this.responsablesSolicitados));
    }, 2000),    
    setResponsablesSolicitados(cantidad) {
      if (cantidad < 0) cantidad = 0;
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
        .then(() => {          
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },    
  },
  watch:{
    responsablesSolicitados(nuevo){
      if(nuevo===this.esteTrabajo.responsablesSolicitados)return;
      console.log(`Cambio en responsables solicitados`);
      this.debounceSetResponsablesSolicitados();
    }
  },
  mounted(){
    this.$apollo.mutate({
      mutation: gql`
        mutation($idNodo: ID!){
          setNodoSolidaridadAsCoordsVistaUsuario(idNodo: $idNodo)
        }
      `,
      variables:{
        idNodo:this.$route.params.idTrabajo
      }
    })
  }
  
};
</script>

<style scoped>
.trabajo {
  border: 2px solid #0b8794;
  border-radius: 5px;
  position: relative;
  padding: 5px 10px;
  padding-bottom: 20px;
  background-color: rgb(230, 247, 247);
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