<template>
  <div class="actividadesProfes">
    <div id="layout">
      <div id="barraGrupos" class="barraSeleccion">
        <div
          class="selectoresActividadesByGrupo paraProfes"
          v-if="
            usuarioProfe ||
            usuario.permisos.includes(
              'actividadesEstudiantiles-guia'
            )
          "
        >
          <div class="categoriaSelectores">Grupos</div>
          <loading
            v-show="cargandoGruposEstudiantiles"
            texto="Cargando grupos..."
          />
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
            <div id="alertasGrupo">
              
            </div>
          </div>
        </div>
        <div
          class="selectoresActividadesByProfe paraEstudiantes"
          v-if="usuarioLogeado"
        >
          <div class="categoriaSelectores">Profes</div>
          <loading v-show="cargandoProfes" texto="Cargando profes..." />
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

      <router-view :key="$route.fullPath"> </router-view>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import { fragmentoResponsables } from "./utilidades/recursosGql";
import Loading from "./utilidades/Loading.vue";

export default {
  components: { Loading },
  name: "ActividadesEstudiantiles",
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
        this.cargandoGruposEstudiantiles = false;
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
        this.cargandoProfes = false;
        return usuariosProfe;
      },
    },
  },
  data() {
    return {
      gruposEstudiantiles: [],
      idGrupoEstudiantilSeleccionado: null,
      idProfeSeleccionado: null,
      outletDeshabilitado: false,
      cargandoGruposEstudiantiles: true,
      cargandoProfes: true,
    };
  },
  computed: {
    usuarioProfe: function () {
      if (!this.usuario.permisos) return false;
      return this.usuario.permisos.includes(
        "actividadesEstudiantiles-profe"
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
    navegacionCompleta() {
      console.log(`Navacion completada`);
    },
  },
};
</script>

<style scoped>
#layout {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 170px 1fr;
}

#barraGrupos {
  grid-column: 1/2;
  background-color: burlywood;
}
.selectorBarra {
  font-size: 21px;
  padding: 10px 10px;
  cursor: pointer;
}
.selectorSeleccionado {
  background-color: whitesmoke;
}
.selectorBarra:hover {
  background-color: whitesmoke;
}

.grupoEstudiantil {
  background-color: whitesmoke;
}

#contenidoGrupo {
  grid-column: 2/3;
}
.categoriaSelectores {
  padding: 20px 10px;
  font-weight: bold;
  text-align: center;
}
.alertas {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
}
</style>