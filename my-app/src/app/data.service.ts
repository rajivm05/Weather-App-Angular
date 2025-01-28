import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {DailyTableData, ExtendedDailyData, FavoriteData} from './daily-table-interface';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { GlobalsService } from './globals.service';
import { ProgressEnablerService } from './progress-enabler.service';


@Injectable({
  providedIn: 'root'
})


export class DataService {
  private weatherCodes: { [key: string]: string } = {
    "WC4201": "Heavy Rain",
    "WC4001": "Rain",
    "WC4200": "Light Rain",
    "WC6201": "Heavy Freezing Rain",
    "WC6001": "Freezing Rain",
    "WC6000": "Light Freezing Rain",
    "WC4000": "Drizzle",
    "WC7101": "Heavy Ice Pallets",
    "WC7000": "Ice Pallets",
    "WC7102": "Light Ice Pallets",
    "WC5101": "Heavy Snow",
    "WC5000": "Snow",
    "WC5100": "Light Snow",
    "WC5001": "Flurries",
    "WC8000": "Thunderstorm",
    "WC2100": "Light Fog",
    "WC2000": "Fog",
    "WC1001": "Cloudy",
    'WC1102': "Mostly Cloudy",
    "WC1101": "Partly Cloudy",
    "WC1100": "Mostly Clear",
    "WC1000": "Clear"
  };
  public weatherCodesReversed: { [key: string]: string } = {
     "Heavy Rain":"WC4201",
     "Rain":"WC4001",
     "Light Rain":"WC4200",
     "Heavy Freezing Rain":"WC6201",
     "Freezing Rain":"WC6001",
     "Light Freezing Rain":"WC6000",
     "Drizzle":"WC4000",
     "Heavy Ice Pallets":"WC7101",
     "Ice Pallets":"WC7000",
     "Light Ice Pallets":"WC7102",
     "Heavy Snow":"WC5101",
     "Snow":"WC5000",
     "Light Snow":"WC5100",
     "Flurries":"WC5001",
     "Thunderstorm":"WC8000",
     "Light Fog":"WC2100",
     "Fog":"WC2000",
     "Cloudy":"WC1001",
     "Mostly Cloudy":'WC1102',
     "Partly Cloudy":"WC1101",
     "Mostly Clear":"WC1100",
     "Clear":"WC1000"
  };

  // Icon codes mapping
  private iconCodes: { [key: string]: string } = {
    "Humidity": "humidity-icon",
    "Pressure": "pressure-icon",
    "Wind Speed": "windspeed-icon",
    "Visibility": "visibility-icon",
    "Cloud Cover": "cloudcover-icon",
    "UV Level": "uvlevel-icon"
  };
 

  private getIcon(fieldName: string): string {
    return this.iconCodes[fieldName] || "default-icon";
  }
  
  private getWeatherDescription(code: string): string {
    return this.weatherCodes[code] || "Unknown Weather Condition";
  }

  //data variables
  public rawData:any = null;
  public formattedAddress:string= "";
  public lat: string = "";
  public lng: string = "";
  public city: string = "";
  public state: string = "";
  public isFavorite:boolean = false;
  
  //favorites variables
  token = '123456';
  headers = new HttpHeaders({ 'Content-type': 'application/json',
    'Authorization': `Bearer ${this.token}`
   });
  // public favouriteResults:FavoriteData[] = [];
  
  //preprocessing variables and their observables
  private citySubject = new BehaviorSubject<string>('');
  cityData$: Observable<string> = this.citySubject.asObservable();

  private stateSubject = new BehaviorSubject<string>('');
  stateData$: Observable<string> = this.stateSubject.asObservable();

  private latSubject = new BehaviorSubject<string>('');
  latData$: Observable<string> = this.latSubject.asObservable();  

  private lngSubject = new BehaviorSubject<string>('');
  lngData$: Observable<string> = this.lngSubject.asObservable();

  private formattedAddressSubject = new BehaviorSubject<string>('');
  formattedAddressData$: Observable<string> = this.formattedAddressSubject.asObservable();

  private preProcessedTableSubject = new BehaviorSubject<DailyTableData[]>([]);
  preprocessedTableData$: Observable<DailyTableData[]> = this.preProcessedTableSubject.asObservable();

  private extendedDataSubject = new BehaviorSubject<ExtendedDailyData[]>([]);
  extendedData$: Observable<ExtendedDailyData[]> = this.extendedDataSubject.asObservable();

  private favouriteResultsSubject = new BehaviorSubject<FavoriteData[]>([]);
  favouriteResults$: Observable<FavoriteData[]> = this.favouriteResultsSubject.asObservable();

  public pointToDate:number = 0;

  constructor(private http:HttpClient, private globals:GlobalsService, private progressService:ProgressEnablerService) { }

  setRawData(data:any, city:string, state:string): void {
    // console.log(data);
    this.rawData = data.weatherData;
    this.formattedAddress = data.formattedAddress;
    this.lat = data.lat;
    this.lng = data.lng;
    this.city = city;
    this.state = state;

    this.formattedAddressSubject.next(data.formattedAddress);
    this.latSubject.next(data.lat);
    this.lngSubject.next(data.lng);
    this.citySubject.next(city);
    this.stateSubject.next(state);
    
    this.preprocessWeatherData();
  }

  private preprocessWeatherData(): void {
    const dailyData:DailyTableData[] = [];
    if(!this.rawData || !this.rawData.data || !this.rawData.data.timelines){
      console.error("Invalid Raw Format");
      return;
    }
    const formatDate = (dateString:string): string => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    };

    const dailyTimeline = this.rawData.data.timelines.find((timeline: any) => timeline.timestep === '1d');
    const hourlyTimeline = this.rawData.data.timelines.find((timeline: any) => timeline.timestep === '1h');

    if (!dailyTimeline || !hourlyTimeline) {
      console.error("Invalid Raw Format");
      return;
    }

    // Get the last date available in hourlyTimeline for comparison
    const maxHourlyDate = new Date(hourlyTimeline.intervals[hourlyTimeline.intervals.length - 1].startTime);

    dailyTimeline.intervals.forEach((dailyEntry: any) => {
    const dailyDate = new Date(dailyEntry.startTime);

    // Only process the date if it is within the range of hourlyTimeline dates
    if (dailyDate <= maxHourlyDate) {
      const date = formatDate(dailyEntry.startTime);
      const status = this.getWeatherDescription("WC" + dailyEntry.values.weatherCode);
      const windSpeed = dailyEntry.values.windSpeed;

      // Filter hourly entries for the same date as dailyEntry
      const tempsForDay = hourlyTimeline.intervals
        .filter((hourlyEntry: any) =>
          new Date(hourlyEntry.startTime).toDateString() === dailyDate.toDateString()
        )
        .map((hourlyEntry: any) => hourlyEntry.values.temperature);

      const tempHigh = Math.max(...tempsForDay);
      const tempLow = Math.min(...tempsForDay);

      dailyData.push({
        date,
        status,
        tempHigh,
        tempLow,
        windSpeed
      });
    }
    });

    //replace
    
    // const dailyTimeline = this.rawData.data.timelines.find((timeline:any) => timeline.timestep ==='1d');
    // const hourlyTimeline = this.rawData.data.timelines.find((timeline:any) =>timeline.timestep ==='1h');
    // if(!dailyTimeline ||!hourlyTimeline){
    //   console.error("Invalid Raw Format");
    //   return;
    // }
    // dailyTimeline.intervals.forEach((dailyEntry:any) => {
    //   const date = formatDate(dailyEntry.startTime);
    //   const status = this.getWeatherDescription("WC"+dailyEntry.values.weatherCode);
    //   const windSpeed = dailyEntry.values.windSpeed;

    //   const tempsForDay = hourlyTimeline.intervals.filter((hourlyEntry:any)=> new Date(hourlyEntry.startTime).toDateString() === new Date(dailyEntry.startTime).toDateString()).map((hourlyEntry:any) => hourlyEntry.values.temperature);
    //   const tempHigh = Math.max(...tempsForDay);
    //   const tempLow = Math.min(...tempsForDay);
    //   dailyData.push({
    //     date,
    //     status,
    //     tempHigh,
    //     tempLow,
    //     windSpeed
    //   });
    // });

    //till here
    this.preProcessedTableSubject.next(dailyData);
    this.progressService.closeProgressBar();
    this.createExtendedDailyData(dailyTimeline, dailyData);
  }
  formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  }
  // private createExtendedDailyData(dailyTimeline:any, dailyData:DailyTableData[]):void{
  //   const extendedData:ExtendedDailyData[] = dailyTimeline.intervals.map((dailyEntry:any, index:number) => {
  //     const { weatherCode, windSpeed, humidity, visibility, cloudCover, temperatureApparent } = dailyEntry.values;

  //     return {
  //       date: dailyData[index].date,
  //       status: this.getWeatherDescription("WC"+weatherCode),
  //       tempHigh: dailyData[index].tempHigh,
  //       tempLow: dailyData[index].tempLow,
  //       apparentTemperature: temperatureApparent,
  //       sunriseTime: this.formatDateTime(dailyEntry.values.sunriseTime),
  //       sunsetTime: this.formatDateTime(dailyEntry.values.sunsetTime),
  //       humidity,
  //       windSpeed,
  //       visibility,
  //       cloudCover,
  //     };
  //   });
  //   this.extendedDataSubject.next(extendedData);
  // }

  private createExtendedDailyData(dailyTimeline: any, dailyData: DailyTableData[]): void {
    // Ensure we process only the same number of entries as in dailyData
    const limitedDailyTimeline = dailyTimeline.intervals.slice(0, dailyData.length);
  
    const extendedData: ExtendedDailyData[] = limitedDailyTimeline.map((dailyEntry: any, index: number) => {
      const { weatherCode, windSpeed, humidity, visibility, cloudCover, temperatureApparent } = dailyEntry.values;
  
      return {
        date: dailyData[index].date, // Corresponds to the same date in dailyData
        status: this.getWeatherDescription("WC" + weatherCode),
        tempHigh: dailyData[index].tempHigh,
        tempLow: dailyData[index].tempLow,
        apparentTemperature: temperatureApparent,
        sunriseTime: this.formatDateTime(dailyEntry.values.sunriseTime),
        sunsetTime: this.formatDateTime(dailyEntry.values.sunsetTime),
        humidity,
        windSpeed,
        visibility,
        cloudCover,
      };
    });
  
    this.extendedDataSubject.next(extendedData);
  }

  public addToFavorites(){
    this.isFavorite = true;
    const payLoad = {
      lat:this.lat, 
      lng: this.lng,
      formattedAddress: this.formattedAddress,
      rawData: this.rawData,
      city: this.city,
      state: this.state,
    };
   this.http.post(this.globals.nodeServer + 'addData', payLoad, {headers:this.headers}).subscribe(response => {});
  }
  public removeFromFavorites(){
    this.isFavorite = false;
    const payLoad = {
      lat:this.lat, 
      lng: this.lng,
      formattedAddress: this.formattedAddress,
      city:this.city,
      state:this.state,
      rawData: this.rawData
    };
   this.http.post(this.globals.nodeServer + 'removeData', payLoad, {headers:this.headers}).subscribe(response => {});
  }
  public removeSpecificFromFavorites(dataEntry:FavoriteData){
    this.http.post(this.globals.nodeServer + 'removeData', dataEntry, {headers:this.headers}).subscribe(response => {});
  }
  public fetchFavorites(){
    // console.log("Fetcing data from data service");
    // console.log("fetching");
    this.http.get(this.globals.nodeServer + 'fetchData', {headers:this.headers}).subscribe((response:any) => {
      // console.log("Obtained Data");
      this.favouriteResultsSubject.next(response.result);
      // console.log(response.result); 
    });
  }
  clearData(){
    this.rawData = null;
    this.formattedAddress = '';
    this.lat = '';
    this.lng = '';
    this.city = '';
    this.state = '';
    this.preProcessedTableSubject.next([]);
    this.extendedDataSubject.next([]);
    this.favouriteResultsSubject.next([]);
    // this.latSubject.next('');
    // this.lngSubject.next('');
    this.citySubject.next('');
    this.stateSubject.next('');
    this.formattedAddressSubject.next('');
    this.isFavorite = false;
    this.pointToDate = 0;
  }
}
