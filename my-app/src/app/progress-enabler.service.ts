import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressEnablerService{
  progressRenderSubject = new BehaviorSubject<boolean>(false);
  progressRender$: Observable<boolean> = this.progressRenderSubject.asObservable();

  constructor() { }

  renderProgressBar(){
    this.progressRenderSubject.next(true);
  }
  closeProgressBar(){
    this.progressRenderSubject.next(false);
  }
  
}
