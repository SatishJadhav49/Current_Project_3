import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectionService } from 'ng-connection-service';

@Component({
  selector: 'app-notaccess',
  templateUrl: './notaccess.component.html',
  styleUrls: ['./notaccess.component.css'],
})
export class NotaccessComponent {
  isConnected=true;
  constructor(private router:Router,private connectionService:ConnectionService){ }
  
  ngOnInit(){
    this.connectionService.monitor().subscribe((isConnected) => {
      // console.log(isConnected)
      if (isConnected.hasNetworkConnection) {
        this.isConnected = true;
      } else {
        this.isConnected = false;
      }
      // console.log(this.isConnected)
    });
  }

  refreshPage()
  {
    this.router.navigate(['']);
  }
}
