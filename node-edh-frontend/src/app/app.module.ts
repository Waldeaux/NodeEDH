import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DecksComponent } from './decks/decks.component';
import { DeckDetailsComponent } from './deck-details/deck-details.component';

@NgModule({
  declarations: [
    AppComponent,
    DecksComponent,
    DeckDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
