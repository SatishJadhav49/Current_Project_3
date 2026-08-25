import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'OneD';
  constructor(private titleService: Title) {}
  ngAfterViewChecked() {
    const temp = parseInt(localStorage.getItem('audittypeid'));
    if (temp == 1) {
      this.titleService.setTitle(`1D-TCF`);
    } else {
      this.titleService.setTitle(`1D-BIW`);
    }
  }
}
