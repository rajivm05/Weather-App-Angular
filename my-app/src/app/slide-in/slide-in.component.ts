import { Component } from '@angular/core';
import { ResultsTabComponent } from '../results-tab/results-tab.component';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { AnimationToggleService } from '../animation-toggle.service';
import { DataService } from '../data.service';
import { DetailsTableComponent } from '../details-table/details-table.component';
@Component({
  selector: 'app-slide-in',
  standalone: true,
  imports: [ResultsTabComponent, CommonModule, DetailsTableComponent],
  templateUrl: './slide-in.component.html',
  styleUrl: './slide-in.component.css',
  animations: [
    trigger('slideInOut', [
      state('list', style({ transform: 'translateX(0%)' })),
      state('details', style({ transform: 'translateX(-50%)' })),
      transition('list => details', [
        animate('500ms ease-in')
      ]),
      transition('details => list', [
        animate('500ms ease-out')
      ])
    ])
  ]
})
export class SlideInComponent {
  constructor(public animationService: AnimationToggleService, public dataService:DataService){}
  callToggleService(){
    this.animationService.toggleView();
  }

  
}
