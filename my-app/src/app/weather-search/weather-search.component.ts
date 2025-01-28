import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { usaStates } from 'typed-usa-states';
import { usaCities } from 'typed-usa-states/dist/cities';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, startWith, map, of } from 'rxjs';
import { IUSACity } from 'typed-usa-states/dist/typings';
import { GlobalsService } from '../globals.service';
import { DataService } from '../data.service';
import { ProgressEnablerService } from '../progress-enabler.service';

interface IPInfoData {
  ip: string;
  hostname: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  postal: string;
  timezone: string;
}


interface FinalAddress{
  lat:string;
  lng:string;
  formattedAddress:string;
}


@Component({
  selector: 'app-weather-search',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatAutocompleteModule, MatInputModule],
  templateUrl: './weather-search.component.html',
  styleUrls: ['./weather-search.component.css']
})
export class WeatherSearchComponent implements OnInit {
  weatherForm: FormGroup;
  streetError = false;
  cityError = false;
  stateError = false;
  token = '123456';
  headers = new HttpHeaders({ 'Content-type': 'application/json',
    'Authorization': `Bearer ${this.token}`
   });
  states = usaStates;
  filteredStates: { name: string; abbreviation: string }[] = [];

  cities:IUSACity[] = usaCities;
  filteredCities!: Observable<IUSACity[]>;

  ngOnInit(): void {
    this.filteredCities = this.weatherForm.get('city')!.valueChanges.pipe(
      startWith('1'),
      map(value => this._filterCities(value || ''))
    );
  }

  constructor(private fb: FormBuilder, public globals:GlobalsService, private http:HttpClient, private dataService:DataService, private progressService:ProgressEnablerService) {
    // console.log("here");
    // this.http.get('http://localhost:8080/', {headers}).subscribe(response => {console.log(response);})

    // console.log(usaCities);
    this.weatherForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', [Validators.required, this.stateValidator.bind(this)]],
      autodetect: [false]
    });
    this.weatherForm.get('autodetect')?.valueChanges.subscribe(checked => {
      this.toggleFormFields(checked);
    });
    
  }
  private _filterCities(value: string): IUSACity[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter(cityState =>
      cityState.name.toLowerCase().includes(filterValue)
    );
  }
  // selectCity(cityState: IUSACity) {
  //   this.weatherForm.get('city')?.setValue(cityState.name); // Set city name
  //   this.weatherForm.get('state')?.setValue(cityState.state); // Set state name
  // }
  selectCity(event: MatAutocompleteSelectedEvent): void { 
    console.log("Event selected", event);
    this.weatherForm.get('city')?.setValue(event.option.value.name); // Set city name
    this.weatherForm.get('state')?.setValue(event.option.value.state); // Set state name
  }
  
  toggleFormFields(checked: boolean) {
    if (checked) {
      // Disable fields and make form valid
      this.weatherForm.get('street')?.disable();
      this.weatherForm.get('city')?.disable();
      this.weatherForm.get('state')?.disable();
      this.weatherForm.get('street')?.clearValidators();
      this.weatherForm.get('city')?.clearValidators();
      this.weatherForm.get('state')?.clearValidators();
      this.weatherForm.updateValueAndValidity();
    } else {
      // Enable fields and apply original validators
      this.weatherForm.get('street')?.enable();
      this.weatherForm.get('city')?.enable();
      this.weatherForm.get('state')?.enable();
      this.weatherForm.get('street')?.setValidators(Validators.required);
      this.weatherForm.get('city')?.setValidators(Validators.required);
      this.weatherForm.get('state')?.setValidators([Validators.required, this.stateValidator.bind(this)]);
      this.weatherForm.updateValueAndValidity();
    }
  }
  // Custom validator to check if the entered state is in the list
  stateValidator(control: AbstractControl): ValidationErrors | null {
    const isValidState = this.states.some(state => state.name.toLowerCase() === control.value?.toLowerCase());
    return isValidState ? null : { invalidState: true };
  }

  // Filter the states as user types in the "state" field
  filterStates() {
    const input = this.weatherForm.get('state')?.value.toLowerCase();
    this.filteredStates = this.states.filter(state =>
      state.name.toLowerCase().includes(input)
    );
  }

  // Select a state from the suggestions list
  selectState(state: { name: string; abbreviation: string }) {
    // console.log(state.name);
    this.weatherForm.get('state')?.setValue(state.name);
    this.checkField('state');
    // console.log(this.weatherForm.get('state'));
    this.filteredStates = []; // Clear suggestions after selection
  }

  // Check if a field is invalid on blur
  checkField(field: string) {
    const control = this.weatherForm.get(field);
    switch (field) {
      case 'street':
        this.streetError = !!(control?.invalid && control?.touched);
        break;
      case 'city':
        this.cityError = !!(control?.invalid && control?.touched);
        this.filteredCities = this.weatherForm.get('city')!.valueChanges.pipe(
          startWith('1'),
          map(value => this._filterCities(value || ''))
        );
        break;
      case 'state':
        this.stateError = !!(control?.invalid && control?.touched);
        this.filteredStates = []; // Hide suggestions on blur for state field
        break;
    }
  }

  onSubmit() {
    if(this.weatherForm.value.autodetect || (this.weatherForm.value.city && this.weatherForm.value.street && this.weatherForm.value.state)){
      if(this.weatherForm.value.autodetect == true){
        
        //to bypass fetching location
        // this.fetchLocation(true);

        //to fetch true location
        this.progressService.renderProgressBar();
        this.fetchLocation(false);
        
      }
      else{
        // console.log("Fetching geolocations");
        // console.log("Fetching from " + this.globals.nodeServer);
        this.progressService.renderProgressBar();
        let params = new HttpParams()
        .set('street', this.weatherForm.value.street)
        .set('city', this.weatherForm.value.city)
        .set('state', this.weatherForm.value.state);
        // console.log(params);
        const url_geolocation:string = this.globals.nodeServer + 'getGeolocation';
        // console.log(url_geolocation);
        this.http.get(url_geolocation, {headers:this.headers, params:params}).subscribe((response:any) => {
          // console.log(response);
          const formattedAddress = response.results?.[0]?.formatted_address;
          const lat = response.results?.[0]?.geometry?.location?.lat;
          const lng = response.results?.[0]?.geometry?.location?.lng;

          if (formattedAddress && lat !== undefined && lng !== undefined) {
            // console.log('Formatted Address:', formattedAddress);
            // console.log('Latitude:', lat);
            // console.log('Longitude:', lng);
            this.fetchWeatherData(lat, lng, formattedAddress, this.weatherForm.value.city, this.weatherForm.value.state);

          } 
          else {
            console.error('No valid results found');
          }

        });
      }
    }
    else{
      // console.log("Issue");
      this.streetError = this.weatherForm.get('street')?.value == '';
      // console.log(this.weatherForm.get('street')?.value);
      this.cityError = this.weatherForm.get('city')?.value == '';
      this.stateError = this.weatherForm.get('state')?.value == '';
    }
  }

  onClear() {
    this.weatherForm.reset();
    this.filteredStates = []; // Clear suggestions when form is cleared
    this.streetError = this.cityError = this.stateError = false; // Reset error flags
    this.dataService.clearData();
  }

  fetchLocation(bypass:boolean):void{
    //code to bypass for testing purposes
    if(bypass){
      this.fetchWeatherData("null", "null", "null", "Los Angeles", "California");
      return;
    }

    // Fetch location from IP address
    fetch('https://ipinfo.io?token=710d00a5cc7bf5').then((response):Promise<IPInfoData> => response.json()).then((data:IPInfoData) => {
      const [lat, lng] = data.loc.split(',');
      const formattedAddress:string = `${data.city}, ${data.region}, ${data.country}`;
      if(lat && lng){
        //call the weather api
        console.log({lat:lat, lng:lng, formattedAddress:formattedAddress});
        this.fetchWeatherData(lat, lng, formattedAddress, data.city, data.region);
      }
    }).catch((error:Error) => console.log('Errorrrr'));
  }

  fetchWeatherData(lat:string, lng:string, formattedAddress:string, city:string, state:string):void{
    // console.log(lat);
    // console.log(lng);
    // console.log(formattedAddress);
    let params = new HttpParams()
   .set('lat', lat).set('lng', lng).set('formattedAddress',formattedAddress);
   

  //  ****************************************************************************************************************************************
   
  //uncomment next line to connect to actual server
   this.http.get(this.globals.nodeServer + 'weatherAPI', {headers:this.headers, params:params}).subscribe(response => {

    //uncomment next line to connect to dummy server
    // this.http.get('http://localhost:3000/', {headers:this.headers}).subscribe(response => {
    
      //  console.log(response);
    this.dataService.setRawData(response, city, state);
   })

   //  ****************************************************************************************************************************************

  }

}

