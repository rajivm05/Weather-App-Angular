import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimationToggleService {
  public viewMode: 'list' | 'details' = 'list';
  public viewModeUpper: 'list' | 'details' = 'list';
  
  private viewModeUpperSubject = new BehaviorSubject<string>('list');
  viewModeUpper$ = this.viewModeUpperSubject.asObservable();

  public toggleView() {
    this.viewMode = this.viewMode === 'list' ? 'details' : 'list';
  }
  public toggleViewUpper(){
    this.viewModeUpper = this.viewModeUpper === 'list' ? 'details' : 'list';
    this.viewModeUpperSubject.next(this.viewModeUpper);
  }
  constructor() { }
}
