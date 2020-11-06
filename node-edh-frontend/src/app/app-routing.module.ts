import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeckDetailsComponent } from './deck-details/deck-details.component';
import { DeckEditorComponent } from './deck-editor/deck-editor.component';
import { DeckEditorRoutingService } from './deck-editor/services/deck-editor-routing.service';
import { DecksComponent } from './decks/decks.component';

const routes: Routes = [
  {
    component:DecksComponent,
    path:''
  },
  {
    component:DeckDetailsComponent,
    path:'details/:id'
  },
  {
    component:DeckEditorComponent,
    path:'deck-editor/:id',
    resolve:{
      deck:DeckEditorRoutingService
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
