
import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ReportsService } from '../reports.service';
declare var $: any;

@Component({
  selector: 'app-graphicalreport-calculated-limits',
  templateUrl: './graphicalreport-calculated-limits.component.html',
  styleUrls: ['./graphicalreport-calculated-limits.component.css'],
})
export class GraphicalreportCalculatedLimitsComponent {
  @Input() startdate: string;
  @Input() enddate: string;
  @Input() audittypeid: any;
  @Input() locationId: any;
  @Input() parameterId: any;

  // audittypeid: number;
  // AuditName: string;
  // plantid: number;
  // plantname: string;
  // shopid: number;
  // userid: number;
  // username: string;
  // hostname: string;
  // loading: boolean = false;
  // modellist: Model[];
  // selectedModel: Model;
  Show_Report: boolean = false;
  reportUrl: any;
  // currentDate: Date = new Date();
  // // selectedMonth: number = this.currentDate.getMonth() + 1; // Months are zero-based
  // // selectedYear: number = this.currentDate.getFullYear();
  // // AuditType
  // selectedAuditType: AuditType;
  // AuditTypelist: any[];

  // // Area
  // AreaList: Area[];
  // selectedArea: Area;
  // AreaFilter: FormControl = new FormControl();
  // // Part
  // PartList: Part[];
  // selectedPart: Part;
  // PartFilter: FormControl = new FormControl();

  // // CheckPoint
  // CheckPointList: CheckPoint[];
  // selectedCheckPoint: CheckPoint;
  // CheckPointFilter: FormControl = new FormControl();

  // // Location
  // locationList: Location[];
  // selectedLocation: Location;
  // locationFilter: FormControl = new FormControl();

  // // Parameter
  // ParameterList: Parameter[];
  // selectedParameter: Parameter;
  // // Other
  // allshops: boolean = false;

  // // Date
  // startdate: any;
  // enddate: any;
  // AuditDateList: any[];
  // @ViewChild('startdatepicker1', {
  //   read: MatInput,
  // })
  // startdatepicker1: MatInput;
  // @ViewChild('enddatepicker1', {
  //   read: MatInput,
  // })
  // enddatepicker1: MatInput;
  // realstartDate: Date;
  constructor(
    private sanitizer: DomSanitizer,
    private reportService: ReportsService
  ) {}
  ngOnInit() {
    //   $('#ngslide').hide();
    //   $('.sidebar-mini').addClass('sidebar-collapse');
    //   this.plantid = parseInt(localStorage.getItem('plantid'));
    //   this.shopid = parseInt(localStorage.getItem('shopid'));
    //   this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    //   this.userid = parseInt(localStorage.getItem('userid'));
    //   this.allshops = localStorage.getItem('isallshops') === '1';
    //   this.hostname = localStorage.getItem('hostname');
    //   if (!this.plantid || !this.shopid || !this.userid) {
    //     this.router.navigate(['']);
    //   }
    //   this.getaudittypelist();
    //   this.getModelList();
    //   this.commonService.getParameter().subscribe((data) => {
    //     this.ParameterList = data;
    //   });

    //   this.commonService.getPlantname(this.plantid).subscribe((data) => {
    //     this.plantname = data.toLowerCase();
    //   });
    this.loadReport();
  }

  ngOnChanges(changes: SimpleChanges) {
    const watched = [
      'startdate',
      'enddate',
      'locationId',
      'parameterId',
      'Checkpoint_ID',
      'Part_ID',
      'Area_ID',
      'Model_ID',
    ];
    const anyChanged = watched.some((k) => !!changes[k]);

    if (anyChanged) {
      this.loadReport();
    }
  }

  //   this.commonService.getPlantname(this.plantid).subscribe((data) => {
  //     this.plantname = data.toLowerCase();
  //   });
  // }

  // // ********************************** AuditType Section Start *******************************//
  // getaudittypelist() {
  //   this.selectedAuditType = null;
  //   this.AuditTypelist = [];
  //   this.commonService.getAuditTypeList().subscribe((res) => {
  //     this.AuditTypelist = res;
  //     this.AuditName = this.AuditTypelist.find((a) => a.Audit_Type_Id === this.audittypeid).Audit_Type;
  //   });
  // }
  // // ********************************** AuditType Section End *******************************//

  // // ************************************ model Section Start *****************************//
  // onSelectModel(model) {
  //   if (model) {
  //     this.selectedModel = model.value;
  //     this.getAreaList();
  //   }
  // }

  // getModelList() {
  //   if (this.shopid) {
  //     this.commonService
  //       .getModelTableData(
  //         this.plantid,
  //         this.audittypeid,
  //         this.shopid,
  //         this.allshops
  //       )
  //       .subscribe((res) => {
  //         this.modellist = res;
  //       });
  //   } else {
  //     this.router.navigate(['/']);
  //   }
  // }

  // // ************************************ model Section End ****************************//

  // // ************************************ Date  Section Start ****************************//

  // // setMonthAndYear(
  // //   normalizedMonthAndYear: Moment,
  // //   datepicker: MatDatepicker<Moment>
  // // ) {
  // //   const ctrlValue = this.date.value!;
  // //   ctrlValue.month(normalizedMonthAndYear.month());
  // //   ctrlValue.year(normalizedMonthAndYear.year());
  // //   this.date.setValue(ctrlValue);
  // //   datepicker.close();
  // //   this.selectedMonth = normalizedMonthAndYear.month() + 1;
  // //   this.selectedYear = normalizedMonthAndYear.year();

  // //   this.viewReport();
  // // }

  // onStartDateChange(event: any) {
  //   if (event.value) {
  //     this.realstartDate = event.value;
  //     this.startdate = this.datePipe.transform(event.value, 'yyyy-MM-dd');

  //     if (this.startdate && this.enddate && this.selectedParameter && this.selectedLocation) {
  //       this.viewReport();
  //     }
  //   }
  // }

  // onEndDateChange(event: any) {
  //   if (event.value) {
  //     this.enddate = this.datePipe.transform(event.value, 'yyyy-MM-dd');

  //     if (this.startdate && this.enddate && this.selectedParameter && this.selectedLocation) {
  //       this.viewReport();
  //     }
  //   }
  // }

  // // ************************************ Date Section End *******************************//

  // // ************************************ Area Section Start ***************************//
  // getAreaList() {
  //   this.AreaList = [];
  //   this.commonService
  //     .getAreaList(this.selectedModel.Model_ID, this.audittypeid)
  //     .subscribe((data) => {
  //       this.AreaList = data;
  //     });
  // }

  // selectArea(Area: any) {
  //   if (Area) {
  //     this.selectedArea = Area.value;
  //     this.getPartList()
  //   }
  // }
  // // ********************************** Area Section End *******************************//

  // // ************************************ Part Section Start ***************************//
  // getPartList() {
  //   this.PartList = [];
  //   this.commonService
  //     .getPartList(this.selectedArea.Area_ID, this.audittypeid)
  //     .subscribe((data) => {
  //       this.PartList = data;
  //     });
  // }

  // selectPart(Part: any) {
  //   if (Part) {
  //     this.selectedPart = Part.value;
  //     this.getCPList()
  //   }
  // }
  // // ********************************** Part Section End *******************************//

  // // ************************************ CP Section Start ***************************//
  // getCPList() {
  //   this.CheckPointList = [];
  //   this.commonService
  //     .getCPList(this.selectedPart.Part_ID, this.audittypeid)
  //     .subscribe((data) => {
  //       this.CheckPointList = data;
  //     });
  // }

  // selectCP(CP: any) {
  //   if (CP) {
  //     this.selectedCheckPoint = CP.value;
  //     this.getLocationList()
  //   }
  // }
  // // ********************************** CP Section End *******************************//

  // // ************************************ Location Section Start ***************************//
  // getLocationList() {
  //   this.locationList = [];
  //   this.commonService
  //     .getLocationList(this.selectedCheckPoint.Checkpoint_ID, this.audittypeid)
  //     .subscribe((data) => {
  //       console.log(data)
  //       this.locationList = data;
  //     });
  // }

  // onSelectLocation(Location: any) {
  //   if (Location) {
  //     this.selectedLocation = Location.value;
  //     if (this.selectedLocation.Is_Gap && this.selectedLocation.Is_Flushness) {
  //       this.selectedParameter = null;
  //       return;
  //     }
  //     if (this.selectedLocation.Is_Gap && !this.selectedLocation.Is_Flushness) {
  //       this.selectedParameter = this.ParameterList.find((p) => p.Type.toLowerCase() === 'gap');
  //       this.viewReport();
  //     } else {
  //       this.selectedParameter = this.ParameterList.find((p) => p.Type.toLowerCase() === 'flushness');
  //       this.viewReport();
  //     }
  //   }
  // }
  // // ********************************** Parameter Section End *******************************//
  // onSelectParameter(e) {
  //   this.viewReport();
  // }
  // // ************************************ Report generate Section Start ***************************//

  // viewReport() {

  //   if (!this.selectedModel) {
  //     this.toaster.warning('Please select Model');
  //     return;
  //   }
  //   // if (!this.selectedMonth && !this.selectedYear) {
  //   //   this.toaster.warning('Please select Month');
  //   //   return;
  //   // }
  //   if (!this.selectedArea) {
  //     this.toaster.warning('Please select Area');
  //     return;
  //   }
  //   if (!this.selectedPart) {
  //     this.toaster.warning('Please select part');
  //     return;
  //   }
  //   if (!this.selectedCheckPoint) {
  //     this.toaster.warning('Please select check point');
  //     return;
  //   }
  //   if (!this.selectedLocation) {
  //     this.toaster.warning('Please select Location');
  //     return;
  //   }
  //   if (!this.selectedParameter) {
  //     this.toaster.warning('Please select parameter');
  //     return;
  //   }
  //   this.viewReportTorque();
  // }

  loadReport() {
    switch (localStorage.getItem('Plant_Code').toUpperCase()) {
      case 'A003':
        this.Show_Report = true;
        this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.reportService.getStartreportlink() +
            '%2f1D_BIW_TCF%2f1D_Graphics_Audit_Calculated_Limits' +
            '&StartDate=' +
            this.startdate +
            '&EndDate=' +
            this.enddate +
            '&Audit_Type_Id=' +
            this.audittypeid +
            '&Location_ID=' +
            this.locationId +
            '&Parameter_ID=' +
            this.parameterId
        );
        break;
        case 'CK01':
          this.Show_Report = true;
          this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.reportService.getChakanReportUrl() +
             '%2f1D_BIW_TCF%2f1D_Graphics_Audit_Calculated_Limits' +
            '&StartDate=' +
            this.startdate +
            '&EndDate=' +
            this.enddate +
            '&Audit_Type_Id=' +
            this.audittypeid +
            '&Location_ID=' +
            this.locationId +
            '&Parameter_ID=' +
            this.parameterId
          );
          break;
        case 'A002':
          this.Show_Report = true;
          this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.reportService.getKNDReportUrl() +
             '%2f1D_BIW_TCF%2f1D_Graphics_Audit_Calculated_Limits' +
            '&StartDate=' +
            this.startdate +
            '&EndDate=' +
            this.enddate +
            '&Audit_Type_Id=' +
            this.audittypeid +
            '&Location_ID=' +
            this.locationId +
            '&Parameter_ID=' +
            this.parameterId
          );
        break;
        case 'A010':
          this.Show_Report = true;
          this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.reportService.getHaridwarReportUrl() +
             '%2f1D_BIW_TCF%2f1D_Graphics_Audit_Calculated_Limits' +
            '&StartDate=' +
            this.startdate +
            '&EndDate=' +
            this.enddate +
            '&Audit_Type_Id=' +
            this.audittypeid +
            '&Location_ID=' +
            this.locationId +
            '&Parameter_ID=' +
            this.parameterId
          );
        break;
      default:
        alert('Plant name error !!! plant name not found');
        break;
    }
  }
  // ************************************ Report generate Section End **********************//
}
