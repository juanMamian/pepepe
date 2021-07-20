<template>
  <div class="ventanaEventoCalendario" @click.stop="" @mouseup.left.stop="">
    <div id="zonaParent" v-if="infoEvento">
      <div id="nombreParent">
        {{infoEvento.tipoParent}}: {{infoEvento.nombreParent}}
      </div>
    </div>
    <div id="zonaConfirmarAsistencia">
      <img src="@/assets/iconos/join.png" @click.stop="toggleAsistencia" class="botonConfirmacionAsistencia" :class="{asistenciaConfirmada: usuarioParticipanteEvento, deshabilitado: enviandoQueryAsistencia}" id="botonConfirmarAsistencia" :title="usuarioParticipanteEvento?'Cancelar asistencia':'Confirmar asistencia'"/>
      
    </div>
    <div id="zonaNombre" class="zonaPrimerNivel">
      <div class="controlesZona" v-show="usuarioResponsableEvento">
        <img
          src="@/assets/iconos/editar.png"
          alt="Editar"
          id="bEditarNombre"
          class="bEditar"
          title="Editar nombre del evento"
          @click="toggleEditandoNombre"
        />
        <img
          src="@/assets/iconos/guardar.png"
          alt="Guardar"
          title="guardar"
          class="bGuardar"
          id="bGuardarNuevoNombre"
          v-show="editandoNombre == true && nuevoNombreIlegal == false"
          @click="guardarNuevoNombre"
        />
      </div>
      <div id="nombre" v-show="!editandoNombre">
        {{ esteEvento.nombre }}
      </div>
      <input
        type="text"
        id="inputNuevoNombre"
        :class="{ letrasRojas: nuevoNombreIlegal }"
        v-model="nuevoNombre"
        v-show="editandoNombre"
        @keypress.enter="guardarNuevoNombre"
      />
      <loading v-show="enviandoNuevoNombre" texto="Enviando..." />      
    </div>

    <div id="zonaDescripcion" class="zonaPrimerNivel">
        <div class="barraSuperiorZona">
          <div
            class="nombreZona"            
          >            
            Detalles
          </div>
        </div>        
          <div class="controlesZona" v-if="usuarioResponsableEvento">
            <img
              src="@/assets/iconos/editar.png"
              alt="Editar"
              id="bEditarrDescripcion"
              class="bEditar"
              title="Editar descripcion del evento"
              @click="toggleEditandoDescripcion"
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
              @click="guardarNuevoDescripcion"
            />
          </div>
          <div id="descripcion" ref="descripcion" v-show="!editandoDescripcion">
            {{ esteEvento.descripcion }}
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

    <div id="zonaParticipantes" class="zonaPrimerNivel">
      <div class="barraSuperiorZona">
          <div
            class="nombreZona"            
          >            
            Participantes
          </div>
        </div>
        <div id="listaParticipantes" @click="idParticipanteSeleccionado=null">            
            <icono-persona-autonomo
              :idPersona="idPersona"
              factorEscala=0.7
              :key="'participante'+idPersona"
              v-for="idPersona of esteEvento.participantes"
              :seleccionado="idParticipanteSeleccionado == idPersona"
              @click.native.stop="
                idParticipanteSeleccionado = idPersona;
                participanteSeleccionadoEstaAceptado = true;
              "
            />            
          </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import Loading from './Loading.vue';
import iconoPersonaAutonomo from "../usuario/IconoPersonaAutonomo.vue"
const charProhibidosNombreEvento = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
const charProhibidosDescripcionEvento = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

const QUERY_INFO_EVENTO=gql`
  query($idEvento:ID!){
    infoAdicionalEvento(idEvento:$idEvento){
      id
      participantes{
        id
        nombres
        apellidos
      }
      nombreParent
      tipoParent
    }
  }

`;

export default {
  components: { Loading, iconoPersonaAutonomo },
  apollo:{
    infoEvento:{
      query: QUERY_INFO_EVENTO,
      variables(){
        return {
          idEvento: this.esteEvento.id
        }
      },
      update(data){
        return data.infoAdicionalEvento
      },
      skip(){
        return (!this.esteEvento || !this.esteEvento.id)
      }
    }
  },
  name: "VentanaEventoCalendario",
  props: {
    esteEvento: Object,
  },
  data() {
    return {
      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: "Nueva descripcion",
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,

      enviandoQueryAsistencia:false,

      idParticipanteSeleccionado:null,
    };
  },
  methods: {
    guardarNuevoNombre() {
      if (this.nuevoNombreIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoNombre == this.esteEvento.nombre) {
        this.editandoNombre = false;
        return;
      }
      console.log(`guardando nuevo nombre`);
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idEvento: ID!, $nuevoNombre: String!) {
              editarNombreEventoCalendario(
                idEvento: $idEvento
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idEvento: this.esteEvento.id,
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
      if (this.nuevoDescripcion == this.esteEvento.descripcion) {
        this.editandoDescripcion = false;
        return;
      }
      console.log(`guardando nuevo descripcion`);
      this.enviandoNuevoDescripcion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idEvento: ID!, $nuevoDescripcion: String!) {
              editarDescripcionEventoCalendario(
                idEvento: $idEvento
                nuevoDescripcion: $nuevoDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idEvento: this.esteEvento.id,
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
      this.nuevoNombre = this.esteEvento.nombre;
    },
    toggleEditandoDescripcion() {
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.esteEvento.descripcion;
    },
    toggleAsistencia(){
      if(!this.usuario || !this.usuario.id)return
      this.enviandoQueryAsistencia=true;
      console.log(`Toggling asistencia`);
      this.$apollo.mutate({
        mutation: gql`
          mutation($idEvento: ID!, $idUsuario:ID!, $nuevoAsistencia:Boolean!){
            setAsistenciaUsuarioEventoCalendario(idEvento: $idEvento, idUsuario: $idUsuario, nuevoAsistencia: $nuevoAsistencia){
              id
              participantes
            }
          }
        `,
        variables:{
          idEvento: this.esteEvento.id,
          idUsuario: this.usuario.id,
          nuevoAsistencia: this.usuarioParticipanteEvento?false:true,
        }
      }).then(()=>{
        this.enviandoQueryAsistencia=false;
      }).catch((error)=>{
        console.log(`Error toggling asistencia: ${error}`);
        this.enviandoQueryAsistencia=false;
      })
    }
  },
  computed: {
    usuarioResponsableEvento() {
      if (!this.usuario || !this.usuario.id) return false;
      return this.esteEvento.responsables.includes(this.usuario.id);
    },
    nuevoNombreIlegal() {
      if (!this.nuevoNombre || this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreEvento.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoDescripcionIlegal() {
      if (!this.nuevoDescripcion || this.nuevoDescripcion.length < 1) {
        return true;
      }
      if (charProhibidosDescripcionEvento.test(this.nuevoDescripcion)) {
        return true;
      }
      return false;
    },
    usuarioParticipanteEvento(){
      if(!this.usuario || !this.usuario.id){
        return false;
      }

      return this.esteEvento.participantes.includes(this.usuario.id)
    }
  },
};
</script>

<style scoped>
.ventanaEventoCalendario {
  background-color: rgb(127, 202, 202);
}
#zonaParent{
  padding: 5px;
}
#nombreParent{
  font-size: 12px;
  font-style: italic;
  color: gray;
}
#zonaConfirmarAsistencia{
  position: absolute;
  left:100%;
  top: 5%;
  
  border-radius: 20px;
}
.botonConfirmacionAsistencia{
  width: 30px;  
  border-radius: 50%;
  cursor:pointer;
  border: 1px solid black;
}
.botonConfirmacionAsistencia.asistenciaConfirmada{
  background-color: rgb(68, 184, 68);
}
.botonConfirmacionAsistencia:not(.asistenciaConfirmada):hover{
  background-color: rgba(68, 184, 68, 0.514);
}
.botonConfirmacionAsistencia.asistenciaConfirmada:hover{
    background-color: rgba(68, 184, 68, 0.452);

}
.zonaPrimerNivel {
  border: 2px solid black;
  position: relative;
  min-height: 10px;
}
.controlesZona {
  display: flex;
  font-size: 13px;
  flex-direction: row-reverse;
}
.bEditar {
  width: 25px;
  height: 25px;
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

#nombre {
  margin-top: 15px;
  font-size: 18px;
  font-weight: bolder;
  text-align: center;
  margin-bottom: 15px;
}

#descripcion {
  font-size: 14px;
  width: 95%;
  margin: 10px auto;
  padding: 10px;
  min-height: 100px;
  resize: vertical;
  border: none;
  background-color: transparent;
  white-space: pre-wrap;
}
#inputNuevoNombre {
  font-size: 23px;
  display: block;
  margin: 10px auto;
}

#inputNuevoDescripcion {
  width: 95%;
  font-size: 19px;
  height: 70px;
  display: block;
  margin: 10px auto;
  resize: vertical;
}

#listaParticipantes {
  display: flex;
  padding: 10px 20px;
  padding-bottom: 65px;
  max-height: 500px;
}
.iconoPersonaAutonomo{
  margin: 0px 10px;
}
</style>