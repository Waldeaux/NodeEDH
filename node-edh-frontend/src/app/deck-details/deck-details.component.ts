import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { DeckDetails } from './models/deck-details.model';
import { DeckDetailsService } from './services/deck-details.service';

@Component({
  selector: 'app-deck-details',
  templateUrl: './deck-details.component.html',
  styleUrls: ['./deck-details.component.scss']
})
export class DeckDetailsComponent implements OnInit {

  constructor(private deckDetailsService:DeckDetailsService,
    private router:ActivatedRoute) { }

  deckDetails$:Observable<DeckDetails>;
  ngOnInit(): void {
    let id = Number.parseInt(this.router.snapshot.paramMap.get('id'));
    this.deckDetails$ = this.deckDetailsService.dataChanges();
    this.deckDetailsService.getDeckDetails(id);
  }

}
