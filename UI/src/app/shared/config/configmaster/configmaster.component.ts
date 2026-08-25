import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import * as $ from 'jquery';
import { UserAuthenticate } from 'src/app/shared/models/userauthenticate.model';
import { AuthService } from 'src/app/authentication/auth.service';
import { CommonService } from '../../../masters/common/common.service';

@Component({
  selector: 'app-configmaster',
  templateUrl: './configmaster.component.html',
  styleUrls: ['./configmaster.component.css'],
})
export class ConfigmasterComponent {
  dashboardName: string;
  userMenuName: string;
  reportMenuName: string;
  checklistMunuName: string;
  qualityMunuName: string;
  dashboardID: number;
  hostdata: any;
  userMenuID: number;
  t: string;
  showslides: boolean = true;
  public options = {
    position: ['bottom', 'left'],
    timeOut: 5000,
    lastOnBottom: true,
    maxStack: 3,
    preventDuplicates: true,
    clickToClose: true,
  };
  tokenNumber: string;
  credUser: UserAuthenticate[];
  profile = new UserAuthenticate();
  employeeName: string;
  userconcernid: number;
  userconcernname: string;
  link: string;
  isChildSelected: boolean;
  plantname: string;
  plantid: any;
  audittypeid: number;
  constructor(
    private router: Router,
    private _toastr: ToastrService,
    private authservice: AuthService,
    private CommonService: CommonService
  ) {
    //for slidebar
  }
  redirectpath() {
    $('#ngslide').show();
  }
  ngOnInit() {
    //   //for slidebar
    this.isChildSelected = false;
    $('.sidebar-mini').removeClass('sidebar-collapse');
    var urlParams = [];
    window.location.search
      .replace('?', '')
      .split('&')
      .forEach(function (e, i) {
        var p = e.split('=');
        urlParams[p[0]] = p[1];
      });

    if (urlParams['loaded']) {
    } else {
      let win = window as any;
      win.location.search = '?loaded=1';
    }
    this.isChildSelected = false;
    this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    this.tokenNumber = localStorage.getItem('user');
    this.plantid = localStorage.getItem('plantid');
    if (this.tokenNumber && this.plantid && this.audittypeid) {
      this.authservice
        .getAuthenticateUser(this.tokenNumber, this.plantid, this.audittypeid)
        .subscribe((data2) => {
          if (!(data2.length > 0)) {
            this.router.navigate(['/NotAccess']);
            return;
          }
          this.CommonService.getPlantname(parseInt(this.plantid)).subscribe(
            (data3) => {
              this.plantname = data3;
            }
          );
          localStorage.setItem('isallshops', data2[0].Is_AllShops ? '1' : '0'); // true=1,0=false
          localStorage.setItem('shopid', data2[0].Shop_ID);
          this.isAllShops(data2);
          this.getRights();
          this.storeRoles(data2);
          if (
            (this.credUser !== null || this.credUser !== undefined) &&
            this.credUser.length !== 0
          ) {
            this.employeeName = this.credUser[0].Employee_Name;
            this.profile = this.credUser[0];
          }

          this.CommonService.getHostNameData().subscribe((data3) => {
            this.hostdata = data3;
            if (this.hostdata) {
              var hostList = this.hostdata.split(' ');
              if (hostList.length == 1 && hostList[0] !== ' ') {
                localStorage.setItem('hostname', this.hostdata);
              } else {
                this._toastr.error(
                  'Unable to Detect HostName Please Reload',
                  'Error Detecting Hostname:' + this.hostdata
                );
              }
            }
          });
        });
    } else {
      this.router.navigate(['']);
    }

    $('#close').on('click', function (e) {
      e.preventDefault();
      $('#ngslide').hide();
    });
    $('h6').click(function () {
      $('p').toggleClass('change');
    });
    $(function () {
      $('.aa').unbind('dblclick');
      $('.aa').click(function (e) {
        $(this).toggleClass('fa fa-angle-double-left fa fa-angle-double-right');
      });
    });
  }
  ReloadSubmenu() {
    $('ul li').click(function () {
      $(this).parent().find('li.active').removeClass('active');
      $(this).addClass('active');
    });
  }
  logout() {
    this.authservice.logout();
  }
  onChildSelect(Child) {
    var flag = false;

    var count = 0;
    // This would work but if you have the previously selected child stored
    // it would be better to just turn that one white
    for (let i = 0; i < this.credUser.length; i++) {
      for (let j = 0; j < this.credUser[i].SubMenuList.length; j++) {
        if (
          Child.ActionName.toUpperCase() ===
          this.credUser[i].SubMenuList[j].ActionName.toUpperCase()
        ) {
          this.isChildSelected = true;
          flag = true;

          this.credUser[i].SubMenuList[j].BackgroundColour = ' #e31837';
          this.credUser[i].SubMenuList[j].color = '#ffffff';
          if (count === 0) {
            localStorage.setItem('rolename', null);

            // Set selected sumenu's rolename (Main Menu)
            localStorage.setItem('rolename', this.credUser[i].Role_Name);
            $('#rolenameid').text(this.credUser[i].Role_Name);
            count++;
          }
        } else {
          this.credUser[i].SubMenuList[j].BackgroundColour = '#2c3b41';
          this.credUser[i].SubMenuList[j].color = '#8aa4af';
        }
      }
    }

    if (!flag) {
      this.isChildSelected = false;
    }
  }

  isAllShops(data2) {
    // remove shop master from submenu if user dont have access to allshops
    if (localStorage.getItem('isallshops') !== '1') {
      this.credUser = data2.map((menu) => ({
        ...menu,
        SubMenuList: menu.SubMenuList.filter(
          (submenu) => submenu.ActionName !== 'configmaster/masters/shopmaster'
        ),
      }));
    } else {
      this.credUser = data2;
    }
  }

  storeRoles(data2) {
    //extract role name for authguard
    const firstActionNames: string[] = data2
      .map((user) =>
        user.SubMenuList.length > 0 ? user.SubMenuList[0].ActionName : null
      )
      .filter((actionName) => actionName !== null)
      .map((actionName) => actionName.split('/')[1]);
    const firstActionNamesJSON = JSON.stringify(firstActionNames);
    sessionStorage.setItem('userRoles', firstActionNamesJSON);
  }

  getRights() {
    let rights: any[] = [];
    for (let i = 0; i < this.credUser.length; i++) {
      rights.push({
        Menu_ID: this.credUser[i].Menu_ID,
        Role_Name: this.credUser[i].Role_Name,
        canCreate: this.credUser[i].Is_Create,
        canUpdate: this.credUser[i].Is_Edit,
        canDelete: this.credUser[i].Is_Delete,
      });
    }
    sessionStorage.setItem('rights', JSON.stringify(rights));
    this.CommonService.getUserRights();
  }
}
