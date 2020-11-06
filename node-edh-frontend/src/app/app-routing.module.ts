import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeckDetailsComponent } from './deck-details/deck-details.component';
import { DecksComponent } from './decks/decks.component';

const routes: Routes = [
  {
    component:DecksComponent,
    path:''
  },
  {
    component:DeckDetailsComponent,
    path:'details/:id'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
