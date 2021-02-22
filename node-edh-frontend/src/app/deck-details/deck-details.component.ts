import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
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

  deckDetails$:Observable<DeckDetails>;
  loading$:Observable<boolean>;
  id :number;
  ngOnInit(): void {
    let id = Number.parseInt(this.route.snapshot.paramMap.get('id'));
    this.loading$ = this.deckDetailsService.busyChanges();
    this.id = id;
    this.deckDetails$ = this.deckDetailsService.dataChanges();
    this.deckDetailsService.getDeckDetails(id);
  }

  edit(){
    this.router.navigate(['deck-editor', this.id]);
  }

  goToCardDetails(id:number){
    this.router.navigate(['card-details', id]);
  }
}
