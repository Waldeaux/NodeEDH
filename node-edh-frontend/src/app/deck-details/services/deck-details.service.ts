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

  getDeckDetailsTest(){
    this.deckDetails$.next({
      name:"estrid",
      cards:[
        {
          name:"Estrid the Masked",
          count:1
        }
      ]
    })
  }
  getDeckDetails(id:number){
    this.http.get<DeckDetails>('http://localhost:8081/decks').pipe(
      tap(x =>{
        this.deckDetails$.next(x);
      })
    ).subscribe();
  }
}
