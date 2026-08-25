import { Injectable } from '@angular/core';

/**
 * This is a singleton class
 */
@Injectable()
export class AppConfig {
  public version: String = '1.0.0';
  public locale: String = 'en-US';
  public currencyFormat = { style: 'currency', currency: 'INR' };
  public dateFormat = { year: 'numeric', month: 'short', day: 'numeric' };

  public apiPort: String = '64018';

  // For 1D-TCF/BIW
  // public apiPort: String = '2428';
  // public apiPort: String = '443';

  public apiProtocol: String;
  public apiHostName: String;
  public baseApiPath: String;
  public basePath: String;

  constructor() {
    this.basePath = '';
    if (this.apiProtocol === undefined) {
      this.apiProtocol = window.location.protocol;
    }
    if (this.apiHostName === undefined) {
      this.apiHostName = window.location.hostname;
    }
    if (this.apiPort === undefined) {
      this.apiPort = window.location.port;
    }
    this.baseApiPath =
      this.apiProtocol + '//' + this.apiHostName + ':' + this.apiPort + '/';

    // this.apiProtocol + '//' + this.apiHostName + ':' + this.apiPort + '/PQ1D/';
    if (this.locale === undefined) {
      this.locale = navigator.language;
    }
  }
}
