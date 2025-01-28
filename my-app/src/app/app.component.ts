import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherSearchComponent } from './weather-search/weather-search.component';
import { DataContainersComponent } from './data-containers/data-containers.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WeatherSearchComponent, DataContainersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'my-app';
  loading:boolean = false;
  constructor(){}
  ngOnInit(): void {
    
  }
}
