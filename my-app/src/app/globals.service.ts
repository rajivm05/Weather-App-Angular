import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {
  public nodeServer:string = 'https://distance-project-436721.uc.r.appspot.com/';
  
  constructor() { }
}
