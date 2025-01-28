import { Component, OnInit } from '@angular/core';
import { ProgressEnablerService } from '../progress-enabler.service';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.css'
})
export class ProgressBarComponent implements OnInit {
  isLoading = false;
  constructor(private progressEnablerService: ProgressEnablerService) {}
  ngOnInit(): void {
    this.progressEnablerService.progressRender$.subscribe(data => {
      this.isLoading = data;
    });

  }

}
