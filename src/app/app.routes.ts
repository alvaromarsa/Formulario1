import { Routes } from '@angular/router';
import { Form1Component } from './components/form1.component/form1.component';
import { DataClient } from './components/dataClient/dataClient';

export const routes: Routes = [

  { path: '',
    component: Form1Component,
    title: 'Formulario'
  },
  {
    path: 'clientes',
    component: DataClient,
    title: 'Datos de Clientes'
  },
];
