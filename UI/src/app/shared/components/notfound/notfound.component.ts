import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectionService } from 'ng-connection-service';

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.css'],
})
export class NotfoundComponent {
  countdownValue: number = 5;
  constructor(
    private router: Router
  ) {}
  ngOnInit() {
    this.startCountdown();
  }

  startCountdown() {
    const countdownInterval = setInterval(() => {
      if (this.countdownValue > 0) {
        this.countdownValue--;
      } else {
        clearInterval(countdownInterval);
        this.router.navigate(['/configmaster']);
      }
    }, 1000);
  }
}
