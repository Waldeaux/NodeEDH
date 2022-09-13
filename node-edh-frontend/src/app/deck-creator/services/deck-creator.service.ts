import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeckCreatorService {

  constructor(private http:HttpClient) { }

  data$ = new BehaviorSubject<number>(null);
  busy$ = new BehaviorSubject<boolean>(false);
  success$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string>("");

  busyChanges():Observable<boolean>{
    return this.busy$.asObservable();
  }

  successChanges():Observable<boolean>{
    return this.success$.asObservable();
  }

  errorChanges():Observable<string>{
    return this.error$.asObservable();
  }

  createDeck(body){
    this.busy$.next(true);
    this.http.post<number>(`http://tutorials-env.eba-q5ybfhgp.us-east-1.elasticbeanstalk.com/decks`, body).pipe(
      tap(x=>{
        this.data$.next(x);
        this.success$.next(true);
      }),
      catchError(x =>{
        this.error$.next(x.error);
        this.success$.next(false);
        return of(null)
      }),
      finalize(() =>{
        this.busy$.next(false);
      })
    ).subscribe();
  }
}
