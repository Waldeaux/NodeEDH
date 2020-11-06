import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DeckDetails } from '../models/deck-details.model';

@Injectable({
  providedIn: 'root'
})
export class DeckDetailsService {

  constructor(private http:HttpClient) { }
  deckDetails$ = new BehaviorSubject<DeckDetails>(null);

  dataChanges():Observable<DeckDetails>{
    return this.deckDetails$.asObservable();
  }

  getDeckDetails(id:number){
    this.http.get<DeckDetails>(`http://localhost:8081/decks/${id}`).pipe(
      tap(x =>{
        this.deckDetails$.next(x);
      })
    ).subscribe();
  }
}
