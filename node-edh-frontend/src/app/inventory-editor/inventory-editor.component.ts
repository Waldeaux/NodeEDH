import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { InventoryCard, InventoryEditorService } from './services/inventory-editor.service';

@Component({
  selector: 'app-inventory-editor',
  templateUrl: './inventory-editor.component.html',
  styleUrls: ['./inventory-editor.component.scss']
})
export class InventoryEditorComponent implements OnInit, OnDestroy {

  subscriptions = new Subscription();
  form:FormGroup;
  loading$:Observable<boolean>;
  constructor(private fb: FormBuilder,
    private route:ActivatedRoute,
    private router:Router,
    private inventoryEditorService:InventoryEditorService) { 
    this.loading$ = this.inventoryEditorService.onBusyChanges();
    this.route.data.subscribe(response =>{
    this.form = this.fb.group({
      inventory:this.parseApiInput(response.inventory)
    })
  })
  }

  ngOnInit(): void {
  }

  ngOnDestroy(){
    this.subscriptions.unsubscribe();
  }
  parseApiInput(input:InventoryCard[]):string{
    let result = "";
    input.forEach(x =>{
      result += `${x.count}x ${x.name}\n`;
    })
    return result;
  }
  submitForm(){
    this.inventoryEditorService.updateInventory(this.parseFormInput());
    this.subscriptions.add(this.inventoryEditorService.busy$.pipe(
      filter(x =>{
        return !x
      }),
      tap(x =>{
        this.router.navigate(['']);
      })
    ).subscribe());
  }
  parseFormInput(){
    let inventory = [];
    let formValues = this.form.get('inventory').value.split('\n');
    let resultObject = {};
    formValues.forEach(x =>{
      let lineSplit = x.split(' ');
      if(!lineSplit[1]){
        return;
      }
      const cardText = lineSplit.slice(1, lineSplit.length).join().replace(/,/g, ' ').toUpperCase();
      if(!resultObject[cardText]){
        resultObject[cardText] = 0;
      }
      const cardCount = Number.parseInt(lineSplit[0].replace(/a-zA-Z/g, ''));
      resultObject[cardText] += cardCount;
    })
    Object.keys(resultObject).forEach(x =>{
      inventory.push({cardText:x, count:resultObject[x]});
    })
    let result = {inventory};
    return result;
  }
}
