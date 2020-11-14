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
        "cards": this.parseApiInput(deck.cards)
      })
    })
    
  }

  ngOnDestroy(){
    this.subscriptions.unsubscribe();
  }

  submitForm(){
    this.deckEditorService.updateDeckDetails(this.deckId, this.parseFormInput());
    this.subscriptions.add(this.deckEditorService.busy$.pipe(
      filter(x =>{
        return !x
      }),
      tap(x =>{
        this.router.navigate(['details', this.deckId]);
      })
    ).subscribe());
  }

  parseFormInput(){
    let cards = [];
    let formValues = this.deckEditor.get('cards').value.split('\n');
    let resultObject = {};
    formValues.forEach(x =>{
      let lineSplit = x.split(' ');
      if(!lineSplit[1]){
        return;
      }
      const cardText = lineSplit.slice(1, lineSplit.length).join().replace(/,/g, ' ').toUpperCase();
      if(!resultObject[cardText]){
        resultObject[cardText] = 0;
      }
      const cardCount = Number.parseInt(lineSplit[0].replace(/a-zA-Z/g, ''));
      resultObject[cardText] += cardCount;
    })
    Object.keys(resultObject).forEach(x =>{
      cards.push({cardText:x, count:resultObject[x]});
    })
    let result = {cards,
    name:this.deckEditor.get('name').value};
    return result;
  }

  parseApiInput(input:Card[]):string{
    let result = "";
    input.forEach(x =>{
      result += `${x.count}x ${x.name}\n`;
    })
    return result;
  }

}
