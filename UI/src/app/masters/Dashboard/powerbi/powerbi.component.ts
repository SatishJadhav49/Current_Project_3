import { Component } from '@angular/core';
@Component({
  selector: 'app-powerbi',
  templateUrl: './powerbi.component.html',
  styleUrls: ['./powerbi.component.css'],
})
export class PowerbiComponent {
  reportUrl = '';

  ngOnInit() {
    $('#ngslide').hide();
    $('.sidebar-mini').addClass('sidebar-collapse');
    if (localStorage.getItem('audittypeid') == '1') {
      this.reportUrl =
      'https://app.powerbi.com/links/TGvbAPfocQ?ctid=8c4858b5-f020-483a-b7ef-71ded6e81767&pbi_source=linkShare';
    } else {
      this.reportUrl =
      'https://app.powerbi.com/links/k7qdiuCAXb?ctid=8c4858b5-f020-483a-b7ef-71ded6e81767&pbi_source=linkShare';
    }
    this.openUrl();
  }

  openUrl() {
    window.open(this.reportUrl, '_blank');
  }
}
