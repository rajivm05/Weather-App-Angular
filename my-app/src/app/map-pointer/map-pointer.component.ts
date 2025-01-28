import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
// import { GoogleMapsModule, GoogleMap} from '@angular/google-maps';
import { Loader } from "@googlemaps/js-api-loader"
import { CommonModule } from '@angular/common';

// import {}

@Component({
  selector: 'app-map-pointer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-pointer.component.html',
  styleUrl: './map-pointer.component.css'
})
export class MapPointerComponent implements OnInit {
  lat:Number = 0;
  lng:Number = 0;
  loader = new Loader({
    apiKey: "AIzaSyDjKxdklB2CVPqND2bep5I2xfmuLkUFE1E",
    version: "weekly",
  });
  
  constructor(private dataService: DataService){}
  ngOnInit(): void { 
    this.onCall();
    this.dataService.latData$.subscribe(data =>{
      this.lat = Number.parseFloat(data);
    });
    this.dataService.lngData$.subscribe(data =>{
      this.lng = Number.parseFloat(data);
      this.onCall();
    });

    
   }
   onCall(){
    this.loader.load().then(async () => {
      const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
      const map = new Map(document.getElementById("map") as HTMLElement, {
        center: { lat: this.lat.valueOf(), lng: this.lng.valueOf() },
        zoom: 15,
        mapId:'4504f8b37365c3d0'
      });
      const marker = new AdvancedMarkerElement({
        map,
        position: { lat: this.lat.valueOf(), lng: this.lng.valueOf() },
      });
    });
   }
   
}
