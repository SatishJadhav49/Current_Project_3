import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Plant_List } from 'src/app/shared/models/plantlist.model';
import { User } from 'src/app/shared/models/user.model';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-plantlogin',
  templateUrl: './plantlogin.component.html',
  styleUrls: ['./plantlogin.component.css'],
})
export class PlantloginComponent {
  loginForm: FormGroup;
  token_number: string;
  errormsg: string;
  userplantlist: User[] = new Array();
  plantlist: Plant_List[] = new Array();
  selectedToken: string;
  selectedPlantId: any;
  msg: string;
  constructor(
    private router: Router,
    private authservice: AuthService,
    private _toastr: ToastrService
  ) {
    this.loginForm = new FormGroup({
      selectedplant: new FormControl(null, [Validators.required]),
    });
  }

  onDropdownPlantChange(e) {
    if (e) {
      this.selectedPlantId = e;
      localStorage.setItem('plantid', this.selectedPlantId.toString());
      this.router.navigate(['/configmaster']);
      //  window.location.reload();
    }
  }
  ngOnInit() {
    this.token_number = localStorage.getItem('user');
    if (this.token_number) {
      this.authservice
        .getplantlistforuser(this.token_number)
        .subscribe((data) => {
          if (data !== null && data !== undefined) {
            this.userplantlist = data;
            if (this.userplantlist.length === 1) {
              // var pl=this.userplantlist[0].Plant_ID.toString();
              // localStorage.setItem('plantid',pl);
              //   this.router.navigate(['/configmaster']);
              //   window.location.reload();
            } else if (this.userplantlist.length !== 0) {
              this.plantlist = data;
            } else if (this.userplantlist.length === 0) {
              this.msg = 'No Plant Available for your token';
            }
          }
        });
    } else {
      this.router.navigate(['/']);
      window.location.reload();
    }
  }
}
