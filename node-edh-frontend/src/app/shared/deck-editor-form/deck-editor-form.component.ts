import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-deck-editor-form',
  templateUrl: './deck-editor-form.component.html',
  styleUrls: ['./deck-editor-form.component.scss']
})
export class DeckEditorFormComponent implements OnInit {

  @Input() deckEditor:FormGroup;
  @Output() submitListener = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  submitForm(){
    this.submitListener.emit(this.parseFormInput());
  }

  parseFormInput(){
    let cards = [];
    let formValues = this.deckEditor.get('cards').value.split('\n');
    let resultObject = {};
    formValues.forEach(x =>{
      x = x.replace(/[’',\-]*/g, '');
      let lineSplit = x.split(' ');
      const cardCountString = lineSplit[0].replace(/[^0-9]*/g, '');
      let cardCount = 1;
      let nameindex = 1;
      if(cardCountString == ''){
        nameindex = 0;
      }
      else{
        cardCount = Number.parseInt(cardCountString);
      }
      const cardText = lineSplit.slice(nameindex, lineSplit.length).join().replace(/,/g, ' ').toUpperCase();
      if(cardText == ''){
        return;
      }
      if(!resultObject[cardText]){
        resultObject[cardText] = 0;
      }
      resultObject[cardText] += cardCount;
    })
    Object.keys(resultObject).forEach(x =>{
      cards.push({cardText:x, count:resultObject[x]});
    })
    let result = {cards,
    name:this.deckEditor.get('name').value,
  draft:this.deckEditor.get('draft').value};
    return result;
  }
}
