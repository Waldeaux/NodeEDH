import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NeededCardsForDeckService } from './services/needed-cards-for-deck.service';

export interface CardComparisons{
  dcCount:number;
  iCount:number;
  name:number;
}
@Component({
  selector: 'app-needed-cards-for-deck',
  templateUrl: './needed-cards-for-deck.component.html',
  styleUrls: ['./needed-cards-for-deck.component.scss']
})
export class NeededCardsForDeckComponent implements OnInit {

  deckDetails$:Observable<CardComparisons[]>;
  loading$: Observable<boolean>;

  constructor(private neededCardsService:NeededCardsForDeckService) { }

  ngOnInit(): void {
    this.loading$ = this.neededCardsService.onBusyChanges();
    this.deckDetails$ = this.neededCardsService.onDataChanges();
  }

}
