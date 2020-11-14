import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NeededCardsService } from './services/needed-cards.service';

export interface CardComparisons{
  dcCount:number;
  iCount:number;
  name:number;
}
@Component({
  selector: 'app-needed-cards',
  templateUrl: './needed-cards.component.html',
  styleUrls: ['./needed-cards.component.scss']
})
export class NeededCardsComponent implements OnInit {

  deckDetails$:Observable<CardComparisons[]>;
  loading$: Observable<boolean>;

  constructor(private neededCardsService:NeededCardsService) { }

  ngOnInit(): void {
    this.loading$ = this.neededCardsService.onBusyChanges();
    this.deckDetails$ = this.neededCardsService.onDataChanges();
    this.neededCardsService.fetch();
  }

}
