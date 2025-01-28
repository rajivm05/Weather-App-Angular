import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { AnimationToggleService } from '../animation-toggle.service';
import { FavoriteData } from '../daily-table-interface';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { ProgressEnablerService } from '../progress-enabler.service';


@Component({
  selector: 'app-favorite-tab',
  standalone: true,
  imports: [MatTableModule, CommonModule],
  templateUrl: './favorite-tab.component.html',
  styleUrl: './favorite-tab.component.css'
})
export class FavoriteTabComponent implements OnInit {
  public favorites = new MatTableDataSource<FavoriteData>();
  displayedColumns: string[] = ['index','city','state', 'delete'];
  constructor(public dataService: DataService, private animationToggleService: AnimationToggleService, private progressService:ProgressEnablerService) {}
  ngOnInit(): void {
    this.animationToggleService.viewModeUpper$.subscribe(viewMode => {
      if (viewMode === 'details') {
        this.progressService.renderProgressBar();
        this.dataService.fetchFavorites();
        // console.log('Favorites refreshed');
      }
    });
    this.dataService.favouriteResults$.subscribe(favorites => {
      this.favorites.data = favorites;
      this.progressService.closeProgressBar();
      // console.log("!!",favorites);
    });
  }
  removeData(index: number){
    const dataToBeRemoved:FavoriteData = this.favorites.data[index];
    this.dataService.removeSpecificFromFavorites(dataToBeRemoved);
    const temp = this.favorites.data;
    temp.splice(index, 1);
    this.favorites.data = temp;
  }
  renderData(index:number){
    const dataRequested = this.favorites.data[index];
    const format = {
      lat:dataRequested.lat, 
      lng:dataRequested.lng, 
      formattedAddress:dataRequested.formattedAddress, 
      weatherData:dataRequested.rawData,
    }
    this.dataService.isFavorite = true;
    this.dataService.setRawData(format, dataRequested.city, dataRequested.state);
    this.animationToggleService.toggleViewUpper();
  }
}
