import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeckEditorService {

  constructor(private http:HttpClient) { }

  busy$ = new BehaviorSubject<boolean>(false);

  busyChanges():Observable<boolean>{
    return this.busy$.asObservable();
  }
  updateDeckDetails(id, body){
    this.busy$.next(true);
    this.http.put(`http://localhost:8081/decks/${id}`, body).pipe(
      tap(x=>{
        console.log(x);
      }),
      finalize(() =>{
        this.busy$.next(false);
      })
    ).subscribe();
  }

  deleteDeck(id){
    this.busy$.next(true);
    this.http.delete(`http://localhost:8081/decks/${id}`).pipe(
      tap(x=>{
        this.busy$.next(false);
      })
    ).subscribe();
  }
}
