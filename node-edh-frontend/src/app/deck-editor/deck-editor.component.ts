import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { Card } from '../deck-details/models/deck-details.model';
import { Deck } from '../decks/models/decks.model';
import { DeckEditorService } from './services/deck-editor.service';

@Component({
  selector: 'app-deck-editor',
  templateUrl: './deck-editor.component.html',
  styleUrls: ['./deck-editor.component.scss']
})
export class DeckEditorComponent implements OnInit, OnDestroy {

  constructor(private deckEditorService:DeckEditorService,
    private formBuilder:FormBuilder,
    private route:ActivatedRoute,
    private router:Router) { }

    loading$:Observable<boolean>;
  deckEditor:FormGroup;
  deckId:number;
  subscriptions = new Subscription();
  ngOnInit(): void {
    this.loading$ = this.deckEditorService.busyChanges();
    this.deckId = this.route.snapshot.params.id;
    this.route.data.subscribe(response =>{
      let deck = response.deck;
      this.deckEditor = this.formBuilder.group({
        "name":deck.name,
        "draft":deck.draft,
        "cards": this.parseApiInput(deck.cards)
      })
    })
    
  }

  ngOnDestroy(){
    this.subscriptions.unsubscribe();
  }

  submitForm(formValues){
    this.deckEditorService.updateDeckDetails(this.deckId, formValues);
    this.subscriptions.add(this.deckEditorService.busy$.pipe(
      filter(x =>{
        return !x
      }),
      tap(x =>{
        this.router.navigate(['details', this.deckId]);
      })
    ).subscribe());
  }

  parseApiInput(input:Card[]):string{
    let result = "";
    input.forEach(x =>{
      result += `${x.count}x ${x.name}\n`;
    })
    return result;
  }

  deleteDeck(){
    this.deckEditorService.deleteDeck(this.deckId);
    this.subscriptions.add(this.deckEditorService.busy$.pipe(
      filter(x =>{
        return !x
      }),
      tap(x =>{
        this.router.navigate(['..']);
      })
    ).subscribe());
  }

}
