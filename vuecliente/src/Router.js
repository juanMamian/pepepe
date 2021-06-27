import Vue from "vue"
import Router from "vue-router"
import atlasConocimiento from "./components/AtlasConocimiento.vue"
import loginArea from "./components/LoginArea.vue"
import perfilPersonal from "./components/PerfilPersonal.vue"
import VisorNodoConocimiento from "./components/VisorNodoConocimiento.vue"
import Proyectos from "./components/Proyectos.vue"
import Proyecto from "./components/Proyecto.vue"
import Registro from "./components/Registro.vue"
import ActividadesEstudiantiles from "./components/ActividadesEstudiantiles.vue"
import Personas from "./components/Personas.vue"
import ActividadesDeGrupo from "./components/actividadesProfes/ActividadesDeGrupo.vue"
import ActividadesDeProfe from "./components/actividadesProfes/ActividadesDeProfe.vue"
import store from "./store/index"
import PortadaActividadesEstudiantiles from "./components/actividadesProfes/PortadaActividadesEstudiantiles";
import ActividadEspecifica from "./components/actividadesProfes/ActividadEspecifica"
import Home from "./components/Home"
import Trabajo from "./components/Trabajo"
import BuscadorTrabajos from "./components/BuscadorTrabajos"
import TodosMateriales from "./components/TodosMateriales"
import ForosGenerales from "./components/ForosGenerales"
import AtlasProyectos from "./components/diagramaTotalTrabajos/AtlasProyectos"

Vue.use(Router);

const routes = [
    {path: "/home", name:"home", component: Home},
    { path: "/atlas", name: "atlas", component: atlasConocimiento },
    {
        path: "/login", name: "loginArea",
        component: loginArea,
        beforeEnter: function (to, from, next) {
            if (store.state.usuario.id != null) {
                next("/miperfil");
            }
            else {
                next();
            }
        }

    },
    {
        path: "/miperfil",
        name: "perfilPersonal",
        component: perfilPersonal, 
        beforeEnter: function (to, from, next) {
            if (store.state.usuario.id != null) {
                next();
            }
            else {
                next("/login");
            }
        }
    },
    { path: "/atlasProyectos", component: AtlasProyectos },
    { path: "/trabajos", component: BuscadorTrabajos },
    { path: "/foros", component: ForosGenerales },
    { path: "/materiales", component: TodosMateriales },
    { path: "/nodoConocimiento/:idNodo", component: VisorNodoConocimiento },
    { path: "/proyectos", name: "proyectos", component: Proyectos },
    { path: "/proyecto/:idProyecto", name: "verProyecto", component: Proyecto },
    { path: "/trabajo/:idTrabajo", name: "verTrabajo", component: Trabajo },
    { path: "/registro", name: "registro", component: Registro },
    {
        path: "/actividadesVirtuales2021", component: ActividadesEstudiantiles, children: [
            {
                path: 'grupoEstudiantil/:idGrupo',
                component: ActividadesDeGrupo,
                name: "ActividadesDeGrupo"
            },
            {
                path: 'actividadesProfes/:idProfe',
                component: ActividadesDeProfe,
                name: "ActividadesDeProfe"
            },
            {
                path:"",
                component: PortadaActividadesEstudiantiles
            }
        ]
    },    
    {path: "/actividad/:idActividad", name:"actividadEspecifica", component: ActividadEspecifica},    
    { path: "/personas", name: "personas", component: Personas },
    { path: "/", redirect: "/home" }
];

export const router = new Router({
    routes
});
