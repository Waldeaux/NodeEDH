import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { CardComparisons } from '../needed-cards-for-deck.component';

@Injectable({
  providedIn: 'root'
})
export class NeededCardsForDeckService {

  data$ = new BehaviorSubject<CardComparisons[]>(null);
  busy$ = new BehaviorSubject<boolean>(false);
  constructor(private http:HttpClient) { }

  onDataChanges():Observable<CardComparisons[]>{
    return this.data$.asObservable();
  }

  onBusyChanges():Observable<boolean>{
    return this.busy$.asObservable();
  }

  fetch(id){
    console.log(id);
    this.busy$.next(true);
    this.http.get<CardComparisons[]>(`http://tutorials-env.eba-q5ybfhgp.us-east-1.elasticbeanstalk.com/inventory/comparison/${id}`).pipe(
      tap(x =>{
        this.data$.next(x);
      }),
      finalize(() =>{
        this.busy$.next(false);
      })
    ).subscribe();
  }

}
