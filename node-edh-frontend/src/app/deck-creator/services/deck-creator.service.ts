import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeckCreatorService {

  constructor(private http:HttpClient) { }

  data$ = new BehaviorSubject<number>(null);
  busy$ = new BehaviorSubject<boolean>(false);

  busyChanges():Observable<boolean>{
    return this.busy$.asObservable();
  }
  createDeck(body){
    this.busy$.next(true);
    this.http.post<number>(`http://localhost:8081/decks`, body).pipe(
      tap(x=>{
        this.data$.next(x);
        this.busy$.next(false);
      })
    ).subscribe();
  }
}
