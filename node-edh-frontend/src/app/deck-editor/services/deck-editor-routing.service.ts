import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { filter, switchMap, take } from 'rxjs/operators';
import { DeckDetailsService } from 'src/app/deck-details/services/deck-details.service';

@Injectable({
  providedIn: 'root'
})
export class DeckEditorRoutingService {

  constructor(private deckDetailsService:DeckDetailsService) { }

  resolve(route:ActivatedRouteSnapshot,
     state:RouterStateSnapshot){
      this.deckDetailsService.getDeckDetails(route.params.id);
      return this.deckDetailsService.busyChanges().pipe(
        filter(x =>{
          return !x
        }),
        switchMap(x =>{
          return this.deckDetailsService.dataChanges();
        }),
        take(1)
      );
  }
}
