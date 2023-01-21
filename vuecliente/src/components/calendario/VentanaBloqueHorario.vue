<template>
  <div class="ventanaBloqueHorario">
    <div id="fondoGris" @click.self.stop="$emit('cerrarme')"></div>
    <div id="laPropiaVentana" :style="[{ backgroundColor: miColor }]">
      <div id="titulo">
        {{ esteBloque.nombreEspacio }}
      </div>

      <div class="seccionListaUsuarios">
        <div class="barraListaUsuarios">
          <div class="nombreListaUsuarios">Coordina</div>
        </div>

        <div class="listaPersonas">
          <icono-persona-autonomo
            :idPersona="esteBloque.idAdministradorEspacio"
          />
        </div>
      </div>

      <div class="seccionListaUsuarios">
        <div class="barraListaUsuarios">
          <div class="nombreListaUsuarios">Asisten</div>
          <div class="contenedorControles">
            <div class="boton">
              <img
                src="@/assets/iconos/join.png"
                alt="Agregar"
                style=""
                @click="iniciarAdicionAsistente"
              />
            </div>
          </div>
        </div>

        <div class="listaPersonas" v-show="!mostrandoBuscadorAsistentes">
          <icono-persona-autonomo
            v-for="idAsistente of idsAsistentes"
            :key="idAsistente"
            :idPersona="idAsistente"
            :seleccionado="idAsistente === idPersonaSeleccionado"
            @click.stop="
              idPersonaSeleccionado =
                idPersonaSeleccionado === idAsistente ? null : idAsistente
            "
          />
        </div>

        <div id="zonaAdicionarAsistente" v-show="mostrandoBuscadorAsistentes">
          <div class="zonaInformacion" style="display: flex">
            <div class="informacion">Adicionando asistentes</div>

            <div class="contenedorControles" style="margin-left: auto;">
                <div class="boton" @click="mostrandoBuscadorAsistentes=false">
                    <img src='@/assets/iconos/equis.svg' alt='Salir' style='' />
                </div>
            </div>
          </div>
          <div id="zonaInputBuscador" style="width: 100%">
            <input
              type="text"
              ref="inputTextoBuscador"
              id="inputTextoBuscador"
              placeholder="buscar"
            />
          </div>
          <div class="listaPersonas">
            <icono-persona-autonomo
              v-for="idAdicionable of idsPersonasAdicionables"
              :key="idAdicionable"
              :idPersona="idAdicionable"
              :seleccionado="idAdicionable === idPersonaSeleccionado"
              @click.stop="
                idPersonaSeleccionado =
                  idPersonaSeleccionado === idAdicionable ? null : idAdicionable
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import IconoPersonaAutonomo from "../usuario/IconoPersonaAutonomo.vue";
export default {
  components: { IconoPersonaAutonomo },
  name: "VentanaBloqueHorario",
  props: {
    esteBloque: Object,
    miColor: String,
  },
  apollo: {
    participantesCasaMaestraVida: {
      query: gql`
        query {
          participantesCasaMaestraVida {
            id
            nombres
            apellidos
          }
        }
      `,
    },
  },
  data() {
    return {
      participantesCasaMaestraVida: [],
      idPersonaSeleccionado: null,
      mostrandoBuscadorAsistentes: false,
    };
  },
  computed: {
    idsAsistentes() {
      return this.esteBloque.idsParticipantesConstantes;
    },
    idsPersonasAdicionables() {
      return this.participantesCasaMaestraVida
        .filter(
          (persona) =>
            !this.esteBloque.idsParticipantesConstantes.includes(persona.id)
        )
        .map((persona) => persona.id);
    },
  },
  methods: {
    iniciarAdicionAsistente() {
      this.mostrandoBuscadorAsistentes = true;
    },
  },
};
</script>

<style scoped>
#fondoGris {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.411);
  top: 0%;
  left: 0%;
  width: 100vw;
  height: 100vh;
}

#laPropiaVentana {
  position: fixed;
  top: 5%;
  left: 50%;
  transform: translate(-50%, -0%);
  width: min(700px, 95%);
  min-height: 400px;
  max-height: 90%;
  overflow-y: scroll;
  z-index: 1;
  background-color: rgb(197, 197, 197);
}

#titulo {
  padding: 20px 20px;
  text-align: center;
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
}

.barraListaUsuarios {
  background-color: rgb(100, 100, 100);
  padding: 10px 10px;
  display: flex;
  align-items: center;
}

.barraListaUsuarios .contenedorControles {
  margin-left: auto;
}

.listaPersonas {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  padding: 20px 20px;
  margin-bottom: 20px;
}

.zonaInformacion{
    display: flex;
    align-items: center;
    padding: 10px 10px;

}

#inputTextoBuscador{
    display: block;
    margin: 10px auto;
    font-size: 20px;
    padding: 5px 10px;
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0.267);
}
</style>