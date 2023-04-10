<template>
  <div class="archivoSeccionNodo" :class="{deshabilitado: eliminandose}">
    <div id="barraSuperior">
      <div id="icono">
        <img src="@/assets/iconos/file.svg" alt="Archivo" />
      </div>
      <div id="nombre">
        {{ esteArchivo.nombre }}
      </div>

      <div
        class="contenedorControles"
        style="margin-left: auto; margin-right: 10px"
      >
        <div class="boton" title="Eliminar" @click="eliminarse">
          <img src="@/assets/iconos/trash.svg" alt="Basura" />
        </div>
        <div class="boton" @click="marcarPrimario" v-show="!esteArchivo.primario && !marcandoPrimario">
          <img src="@/assets/iconos/arrowUp.svg" alt="Subir" />
        </div>
        <loading texto="" v-show="marcandoPrimario" />
      </div>
    </div>
  </div>
</template>

<script>
import {gql} from "@apollo/client/core";
import Loading from '../../utilidades/Loading.vue';
export default {
  components: { Loading },
  name: "ArchivoSeccionNodo",
  props: {
    esteArchivo: Object,
    usuarioExperto: Boolean,
    idNodo: String,
    idSeccion: String,
  },
  data() {
    return {
      eliminandose: false,
      marcandoPrimario:false,
    };
  },
  methods: {
    eliminarse() {
      if (!this.usuarioExperto) {
        return;
      }
      if (!confirm("Borrando archivo ¿Continuar?")) {
        console.log(`Cancelado`);
        return;
      }
      this.eliminandose = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idSeccion: ID!, $nombreArchivo: String!) {
              eliminarArchivoSeccionNodo(
                idNodo: $idNodo
                idSeccion: $idSeccion
                nombreArchivo: $nombreArchivo
              )
            }
          `,
          variables: {
            idNodo: this.idNodo,
            idSeccion: this.idSeccion,
            nombreArchivo: this.esteArchivo.nombre,
          },
        })
        .then(({ data: { eliminarArchivoSeccionNodo } }) => {
          this.eliminandose = false;

          if (!eliminarArchivoSeccionNodo) {
            console.log(`Archivo no eliminado`);
            return;
          }
          this.$emit("meElimine");
        })
        .catch((error) => {
          this.eliminandose = false;
          console.log(`Error. E: ${error}`);
        });
    },
    marcarPrimario(){
      this.marcandoPrimario=true;
      this.$apollo.mutate({
        mutation:gql`
          mutation($idNodo:ID!, $idSeccion: ID!, $nombreArchivo:String!){
            marcarPrimarioArchivoSeccionNodo(idNodo:$idNodo, idSeccion:$idSeccion, nombreArchivo: $nombreArchivo)
          }
        `,
        variables:{
          idNodo: this.idNodo,
          idSeccion:this.idSeccion,
          nombreArchivo:this.esteArchivo.nombre
        }
      }).then(()=>{
        this.marcandoPrimario=false;
        this.$emit('soyPrimario');
      }).catch(()=>{
        this.marcandoPrimario=false;
      })
    }
  },
};
</script>

<style scoped>
.archivoSeccionNodo {
}
#barraSuperior {
  padding: 10px 0px;
  display: flex;
  align-items: center;
}
#icono {
  margin-left: 30px;
  width: 15px;
  height: 15px;
}
#icono img {
  height: 100%;
  opacity: 0.7;
}
</style>