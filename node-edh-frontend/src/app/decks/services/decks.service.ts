import { Injectable } from '@angular/core';
import {HttpClient} from'@angular/common/http';
import { Deck } from '../models/decks.model';
import { BehaviorSubject, Observable } from 'rxjs';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DecksService {

  constructor(private http:HttpClient) { }

  data$ = new BehaviorSubject<Deck[]>([]);

  dataChanges():Observable<Deck[]>{
    return this.data$.asObservable();
  }
  getDecks(){
    this.http.get<Deck[]>('http://tutorials-env.eba-q5ybfhgp.us-east-1.elasticbeanstalk.com/decks').pipe(
      tap(x =>{
        this.data$.next(x);
      })
    ).subscribe();
  }
}
