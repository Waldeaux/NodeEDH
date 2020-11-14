import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeckCreatorComponent } from './deck-creator/deck-creator.component';
import { DeckDetailsComponent } from './deck-details/deck-details.component';
import { DeckEditorComponent } from './deck-editor/deck-editor.component';
import { DeckEditorRoutingService } from './deck-editor/services/deck-editor-routing.service';
import { DecksComponent } from './decks/decks.component';
import { InventoryEditorComponent } from './inventory-editor/inventory-editor.component';
import { InventoryEditorRoutingService } from './inventory-editor/services/inventory-editor-routing.service';
import { InventoryEditorService } from './inventory-editor/services/inventory-editor.service';

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
  },
  {
    component:DeckCreatorComponent,
    path:'deck-creator'
  },
  {
    component:InventoryEditorComponent,
    path:'inventory-editor',
    resolve:{
      inventory:InventoryEditorRoutingService
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
