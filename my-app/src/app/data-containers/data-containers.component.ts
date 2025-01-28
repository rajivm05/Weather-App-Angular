import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DailyTableData } from '../daily-table-interface';
import { SlideInComponent } from '../slide-in/slide-in.component';
import { FavoriteTabComponent } from '../favorite-tab/favorite-tab.component';
import { AnimationToggleService } from '../animation-toggle.service';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'app-data-containers',
  standalone: true,
  imports: [MatTabsModule, CommonModule, SlideInComponent, FavoriteTabComponent, ProgressBarComponent],
  templateUrl: './data-containers.component.html',
  styleUrl: './data-containers.component.css',
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
export class DataContainersComponent implements OnInit {
  preprocessedTableData:DailyTableData[] = [];


  constructor(private dataService: DataService, public animationService:AnimationToggleService) { }
  ngOnInit(): void { 
    this.dataService.preprocessedTableData$.subscribe(data => {
      this.preprocessedTableData = data;
      console.log("Doing this from data containers component!");
      console.log(this.preprocessedTableData);  // Output the processed data to the console.log() statement.
    });
  }
  callToggleService(){
    this.animationService.toggleViewUpper();
  }

}
