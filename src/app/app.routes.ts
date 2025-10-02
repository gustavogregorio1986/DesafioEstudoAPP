import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CadastrarComponent } from './pages/cadastrar/cadastrar.component';
import { ConsultarComponent } from './pages/consultar/consultar.component';
import { ListarAtivosComponent } from './pages/listar-ativos/listar-ativos.component';
import { ListarInativosComponent } from './pages/listar-inativos/listar-inativos.component';
import { ListarPendentesComponent } from './pages/listar-pendentes/listar-pendentes.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'cadastro', component: CadastrarComponent},
    {path: 'consulta', component: ConsultarComponent},
    {path: 'listar-ativos', component: ListarAtivosComponent},
    {path: 'listar-inativos', component: ListarInativosComponent},
    {path: 'listar-pedentes', component: ListarPendentesComponent},
];
