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
import GrupoEstudiantil from "./components/actividadesProfes/GrupoEstudiantil.vue"
import ActividadesDeProfe from "./components/actividadesProfes/ActividadesDeProfe.vue"

Vue.use(Router);

const routes=[
    {path:"/atlas", name:"atlas", component:atlasConocimiento},
    {path:"/login", name:"loginArea", component: loginArea},
    {path:"/miperfil", name:"perfilPersonal", component: perfilPersonal},
    {path:"/nodoConocimiento/:idNodo", component: VisorNodoConocimiento},
    {path:"/proyectos", name:"proyectos", component: Proyectos },
    {path:"/proyecto/:idProyecto", name:"verProyecto", component: Proyecto},
    {path:"/registro", name:"registro", component: Registro},
    {path:"/actividadesVirtuales2021", component: ActividadesEstudiantiles, children:[
        {
            path:'grupoEstudiantil/:idGrupo',
            component: GrupoEstudiantil
        },
        {
            path:'actividadesProfes/:idProfe',
            component: ActividadesDeProfe
        }
    ]},
    {path:"/personas", name:"personas", component: Personas}
];

export const router=new Router({
    routes
});
