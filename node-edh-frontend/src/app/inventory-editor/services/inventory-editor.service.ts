import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

export interface InventoryCard{
  name:string;
  count:number;
}
@Injectable({
  providedIn: 'root'
})
export class InventoryEditorService {

  data$ = new BehaviorSubject<InventoryCard[]>(null);
  busy$ = new BehaviorSubject<boolean>(false);
  constructor(private http:HttpClient) { }

  onDataChanges():Observable<InventoryCard[]>{
    return this.data$.asObservable();
  }

  onBusyChanges():Observable<boolean>{
    return this.busy$.asObservable();
  }

  fetch(){
    this.busy$.next(true);
    this.http.get<InventoryCard[]>(`http://localhost:8081/inventory`).pipe(
      tap(x =>{
        this.data$.next(x);
      }),
      finalize(() =>{
        this.busy$.next(false);
      })
    ).subscribe();
  }

  updateInventory(inventory){
    this.busy$.next(true);
    this.http.put(`http://localhost:8081/inventory`,inventory).pipe(
      finalize(() =>{
        this.busy$.next(false);
      })
    ).subscribe();
  }
}
