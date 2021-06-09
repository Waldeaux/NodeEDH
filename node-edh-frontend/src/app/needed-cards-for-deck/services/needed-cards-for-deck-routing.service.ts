import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { filter, switchMap, take } from 'rxjs/operators';
import { DeckDetailsService } from 'src/app/deck-details/services/deck-details.service';
import { NeededCardsForDeckService } from './needed-cards-for-deck.service';

@Injectable({
  providedIn: 'root'
})
export class NeededCardsForDeckRoutingService {

  constructor(private neededCardsForDeck:NeededCardsForDeckService) { }

  resolve(route:ActivatedRouteSnapshot,
     state:RouterStateSnapshot){
      this.neededCardsForDeck.fetch(route.params.id);
      return this.neededCardsForDeck.onBusyChanges().pipe(
        filter(x =>{
          return !x
        }),
        switchMap(x =>{
          return this.neededCardsForDeck.onDataChanges();
        }),
        take(1)
      );
  }
}
