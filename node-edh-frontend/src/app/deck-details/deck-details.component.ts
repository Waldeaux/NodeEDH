import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DeckDetails } from './models/deck-details.model';
import { DeckDetailsService } from './services/deck-details.service';

@Component({
  selector: 'app-deck-details',
  templateUrl: './deck-details.component.html',
  styleUrls: ['./deck-details.component.scss']
})
export class DeckDetailsComponent implements OnInit {

  constructor(private deckDetailsService:DeckDetailsService,
    private route:ActivatedRoute,
    private router:Router) { }

    neededCardsUrl = "";
  deckDetails$:Observable<DeckDetails>;
  loading$:Observable<boolean>;
  id :number;
  totalCount:number;
  sideboardCount:number;
  ngOnInit(): void {
    let id = Number.parseInt(this.route.snapshot.paramMap.get('id'));
    
    this.loading$ = this.deckDetailsService.busyChanges();
    this.id = id;
    this.neededCardsUrl = `../needed-cards/${this.id}`;
    this.deckDetails$ = this.deckDetailsService.dataChanges().pipe(
      tap(response =>{
        this.totalCount = 0;
        this.sideboardCount = 0;
        response.cards.forEach(element => {
          this.totalCount += element.count;
        });
        response.sideboard.forEach(element =>{
          this.sideboardCount += element.count;
        })
      }));
    this.deckDetailsService.getDeckDetails(id);
  }

  edit(){
    this.router.navigate(['deck-editor', this.id]);
  }

  goToCardDetails(id:number){
    this.router.navigate(['card-details', id]);
  }
}
