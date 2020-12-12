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

  submitForm(values){
    this.deckCreatorService.createDeck(values);
    this.subscriptions.add(this.deckCreatorService.busy$.pipe(
      filter(x =>{
        return !x
      }),
      tap(x =>{
        this.router.navigate(['details', this.deckCreatorService.data$.value]);
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

}
