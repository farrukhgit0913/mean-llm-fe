import {
  Routes
} from '@angular/router';

import {
  ChatComponent
} from './features/chat/chat.component';

export const routes: Routes = [

  {
    path: '',
    component: ChatComponent
  },

  {
    path: '**',
    redirectTo: ''
  }

];import { Routes } from '@angular/router';

export const routes: Routes = [];
