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
  busy$ = new BehaviorSubject<boolean>(false);

  dataChanges():Observable<DeckDetails>{
    return this.deckDetails$.asObservable();
  }

  busyChanges():Observable<boolean>{
    return this.busy$.asObservable();
  }

  getDeckDetails(id:number){
    this.busy$.next(true);
    this.deckDetailsApiCall(id).pipe(
      tap(x =>{
        this.deckDetails$.next(x);
        this.busy$.next(false);
      })
    ).subscribe();
  }

  deckDetailsApiCall(id:number):Observable<DeckDetails>{
    return this.http.get<DeckDetails>(`http://tutorials-env.eba-q5ybfhgp.us-east-1.elasticbeanstalk.com/decks/${id}`);
  }
}
