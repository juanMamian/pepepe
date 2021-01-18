<template>
  <div class="actividadesProfes">
    <div id="vistaProfe">
      <div id="barraGrupos" class="barraSeleccion">
        <div
          class="selectoresActividadesByGrupo paraProfes"
          v-if="usuarioProfe"
        >
          <div class="categoriaSelectores">Grupos</div>
          <div
            class="selectorGrupoEstudiantil selectorBarra"
            :class="{
              selectorSeleccionado: idGrupoEstudiantilSeleccionado == grupo.id,
            }"
            :key="grupo.id"
            v-for="grupo of gruposEstudiantiles"
            @click="
              abrirGrupoEstudiantil(grupo.id);
              idGrupoEstudiantilSeleccionado = grupo.id;
            "
          >
            {{ grupo.nombre }}
          </div>
        </div>
        <div class="selectoresActividadesByProfe paraEstudiantes">
                    <div class="categoriaSelectores">Profes</div>

          <div
            class="selectorActividadesProfe selectorBarra"
            :key="profe.id"
            v-for="profe of profes"
            :class="{
              selectorSeleccionado: idProfeSeleccionado == profe.id,
            }"
            @click="
              abrirActividadesProfe(profe.id);
              idProfeSeleccionado = profe.id;
            "
          >
            {{ profe.nombres }}
          </div>
        </div>
      </div>

      <router-view> </router-view>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import { fragmentoResponsables } from "./utilidades/recursosGql";

export default {
  name: "ActividadesProfe",
  apollo: {
    gruposEstudiantiles: {
      query: gql`
        query {
          gruposEstudiantiles {
            id
            nombre
          }
        }
      `,
      update: function ({ gruposEstudiantiles }) {
        console.log(`Respuesta. ${JSON.stringify(gruposEstudiantiles)}`);
        return gruposEstudiantiles;
      },
    },
    profes: {
      query: gql`
        query {
          usuariosProfe {
            ...fragResponsables
          }
        }
        ${fragmentoResponsables}
      `,
      update: function ({ usuariosProfe }) {
        return usuariosProfe;
      },
    },
  },
  data() {
    return {
      gruposEstudiantiles: [],
      idGrupoEstudiantilSeleccionado: null,
      idProfeSeleccionado:null
    };
  },
  computed: {
    usuarioProfe: function () {
      if (!this.$store.state.usuario.permisos) return false;
      return this.$store.state.usuario.permisos.includes(
        "actividadesProfes-profe"
      );
    },
  },
  methods: {
    abrirGrupoEstudiantil(id) {
      this.$router.push("/actividadesVirtuales2021/grupoEstudiantil/" + id);
    },
    abrirActividadesProfe(id) {
      this.$router.push("/actividadesVirtuales2021/actividadesProfes/" + id);
    },
  },
};
</script>

<style scoped>
#vistaProfe {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 150px 1fr;
}

#barraGrupos {
  grid-column: 1/2;
  background-color: burlywood;
}
.selectorBarra {
  font-size: 18px;
  padding: 10px 10px;
  cursor: pointer;
}
.selectorSeleccionado {
  background-color: cornsilk;
}
.selectorBarra:hover {
  background-color: cornsilk;
}

#contenidosGrupos {
  padding: 10px 30px;
}

#contenidoGrupo {
  grid-column: 2/3;
}
.categoriaSelectores{
  padding: 20px 10px;
  font-weight: bold;
  text-align: center;
}
</style>