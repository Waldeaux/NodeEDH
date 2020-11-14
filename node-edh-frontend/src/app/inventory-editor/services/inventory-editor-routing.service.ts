import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { filter, switchMap, take } from 'rxjs/operators';
import { InventoryEditorService } from './inventory-editor.service';

@Injectable({
    providedIn:'root'
})
export class InventoryEditorRoutingService{
    constructor(private inventoryEditorService: InventoryEditorService){}

  resolve(route:ActivatedRouteSnapshot,
    state:RouterStateSnapshot){
     this.inventoryEditorService.fetch();
     return this.inventoryEditorService.onBusyChanges().pipe(
       filter(x =>{
         return !x
       }),
       switchMap(x =>{
         return this.inventoryEditorService.onDataChanges();
       }),
       take(1)
     );
 }
}