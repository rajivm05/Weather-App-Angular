import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { AnimationToggleService } from '../animation-toggle.service';
import { ExtendedDailyData } from '../daily-table-interface';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MapPointerComponent } from '../map-pointer/map-pointer.component';


@Component({
  selector: 'app-details-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MapPointerComponent],
  templateUrl: './details-table.component.html',
  styleUrl: './details-table.component.css'
})
export class DetailsTableComponent implements OnInit {
  extendedWeatherData:ExtendedDailyData[] = [];

  ngOnInit(): void { 
    this.dataService.extendedData$.subscribe(data => {
      this.extendedWeatherData = data;
      // console.log("Doing this from results tab component!");
      // console.log(this.extendedWeatherData);  
    });
  }
  constructor(public animationService: AnimationToggleService, public dataService:DataService){}
  callToggleService(){
    this.animationService.toggleView();
  }
  renderContent():string{
    const tweet = `The temperature in ${this.dataService.formattedAddress} on ${this.extendedWeatherData[this.dataService.pointToDate].date} is ${this.extendedWeatherData[this.dataService.pointToDate].apparentTemperature}°F and the conditions are ${this.extendedWeatherData[this.dataService.pointToDate].status}`;
    return tweet;
  }
}
