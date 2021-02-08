<template>
  <div class="trabajo">
    <div id="zonaNombre" class="bordeAbajo">
      <div class="barraSuperiorZona">
       
      </div>
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
      <div class="nombreZona">Responsables</div>
      <div id="controlesResponsables" class="controlesZona">
        <div
          class="controlesResponsables hoverGris botonesControles"
          v-if="usuarioLogeado == true && usuarioResponsableTrabajo == false"
          id="botonParticipar"
          @click="asumirComoResponsable"
        >
          Participar
        </div>

        <div
          class="controlesResponsables hoverGris botonesControles"
          v-if="usuarioResponsableTrabajo == true"
          @click="abandonarListaResponsables"
        >
          Abandonar
        </div>
      </div>
      <div id="listaResponsables">
        <icono-persona-autonomo
          :idPersona="idPersona"
          :aceptado="true"
          :key="idPersona"
          v-for="idPersona of esteTrabajo.responsables"
        />
      </div>
    </div>

    <div
      id="zonaNodosConocimiento"
      class="zonaPrimerNivel"
      v-show="false"
    >
      <div class="nombreZona">Nodos de conocimiento involucrados</div>
      <div id="controlesNodosConocimiento" class="controlesZona">
        <div
          class="controlesNodosConocimiento hoverGris botonesControles"          
        >
          Añadir
        </div>
        <div
          class="controlesNodosConocimiento hoverGris botonesControles"
          v-if="            
            idNodoSeleccionado != null &&
            esteTrabajo.nodosConocimiento.some(
              (n) => n.id == idNodoSeleccionado
            )
          "
        >
          Remover
        </div>
      </div>
      <div id="listaNodosConocimiento" @click.self="idNodoSeleccionado = null">
        <icono-nodo-conocimiento
          :esteNodo="nodo"
          :key="nodo.id"
          v-for="nodo of esteTrabajo.nodosConocimiento"
          @click.native="idNodoSeleccionado = nodo.id"
        />
        <buscador-nodos-conocimiento />
      </div>
    </div>

    <div id="zonaForo" ref="zonaForo" class="zonaPrimerNivel" v-if="esteTrabajo.idForo">
      <div class="nombreZona">foro</div>
      <foro :parent="infoAsParent" :idForo="esteTrabajo.idForo" />
    </div>

    <div id="controlesTrabajo">
      
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import BuscadorNodosConocimiento from "./atlasConocimiento/BuscadorNodosConocimiento.vue";
import Foro from "./Foro.vue";
import IconoPersonaAutonomo from './proyecto/IconoPersonaAutonomo.vue';


const QUERY_TRABAJO = gql`
  query($idTrabajo: ID!) {
    trabajo(idTrabajo: $idTrabajo) {
      id
      nombre
      descripcion
      idForo
      responsables
    }
  }
`;

export default {
  name: "Trabajo",
  components: {
    BuscadorNodosConocimiento,
    Foro,
    IconoPersonaAutonomo
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
      },

      idNodoSeleccionado: null,
      deshabilitado: false,

    };
  },  
  computed: {
    usuarioResponsableTrabajo: function () {
      return this.esteTrabajo.responsables.includes(this.usuario.id);        
    },   
    infoAsParent(){
      return {
        id: this.esteTrabajo.id,
        tipo: "trabajo",
        nombre: this.esteTrabajo.nombre,
      }
    }
  },
  methods: {
   
    asumirComoResponsable() {
      console.log(
        `enviando id ${this.usuario.id} para la lista de responsables del trabajo con id ${this.esteTrabajo.id} en el proyecto con id ${this.idEsteProyecto}`
      );
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idTrabajo: ID!, $idUsuario: ID!) {
              addResponsableTrabajo(
                idTrabajo: $idTrabajo
                idUsuario: $idUsuario
              ) {
                id
                responsables
              }
            }
          `,
          variables: {
            idTrabajo: this.esteTrabajo.id,
            idUsuario: this.$store.state.usuario.id,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    abandonarListaResponsables() {
      console.log(`Abandonando este trabajo`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idTrabajo: ID!, $idUsuario: ID!) {
              removeResponsableTrabajo(
                idTrabajo: $idTrabajo
                idUsuario: $idUsuario
              ) {
                id
                responsables
              }
            }
          `,
          variables: {
            idTrabajo: this.esteTrabajo.id,
            idUsuario: this.$store.state.usuario.id,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    
  },
};
</script>

<style scoped>
.trabajo {
  border: 2px solid #0b8794;
  border-radius: 5px;
  min-height: 50px;
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
}
.nombreZona {
  font-size: 18px;
  padding: 5px 20px;
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
.botonesControles{
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
</style>