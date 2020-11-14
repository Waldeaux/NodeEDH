import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Deck } from './models/decks.model';
import { DecksService } from './services/decks.service';

@Component({
  selector: 'app-decks',
  templateUrl: './decks.component.html',
  styleUrls: ['./decks.component.scss']
})
export class DecksComponent implements OnInit {

  constructor(
    private decksService:DecksService,
    private router:Router
  ) { }

  decks$:Observable<Deck[]>;
  ngOnInit(): void {
    this.decks$ = this.decksService.dataChanges();
    this.decksService.getDecks();
  }

  deckDetails(input:number){
    this.router.navigate(['details', input])
  }
  createNewDeck(){
    this.router.navigate(['deck-creator']);
  }
}
