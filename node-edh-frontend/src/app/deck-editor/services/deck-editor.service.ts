import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
        this.busy$.next(false);
      })
    ).subscribe();
  }
}
