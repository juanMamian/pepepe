<template>
  <div class="landing">
    <div id="bloquePortada">
      <div id="contenedorImagen">
        <img src="@/assets/landing/caracol.png" alt="Caracol" />
      </div>
      <div id="contenedorCabecera">
        <div id="titulo">La estrategia del caracol</div>
        <div id="subtitulo">Plataforma de aprendizaje.</div>
      </div>
    </div>


    <router-view @logearse="$emit('logearse', $event)">

    </router-view>
    <div id="bloqueInfoUsuario" v-if="usuarioLogeado">
      <div id="bloquePersonal">
        <div id="contenedorFotoUsuario">
          <img
            :src="
              serverUrl +
              '/api/usuarios/fotografias/' +
              usuario.id +
              '?v=' +
              versionFoto
            "
            alt="Fotografía"
          />
        </div>
        
      </div>
      <div id="bloqueDatosUsuario">

        <div id="nombreUsuario">{{ yo.nombres + ' ' + yo.apellidos }}</div>
        
      </div>
    </div>
    
  </div>
</template>
<script>
import {gql} from "@apollo/client/core"
export default {
  name: "Landing",
  apollo:{
    yo:{
      query: gql`
        query{
          yo{
            nombres
            apellidos
          }
        }  
      `,
      fetchPolicy:"cache-first",
      skip(){
        return !this.usuarioLogeado;
      }
    }
  },
  data() {
    return {
      yo:{},
      versionFoto:0,
    };
  },
};
</script>
<style scoped>
.landing{
    padding: 6vh 8vw;
    
}
#bloquePortada {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}
#contenedorImagen {
  width: 46vw;
  flex-shrink: 0;
}
#contenedorImagen img {
  width: 100%;
}
#contenedorCabecera {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
#titulo {
  font-size:1.3em;
}
#subtitulo {
  font-size: 0.6em;
  font-style: normal;
}
#bloqueInfoUsuario{
  display: flex;
  margin: 90px auto;
  gap: 8vw;
}
#bloquePersonal{

  width: 50%;
}
#contenedorFotoUsuario{
  width: 50%;
  margin: 0px auto;
  overflow: hidden;
  border-radius: 50%;
}

#contenedorFotoUsuario img{
  width: 100%;
}
#bloqueDatosUsuario{

  display: flex;
  flex-direction: column;
  align-items: center;
  gap:20px;
}
#nombreUsuario{
  text-align:center;
  font-size:0.7em;
}
#contenedorPerksUsuario{
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content:center;
}
</style>
