import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DecksComponent } from './decks/decks.component';
import { DeckDetailsComponent } from './deck-details/deck-details.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { DeckEditorComponent } from './deck-editor/deck-editor.component';
import { ActivatedRouteSnapshot, RouterModule } from '@angular/router';
import { DeckEditorFormComponent } from './shared/deck-editor-form/deck-editor-form.component';
import { DeckCreatorComponent } from './deck-creator/deck-creator.component';
import { InventoryEditorComponent } from './inventory-editor/inventory-editor.component';
import { NeededCardsComponent } from './needed-cards/needed-cards.component';
import { CardDetailsComponent } from './card-details/card-details.component';
import { NeededCardsForDeckComponent } from './needed-cards-for-deck/needed-cards-for-deck.component';

@NgModule({
  declarations: [
    AppComponent,
    DecksComponent,
    DeckDetailsComponent,
    DeckEditorComponent,
    DeckEditorFormComponent,
    DeckCreatorComponent,
    InventoryEditorComponent,
    NeededCardsComponent,
    CardDetailsComponent,
    NeededCardsForDeckComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }
