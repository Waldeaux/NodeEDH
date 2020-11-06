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
    this.submitListener.emit(this.deckEditor);
  }
}
