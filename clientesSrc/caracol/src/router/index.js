import { createRouter, createWebHistory } from 'vue-router'
import { apolloClient } from '../apollo'
import { QUERY_AUTH_USUARIO } from '../globalMixin'

import atlasConocimiento from '../components/atlasConocimiento/AtlasConocimiento.vue'
import adminNodosConocimiento from '../components/atlasConocimiento/adminNodosConocimiento.vue'
import VisorNodoConocimiento from '../components/visorNodoConocimiento/VisorNodoConocimiento.vue'
import VentanaRepasos from '../components/atlasConocimiento/VentanaRepasos.vue'
import RutaGrado from '../components/usuario/RutaGrado.vue'
import loginArea from '../components/LoginArea.vue'
import perfilPersonal from '../components/usuario/PerfilPersonal.vue'
import ForosGenerales from '../components/ForosGenerales.vue'
import Registro from '../components/Registro.vue'
import Personas from '../components/Personas.vue'
import Espacios from '../components/Espacios.vue'
import VentanaEventoPublico from '../components/utilidades/VentanaEventoPublico.vue'
import VentanaEventoPersonal from '../components/utilidades/VentanaEventoPersonal.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    {
      path: "/atlas", name: "atlas", component: atlasConocimiento, children: [
        {
          path: "nodoConocimiento/:idNodo",
          component: VisorNodoConocimiento,
          name: "visorNodoConocimiento"
        },
        {
          path: "repasos",
          component: VentanaRepasos,
          name: "ventanaRepasos"
        }
      ]
    },
    {
      path: "/rutaGrado/:idUsuario", name: "rutaGrado", component: RutaGrado, props: true
    },
    { path: "/adminNodosConocimiento", name: "adminNodosConocimiento", component: adminNodosConocimiento },
    {
      path: "/login", name: "loginArea",
      component: loginArea,
    },
    {
      path: "/miperfil",
      name: "perfilPersonal",
      component: perfilPersonal,
      children: [
        {
          path: "ventanaEventoPublico/:idEvento",
          component: VentanaEventoPublico,
          name: "VentanaEventoPublico",
        },
        {
          path: "ventanaEventoPersonal/:idEvento",
          component: VentanaEventoPersonal,
          name: "VentanaEventoPersonal",
        }
      ]
    },    
    // { path: "/foros", component: ForosGenerales },
    { path: "/nodoConocimiento/:idNodo", component: VisorNodoConocimiento },
    { path: "/registro", name: "registro", component: Registro },
    // {
    //     path: "/actividadesVirtuales2021", component: ActividadesEstudiantiles, children: [
    //         {
    //             path: 'grupoEstudiantil/:idGrupo',
    //             component: ActividadesDeGrupo,
    //             name: "ActividadesDeGrupo"
    //         },
    //         {
    //             path: 'actividadesProfes/:idProfe',
    //             component: ActividadesDeProfe,
    //             name: "ActividadesDeProfe"
    //         },
    //         {
    //             path: "",
    //             component: PortadaActividadesEstudiantiles
    //         }
    //     ]
    // },
    // { path: "/actividad/:idActividad", name: "actividadEspecifica", component: ActividadEspecifica },
    {
      path: "/personas", name: "personas", component: Personas,
      children: [
        {
          path: "ventanaEventoPublico/:idEvento",
          component: VentanaEventoPublico,
          name: "VentanaEventoPublico",
        },
        {
          path: "ventanaEventoPersonal/:idEvento",
          component: VentanaEventoPersonal,
          name: "VentanaEventoPersonal",
        }
      ]
    },
    {
      path: "/espacios", name: "espacios", component: Espacios, children: [
        {
          path: "ventanaEventoPublico/:idEvento",
          component: VentanaEventoPublico,
          name: "VentanaEventoPublico",
        },
        {
          path: "ventanaEventoPersonal/:idEvento",
          component: VentanaEventoPersonal,
          name: "VentanaEventoPersonal",
        }
      ]
    },
    {
      path: "/", redirect() {
        console.log(`Redirecting`);
        if (!localStorage.getItem("token")) {
          return "/login"
        }
        return "/miPerfil"
      }
    },
    { path: "/:catchAll(.*)", redirect() { return "/" } },  
  ]
})


router.beforeEach(async (to, from) => {
  if (!apolloClient) {
      return false;
  }

  let datosUsuario = apolloClient.readQuery({
      query: QUERY_AUTH_USUARIO
  });
 

  if (!datosUsuario?.auth_usuario?.id && to.name != 'loginArea') {
      return { name: "loginArea" }
  }
})
export default router
