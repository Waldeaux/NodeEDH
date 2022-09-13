import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CardDetails } from '../models/card-details.model';

@Injectable({
  providedIn: 'root'
})
export class CardDetailsService {
  cardDetails$ = new BehaviorSubject<CardDetails>(null);
  busy$ = new BehaviorSubject<boolean>(false);

  dataChanges():Observable<CardDetails>{
    return this.cardDetails$.asObservable();
  }

  busyChanges():Observable<boolean>{
    return this.busy$.asObservable();
  }

  getCardDetails(id:number){
    this.busy$.next(true);
    this.cardDetailsApiCall(id).pipe(
      tap(x =>{
        this.cardDetails$.next(x);
        this.busy$.next(false);
      })
    ).subscribe();
  }

  cardDetailsApiCall(id:number):Observable<CardDetails>{
    return this.http.get<CardDetails>(`http://tutorials-env.eba-q5ybfhgp.us-east-1.elasticbeanstalk.com/cards/${id}`);
  }
  constructor(
    private http:HttpClient
  ) {
  }
}
