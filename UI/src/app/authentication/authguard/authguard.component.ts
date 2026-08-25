import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Log_In_User } from 'src/app/shared/models/loginuser.model';
import { Plant_List } from 'src/app/shared/models/plantlist.model';
import { User } from 'src/app/shared/models/user.model';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-authguard',
  templateUrl: './authguard.component.html',
  styleUrls: ['./authguard.component.css'],
})
export class AuthguardComponent {
  selectedToken: string;
  userlog = new Log_In_User();
  errorMsg: string;
  dash_key: boolean;
  isHavedata: boolean;
  loadAPI: Promise<any>;
  token_number: string;
  userplantlist: User[] = new Array();
  plantlist: Plant_List[] = new Array();
  msg: string;

  constructor(private router: Router, private authservice: AuthService) { }

  public loadScript(loadingScreen: string) {
    var isFound = false;
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; ++i) {
      if (
        scripts[i].getAttribute('src') != null &&
        scripts[i].getAttribute('src').includes('loader')
      ) {
        isFound = true;
      }
    }

    if (!isFound) {
      var dynamicScripts = [loadingScreen];

      for (var i = 0; i < dynamicScripts.length; i++) {
        let node = document.createElement('script');
        node.src = dynamicScripts[i];
        node.type = 'text/javascript';
        node.async = false;
        node.charset = 'utf-8';
        document.getElementsByTagName('head')[0].appendChild(node);
      }
    }
  }
  ngOnInit() {
    this.loadAPI = new Promise((resolve) => {
      // this.loadScript(loadingScreen);
      resolve(true);
    });

    //
    this.dash_key = false;
    this.authservice.getTokenCurrentPC().subscribe((data1) => {
      //;
      this.selectedToken = data1;

      this.authservice.checkToken(this.selectedToken).subscribe((data) => {
        if (data === null || data === undefined) {
          this.router.navigate(['NotAccess']);
          this.errorMsg = 'Token number is not configure.';
          this.dash_key = false;
        } else {
          debugger;
          localStorage.setItem('user', this.selectedToken);
          localStorage.setItem('userType', data.Category_Group);
          localStorage.setItem('Department_ID', data[0].Department_ID);
          
          localStorage.setItem('Plant_Code', data[0].Plant_Code);
          localStorage.setItem('shopid', data[0].Shop_ID);
          localStorage.setItem('Manager_ID', data[0].Manager_ID);
          localStorage.setItem('Email', data[0].Email_Address);
          localStorage.setItem('Name', data[0].Employee_Name);
          this.token_number = localStorage.getItem('user');
          if (this.token_number) {
            this.authservice
              .getplantlistforuser(this.token_number)
              .subscribe((data) => {
                if (data !== null && data !== undefined) {
                  this.userplantlist = data;
                  localStorage.setItem('audittypeid', data[0].Audit_Type_Id);
                  if (this.userplantlist.length === 1) {
                    var pl = this.userplantlist[0].Plant_ID.toString();
                    var userid = this.userplantlist[0].Employee_ID.toString();
                    var plantcode = this.userplantlist[0].Plant_Code.toString();
                    localStorage.setItem('plantid', pl);
                    localStorage.setItem('userid', userid);
                    localStorage.setItem('Plant_Code', plantcode);
                   

                    this.router.navigate(['/configmaster']); //uncomment this code
                    // window.location.reload();
                  } else if (this.userplantlist.length !== 0) {
                    this.router.navigate(['/plantlogin']);
                    var userid = this.userplantlist[0].Employee_ID.toString();

                    localStorage.setItem('userid', userid);
                  } else if (this.userplantlist.length === 0) {
                    this.msg = 'No Plant Available for your token';
                  }
                }
              });
          } else {
            this.router.navigate(['/']);
            // window.location.reload();
          }

          setTimeout((router: Router) => { }, 10000);
          this.userlog.Log_In_User = this.selectedToken;
          this.userlog.Log_In = true;
          this.authservice.saveLoginUser(this.userlog).subscribe();
          this.dash_key = true;
        }
      });
    });
  }
}
