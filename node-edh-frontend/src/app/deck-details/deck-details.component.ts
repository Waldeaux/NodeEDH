import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DeckDetails } from './models/deck-details.model';
import { DeckDetailsService } from './services/deck-details.service';

@Component({
  selector: 'app-deck-details',
  templateUrl: './deck-details.component.html',
  styleUrls: ['./deck-details.component.scss']
})
export class DeckDetailsComponent implements OnInit {

  constructor(private deckDetailsService:DeckDetailsService) { }

  deckDetails$:Observable<DeckDetails>;
  ngOnInit(): void {
    this.deckDetails$ = this.deckDetailsService.dataChanges();
    this.deckDetailsService.getDeckDetailsTest();
  }

}
