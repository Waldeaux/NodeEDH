import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CardDetails } from './models/card-details.model';
import { CardDetailsService } from './services/card-details.service';

@Component({
  selector: 'app-card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.scss']
})
export class CardDetailsComponent implements OnInit {

  data$:Observable<CardDetails>;
  constructor(cardDetailsService:CardDetailsService,
    route:ActivatedRoute) {
    let id = Number.parseInt(route.snapshot.paramMap.get('id'));
    this.data$ = cardDetailsService.dataChanges();
    cardDetailsService.getCardDetails(id);
  }

  ngOnInit(): void {
  }

}
