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

@NgModule({
  declarations: [
    AppComponent,
    DecksComponent,
    DeckDetailsComponent,
    DeckEditorComponent,
    DeckEditorFormComponent,
    DeckCreatorComponent
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
