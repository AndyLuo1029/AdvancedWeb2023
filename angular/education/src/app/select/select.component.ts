import { Component } from '@angular/core';
import { NgClass } from '@angular/common'
@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent {
  characters = [
    {id:1, selected:false},
    {id:2, selected:false},
    {id:3, selected:false},
    {id:4, selected:false},
    {id:5, selected:false},
    {id:6, selected:false},
    {id:7, selected:false},
    {id:8, selected:false},
  ]

  onSelect(index:any) {
    for( let ch of this.characters) {
      ch.selected = false;
    }
    this.characters[index].selected = true;
    // console.log(index)
    console.log(this.characters)
  }
}
