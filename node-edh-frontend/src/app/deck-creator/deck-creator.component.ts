import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { Card } from '../deck-details/models/deck-details.model';
import { DeckEditorService } from '../deck-editor/services/deck-editor.service';
import { DeckCreatorService } from './services/deck-creator.service';

@Component({
  selector: 'app-deck-creator',
  templateUrl: './deck-creator.component.html',
  styleUrls: ['./deck-creator.component.scss']
})
export class DeckCreatorComponent implements OnInit {

  constructor(private deckCreatorService:DeckCreatorService,
    private formBuilder:FormBuilder,
    private router:Router) { }

    loading$:Observable<boolean>;
  deckEditor:FormGroup;
  subscriptions = new Subscription();
  ngOnInit(): void {
    this.loading$ = this.deckCreatorService.busyChanges();
    
    this.deckEditor = this.formBuilder.group({
      "name":'',
      "cards": ''
    })
  }

  ngOnDestroy(){
    this.subscriptions.unsubscribe();
  }

  submitForm(){
    this.deckCreatorService.createDeck(this.parseFormInput());
    this.subscriptions.add(this.deckCreatorService.busy$.pipe(
      filter(x =>{
        return !x
      }),
      tap(x =>{
        this.router.navigate(['details', this.deckCreatorService.data$.value]);
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
