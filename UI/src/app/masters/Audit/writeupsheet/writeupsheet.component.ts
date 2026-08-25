import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../common/common.service';
import { AuditService } from '../audit.service';
import { AuditType } from 'src/app/shared/models/audittype.model';
import { Parameter } from 'src/app/shared/models/parameter.model';
import { Area } from 'src/app/shared/models/area.model';
import { DatePipe } from '@angular/common';
import { Part } from 'src/app/shared/models/part.model';
import { CheckPoint } from 'src/app/shared/models/checkpoint.model';
import { Location } from 'src/app/shared/models/location.model';
import { Specification } from '../../../shared/models/specification.model';
import { Tracksheet } from 'src/app/shared/models/tracksheet.model';
import { PopupImageComponent } from 'src/app/shared/components/popup-image/popup-image.component';
import { MatDialog } from '@angular/material/dialog';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
declare var $: any;

@Component({
  selector: 'app-writeupsheet',
  templateUrl: './writeupsheet.component.html',
  styleUrls: ['./writeupsheet.component.css'],
})
export class WriteupsheetComponent implements AfterViewChecked {
  audittypeid: number;
  AuditName: string;
  plantid: number;
  plantname: string;
  shopid: number;
  userid: number;
  hostname: string;
  isTCF: boolean;
  isModify: boolean;
  firstVisit = true;

  // Header
  audittypelist: AuditType[];
  vinno: string;
  biwno: string;
  selectemodelid: number = 1;
  modelname: string;
  auditdate: any;
  auditId: number;

  // calculations
  totalPist: any = 0;
  gapPist: number = 0;
  gapOk = 0;
  gapNok = 0;
  gapNA = 0;
  flushPist: number = 0;
  flushOk = 0;
  flushNok = 0;
  flushNA = 0;
  @ViewChild('readingInput', { static: false }) readingInput!: ElementRef;

  // Parameter
  parameterList: Parameter[];
  selectedParameter: Parameter;

  // area
  areaList: Area[];
  selectedarea: Area;

  // part
  partlist: Part[];
  selectedPart: Part;
  searchPart: string;

  // Check Point
  cpList: CheckPoint[];
  selectedCP: CheckPoint;
  searchCheckpoint: string;

  // Location
  locationList: Location[];
  selectedLocation: Location;
  searchLocation: string;

  // Specification
  specsList: Specification[];
  selectedSpecs: Specification;

  // Second section
  reading: number;
  remark: string;
  isDefect: boolean = false;
  imagePath: string;
  imageid: number;

  loading: boolean = false;
  tabledata: any[];
  selectedForDelete: number;
  Track_Sheet_ID: number;
  pointer: number = 0;

  // other
  allshops: boolean;
  canCreate: boolean = true;
  constructor(
    private commonService: CommonService,
    private router: Router,
    private _toastr: ToastrService,
    private ngZone: NgZone,
    private auditService: AuditService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private cdref: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    $('#ngslide').hide();
    $('.sidebar-mini').addClass('sidebar-collapse');
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false
    this.plantid = parseInt(localStorage.getItem('plantid'));
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    this.userid = parseInt(localStorage.getItem('userid'));
    this.hostname = localStorage.getItem('hostname');
    if (sessionStorage.getItem('vinno')) {
      this.vinno = sessionStorage.getItem('vinno');
      this.onVinChange();
    }
    this.getAuditType();
    if (sessionStorage.getItem('biwno')) {
      this.biwno = sessionStorage.getItem('biwno');
      this.onBIWChange();
    }

    if (!this.audittypeid) {
      this.router.navigate(['']);
      this._toastr.error('Audit Type Not Found');
    }
    setTimeout(() => {
      this.commonService.getUserRights();
      this.canCreate = this.commonService.canCreate();
      localStorage.setItem(
        'canCreate',
        this.commonService.canCreate() ? '1' : '0'
      );
      localStorage.setItem(
        'canUpdate',
        this.commonService.canUpdate() ? '1' : '0'
      );
      localStorage.setItem(
        'canDelete',
        this.commonService.canDelete() ? '1' : '0'
      );
    }, 100);
  }

  ngAfterViewChecked() {
    // console.log('view checked');
    // this.commonService.getUserRights();
    // this.canCreate = this.commonService.canCreate();
    // localStorage.setItem(
    //   'canCreate',
    //   this.commonService.canCreate() ? '1' : '0'
    // );
    // localStorage.setItem(
    //   'canUpdate',
    //   this.commonService.canUpdate() ? '1' : '0'
    // );
    // localStorage.setItem(
    //   'canDelete',
    //   this.commonService.canDelete() ? '1' : '0'
    // );
    // this.cdref.detectChanges();
  }

  // ******************************Declaration  Section End ******************************//
  // ******************************Header  Section Start ******************************//
  onVinChange() {
    const temp = this.vinno;
    this.hardRefresh();
    this.vinno = temp;
    if (this.vinno.length == 17) {
      this.loading = true;
      this.auditService
        .getTrackDataByVinNo(this.vinno, this.audittypeid)
        .subscribe(
          (data) => {
            if (data.length > 0) {
              console.log(data);
              this.vinno = temp;
              this.auditId = data[0].Audit_ID;
              this.selectemodelid = data[0].Model_ID;
              this.modelname = data[0].Model_Name;
              this.auditdate = this.datePipe.transform(
                data[0].Audit_Date,
                'dd/MM/yyyy'
              );
              this.getParameterList();
              this.getTableData();
              this.loading = false;
            } else {
              this._toastr.error(
                'VIN No - ' +
                  this.vinno +
                  ' is not configured yet please Create Audit '
              );
              this.loading = false;

              // this.vinno = null;
            }
          },
          (err) => {
            this._toastr.error(
              'VIN No - ' +
                this.vinno +
                'is not configured yet please Create Audit / Somthing went wrong'
            );
            this.loading = false;
          }
        );
    }
  }

  onBIWChange() {
    debugger;
    const temp = this.biwno;
    this.hardRefresh();
    this.biwno = temp;
    if (this.biwno && this.biwno.length == 10) {
      this.loading = true;

      this.auditService
        .getTrackDataByBIW(this.biwno, this.audittypeid)
        .subscribe(
          (data) => {
            if (data.length > 0) {
              this.auditId = data[0].Audit_ID;
              this.selectemodelid = data[0].Model_ID;
              this.modelname = data[0].Model_Name;
              this.auditdate = this.datePipe.transform(
                data[0].Audit_Date,
                'dd/MM/yyyy'
              );
              this.getParameterList();
              this.getTableData();
              this.loading = false;
            } else {
              this._toastr.error(
                'BIW No - ' +
                  this.biwno +
                  ' is not configured yet please Create Audit '
              );
              this.loading = false;

              // this.biwno = null;
            }
          },
          (err) => {
            this._toastr.error(
              'BIW No - ' +
                this.biwno +
                'is not configured yet please Create Audit / Somthing went wrong'
            );
            this.loading = false;
          }
        );
    }
  }
  // ******************************Header  Section End ******************************//
  // ******************************Parameter  Section Start ******************************//
  getParameterList() {
    this.commonService.getParameter().subscribe((data) => {
      if (data) {
        this.parameterList = data;
        this.onParameterSelect(this.parameterList[0]);
      }
    });
  }

  onParameterSelect(para: Parameter) {
    if (para) {
      this.selectedParameter = para;
      this.reading = null;
      this.remark = null;
      if (this.areaList.length == 0) {
        this.getAreaList();
      } else {
        this.getPartList();
      }
    }
  }
  // ******************************Parameter  Section End ******************************//
  // ******************************Area  Section Start ******************************//
  getAreaList() {
    this.auditService
      .getAreaList(this.selectemodelid, this.audittypeid, this.auditId ?? 0)
      .subscribe((data) => {
        if (data) {
          this.areaList = data;
          this.onAreaSelect(this.areaList[0]);
        }
      });
  }

  onAreaSelect(area: Area) {
    if (area) {
      this.selectedarea = area;
      this.getPartList();
    }
  }
  // ******************************Area  Section End ******************************//
  // ******************************Part  Section Start ******************************//
  getPartList() {
    if (this.selectedarea) {
      this.selectedPart = null;
      this.imageid = null;
      this.auditService
        .getPartList(
          this.selectedParameter.ID,
          this.selectedarea.Area_ID,
          this.audittypeid,
          this.auditId
        )
        .subscribe((data) => {
          if (data) {
            this.partlist = data;
            this.onSelectPart(this.partlist[0]);
          }
        });
    }
  }

  onSelectPart(part: Part) {
    if (part) {
      debugger;
      this.selectedPart = part;
      this.imagePath = null;
      this.locationList = [];
      this.imageid = null;
      this.specsList = [];
      this.selectedLocation = null;
      this.selectedSpecs = null;
      this.searchCheckpoint = null;
      this.getCPList();
      this.getImage();
    }
  }

  getImage() {
    this.auditService
      .getPartWiseImage(this.selectedPart.Part_ID, this.audittypeid)
      .subscribe((data) => {
        if (data.length > 0) {
          this.imagePath = data[0].FileContent;
          this.imageid = data[0].Image_ID;
        }
      });
  }
  closeImage() {}
  // ******************************Part  Section End ******************************//
  // ******************************Checkpoint  Section Start ******************************//
  getCPList() {
    if (this.selectedPart) {
      this.selectedCP = null;
      this.auditService
        .getCPList(
          this.selectedParameter.ID,
          this.selectedPart.Part_ID,
          this.audittypeid,
          this.auditId
        )
        .subscribe((data) => {
          if (data) {
            this.cpList = data;
            this.onSelectCP(data[0]);
          }
        });
    }
  }

  onSelectCP(CP: CheckPoint) {
    if (CP) {
      this.selectedCP = CP;
      this.selectedLocation = null;
      this.selectedSpecs = null;
      this.reading = null;
      this.remark = null;
      this.specsList = [];
      this.getLocationList();
    }
  }
  // ******************************Checkpoint  Section end ******************************//
  // ******************************Location  Section Start ******************************//
  getLocationList() {
    if (this.selectedCP) {
      this.auditService
        .getLocationList(
          this.selectedParameter.ID,
          this.selectedCP.Checkpoint_ID,
          this.audittypeid,
          this.auditId
        )
        .subscribe((data) => {
          if (data) {
            this.locationList = data;
            this.onSelectLocation(data[0]);
          }
        });
    }
  }

  onSelectLocation(Location: Location) {
    if (Location) {
      this.selectedLocation = Location;
      this.getSpecificationList();
    }
  }
  // ******************************Location  Section end ******************************//
  // ******************************Specification  Section Start ******************************//
  getSpecificationList() {
    if (this.selectedLocation) {
      this.selectedSpecs = null;
      this.specsList = [];
      this.auditService
        .getSpecificationList(
          this.selectedParameter.ID,
          this.selectedLocation.Location_ID,
          this.audittypeid
        )
        .subscribe((data) => {
          if (data.length > 0) {
            this.specsList = data;
            this.onSelectSpecs(data[0]);
          }
        });
    }
  }

  onSelectSpecs(Specification: Specification) {
    if (Specification) {
      this.selectedSpecs = Specification;
      if (!this.isModify) {
        this.reading = null;
        this.remark = null;
      }
      setTimeout(() => {
        this.nextInput('readingInput');
      }, 500);
    }
  }
  // ******************************Specification  Section end ******************************//
  // ******************************Calculation  Section Start ******************************//
  onReadingChange() {
    if (!this.reading && this.reading != 0) {
      return;
    }
    if (
      this.reading > this.selectedSpecs.MaxVal &&
      this.selectedParameter.Type.toLowerCase() == 'gap'
    ) {
      this.remark = 'Excess Gap';
      this.isDefect = true;
      this.calculatePointer();
      return;
    }

    if (
      this.reading < this.selectedSpecs.MinVal &&
      this.selectedParameter.Type.toLowerCase() == 'gap'
    ) {
      this.remark = 'Less Gap';
      this.isDefect = true;
      this.calculatePointer();

      return;
    }

    if (
      this.reading > this.selectedSpecs.MaxVal &&
      this.selectedParameter.Type.toLowerCase() == 'flushness'
    ) {
      this.remark = 'Over Flush';
      this.isDefect = true;
      this.calculatePointer();

      return;
    }

    if (
      this.reading < this.selectedSpecs.MinVal &&
      this.selectedParameter.Type.toLowerCase() == 'flushness'
    ) {
      this.remark = 'Under Flush';
      this.isDefect = true;
      this.calculatePointer();
      return;
    }
    this.remark = 'OK';
    this.isDefect = false;
    this.calculatePointer();
  }

  calculatePointer() {
    this.pointer = 0;
    if (this.selectedParameter.Type.toLowerCase() === 'gap') {
      const more1MM = this.selectedSpecs.MaxVal + 1;
      const more3MM = this.selectedSpecs.MaxVal + 3;
      const more10MM = this.selectedSpecs.MaxVal + 10;
      const less1MM = this.selectedSpecs.MinVal - 1;
      const less3MM = this.selectedSpecs.MinVal - 3;
      const less10MM = this.selectedSpecs.MinVal - 10;

      if (this.reading <= less10MM || this.reading >= more10MM) {
        this.pointer = 20;
      } else if (this.reading <= less3MM || this.reading >= more3MM) {
        this.pointer = 10;
      } else if (this.reading <= less1MM || this.reading >= more1MM) {
        this.pointer = 5;
      } else {
        this.pointer = 0;
      }
    } else {
      const more1MM = this.selectedSpecs.MaxVal + 1.5;
      const more2MM = this.selectedSpecs.MaxVal + 2;
      const more3MM = this.selectedSpecs.MaxVal + 3;
      const more7MM = this.selectedSpecs.MaxVal + 10;
      const less1MM = this.selectedSpecs.MinVal - 1.5;
      const less2MM = this.selectedSpecs.MaxVal - 2;
      const less3MM = this.selectedSpecs.MinVal - 3;
      const less7MM = this.selectedSpecs.MinVal - 10;

      if (this.reading <= less7MM || this.reading >= more7MM) {
        this.pointer = 20;
      } else if (this.reading <= less3MM || this.reading >= more3MM) {
        this.pointer = 10;
      } else if (this.reading <= less2MM || this.reading >= more2MM) {
        this.pointer = 5;
      } else if (this.reading <= less1MM || this.reading >= more1MM) {
        this.pointer = 1;
      } else {
        this.pointer = 0;
      }
    }
  }

  async calculatePist() {
    if (!this.tabledata?.length) return;

    // Reset counters using object destructuring
    Object.assign(this, {
      totalPist: 0,
      flushPist: 0,
      gapPist: 0,
      gapOk: 0,
      gapNok: 0,
      flushOk: 0,
      flushNok: 0,
      gapNA: 0,
      flushNA: 0,
    });

    // Use reduce instead of for loop
    const counts = this.tabledata.reduce(
      (acc, item) => {
        if (item.ID === 1) {
          // Gap
          if (item.Is_NA) {
            acc.gapNA++;
          } else if (item.Reading > item.MaxVal || item.Reading < item.MinVal) {
            acc.gapNok++;
          } else {
            acc.gapOk++;
          }
        } else {
          // Flush
          if (item.Is_NA) {
            acc.flushNA++;
          } else if (item.Reading > item.MaxVal || item.Reading < item.MinVal) {
            acc.flushNok++;
          } else {
            acc.flushOk++;
          }
        }
        return acc;
      },
      {
        gapOk: 0,
        gapNok: 0,
        gapNA: 0,
        flushOk: 0,
        flushNok: 0,
        flushNA: 0,
      }
    );

    // Update class properties
    Object.assign(this, counts);

    // Calculate percentages
    const totalGapChecked = this.gapOk + this.gapNok;
    const totalFlushChecked = this.flushOk + this.flushNok;

    if (totalGapChecked > 0) {
      this.gapPist = Number(((this.gapOk / totalGapChecked) * 100).toFixed(2));
    }

    if (totalFlushChecked > 0) {
      this.flushPist = Number(
        ((this.flushOk / totalFlushChecked) * 100).toFixed(2)
      );
    }

    const totalChecked = totalGapChecked + totalFlushChecked;
    if (totalChecked > 0) {
      this.totalPist = Number(
        (((this.gapOk + this.flushOk) / totalChecked) * 100).toFixed(2)
      );
    }

    // Update calculations if not first visit
    if (!this.firstVisit) {
      this.updateCalculations();
    }
    // if (this.tabledata) {
    //   this.totalPist = 0;
    //   this.flushPist = 0;
    //   this.gapPist = 0;
    //   this.gapOk = 0;
    //   this.gapNok = 0;
    //   this.flushOk = 0;
    //   this.flushNok = 0;
    //   this.gapNA = 0;
    //   this.flushNA = 0;

    //   for (let i = 0; i < this.tabledata.length; i++) {
    //     if (this.tabledata[i].ID === 1) {
    //       if (this.tabledata[i].Is_NA) {
    //         this.gapNA++;
    //         continue;
    //       }
    //       if (
    //         this.tabledata[i].Reading > this.tabledata[i].MaxVal ||
    //         this.tabledata[i].Reading < this.tabledata[i].MinVal
    //       ) {
    //         this.gapNok++;
    //       } else {
    //         this.gapOk++;
    //       }
    //       this.gapPist = (this.gapOk / (this.gapOk + this.gapNok)) * 100;
    //     } else {
    //       if (this.tabledata[i].Is_NA) {
    //         this.flushNA++;
    //         continue;
    //       }
    //       if (
    //         this.tabledata[i].Reading > this.tabledata[i].MaxVal ||
    //         this.tabledata[i].Reading < this.tabledata[i].MinVal
    //       ) {
    //         this.flushNok++;
    //       } else {
    //         this.flushOk++;
    //       }

    //       this.flushPist =
    //         (this.flushOk / (this.flushOk + this.flushNok)) * 100;
    //     }
    //     this.gapPist = parseFloat(this.gapPist.toFixed(2));
    //     this.flushPist = parseFloat(this.flushPist.toFixed(2));
    //     const totalGapChceked = this.gapOk + this.gapNok;
    //     const totalFlushChceked = this.flushOk + this.flushNok;
    //     if (this.gapPist || this.flushPist) {
    //       this.totalPist =
    //         ((this.gapOk + this.flushOk) /
    //           (totalFlushChceked + totalGapChceked)) *
    //         100;
    //       this.totalPist = parseFloat(this.totalPist).toFixed(2);
    //     }
    //   }

    //   if (!this.firstVisit) {
    //     this.updateCalculations();
    //   }
    // }
  }

  updateCalculations() {
    const temp = {
      Gap_PIST: this.gapPist,
      Gap_Total_Check: this.gapOk + this.gapNok + this.gapNA,
      Gap_Ok: this.gapOk,
      Gap_Nok: this.gapNok,
      Gap_NA: this.gapNA,
      Flush_PIST: this.flushPist,
      Flush_Total_Check: this.flushOk + this.flushNok + this.flushNA,
      Flush_Ok: this.flushOk,
      Flush_Nok: this.flushNok,
      Flush_NA: this.flushNA,
      Total_PIST: this.totalPist,
    };

    this.auditService
      .updateCalculations(this.auditId, temp)
      .subscribe((data) => {
        console.log(data);
      });
  }
  // ******************************Calculation  Section End ******************************//

  // ******************************Save,Update,delete  Section Start ******************************//
  onSave() {
    if (this.loading) {
      return;
    }
    if (!this.selectedParameter) {
      this._toastr.warning('Please Select Parameter ');
      return;
    }
    if (!this.selectedarea) {
      this._toastr.warning('Please Select Area ');
      return;
    }
    if (!this.selectedPart) {
      this._toastr.warning('Please Select Part ');
      return;
    }
    if (!this.selectedCP) {
      this._toastr.warning('Please Select Check Point ');
      return;
    }
    if (!this.selectedLocation) {
      this._toastr.warning('Please Select Location ');
      return;
    }
    if (!this.selectedSpecs) {
      this._toastr.warning('Please Select Specification ');
      return;
    }
    if (!this.reading && this.reading !== 0) {
      this._toastr.warning('Please Enter Reading ');
      return;
    }
    if (this.isModify) {
      this.updateRecord();
      return;
    }
    const tempData: Tracksheet = {
      Audit_Type_Id: this.audittypeid,
      Plant_ID: this.plantid,
      Shop_ID: this.shopid,
      Inserted_User_ID: this.userid,
      Inserted_Host: this.hostname,
      Audit_ID: this.auditId,
      Parameter_ID: this.selectedParameter.ID,
      Area_ID: this.selectedarea.Area_ID,
      Part_ID: this.selectedPart.Part_ID,
      Checkpoint_ID: this.selectedCP.Checkpoint_ID,
      Location_ID: this.selectedLocation.Location_ID,
      Specification_ID: this.selectedSpecs.Specification_ID,
      Image_ID: this.imageid,
      Reading: this.reading.toString(),
      Remark: this.remark,
      Plant_Code: localStorage.getItem('Plant_Code'),
    };

    this.auditService.saveRecord(tempData).subscribe(
      (data) => {
        if (data.isErrorMessage) {
          this._toastr.error(data.messageDetail, data.messageTitle);
        } else if (data.isSuccessMessage) {
          this.firstVisit = false;
          this.refresh();
          this.getTableData();
          this._toastr.success(data.messageDetail, data.messageTitle);
        } else if (data.isAlertMessage) {
          this._toastr.warning(data.messageDetail, data.messageTitle);
        } else {
          this._toastr.error(data.messageDetail, data.messageTitle);
        }
      },
      (err) => {
        this._toastr.error('Bad Request');
      }
    );
  }
  updateRecord() {
    if (this.loading) {
      return;
    }
    if (!this.selectedParameter) {
      this._toastr.warning('Please Select Parameter ');
      return;
    }
    if (!this.selectedarea) {
      this._toastr.warning('Please Select Area ');
      return;
    }
    if (!this.selectedPart) {
      this._toastr.warning('Please Select Part ');
      return;
    }
    if (!this.selectedCP) {
      this._toastr.warning('Please Select Check Point ');
      return;
    }
    if (!this.selectedLocation) {
      this._toastr.warning('Please Select Location ');
      return;
    }
    if (!this.selectedSpecs) {
      this._toastr.warning('Please Select Specification ');
      return;
    }
    if (!this.reading && this.reading !== 0) {
      this._toastr.warning('Please Enter Reading ');
      return;
    }
    const tempData: Tracksheet = {
      Track_Sheet_ID: this.Track_Sheet_ID,
      Audit_Type_Id: this.audittypeid,
      Plant_ID: this.plantid,
      Shop_ID: this.shopid,
      Updated_User_ID: this.userid,
      Updated_Host: this.hostname,
      Audit_ID: this.auditId,
      Parameter_ID: this.selectedParameter.ID,
      Area_ID: this.selectedarea.Area_ID,
      Part_ID: this.selectedPart.Part_ID,
      Checkpoint_ID: this.selectedCP.Checkpoint_ID,
      Location_ID: this.selectedLocation.Location_ID,
      Specification_ID: this.selectedSpecs.Specification_ID,
      Image_ID: this.imageid,
      Reading: this.reading.toString(),
      Remark: this.remark,
      Plant_Code: localStorage.getItem('Plant_Code'),
    };

    this.auditService.updateRecord(this.Track_Sheet_ID, tempData).subscribe(
      (data) => {
        if (data.isErrorMessage) {
          this._toastr.error(data.messageDetail, data.messageTitle);
        } else if (data.isSuccessMessage) {
          this.firstVisit = false;
          this.refresh();
          this.getTableData();
          this._toastr.success(data.messageDetail, data.messageTitle);
        } else if (data.isAlertMessage) {
          this._toastr.warning(data.messageDetail, data.messageTitle);
        } else {
          this._toastr.error(data.messageDetail, data.messageTitle);
        }
      },
      (err) => {
        this._toastr.error('Bad Request');
      }
    );
  }
  DeleteRecord() {
    if (this.selectedForDelete) {
      this.auditService.deleteRecord(this.selectedForDelete).subscribe(
        (data) => {
          if (data == null || data == undefined || data == '') {
            this._toastr.error(
              'Can not delete  Record  ',
              'Unable to Connect to server! '
            );
          } else if (data.isErrorMessage) {
            this._toastr.error(data.messageDetail, data.messageTitle);
          } else if (data.isSuccessMessage) {
            this.firstVisit = false;

            this.getTableData();
            this.selectedForDelete = null;
            this._toastr.success(data.messageDetail, data.messageTitle);
          } else if (data.isAlertMessage) {
            this._toastr.warning(data.messageDetail, data.messageTitle);
          } else {
            this._toastr.error(data.messageDetail, data.messageTitle);
          }
        },
        (err) => {
          this._toastr.error('Bad Request');
        }
      );
    }
  }

  closeDeleteRecord() {
    this.selectedForDelete = 0;
    $('.close').click();
  }

  modifySelected(wrid) {
    if (wrid) {
      const temp = this.tabledata.find((data) => data.Track_Sheet_ID === wrid);
      if (temp) {
        this.Track_Sheet_ID = temp.Track_Sheet_ID;
        this.reading = temp.Reading;
        this.remark = temp.Remark;
        this.imagePath = temp.FileContent;
        this.imageid = temp.Image_ID;
        this.isDefect =
          temp.Reading > temp.MaxVal || temp.Reading < temp.MinVal;
        this.selectedParameter = this.parameterList.find(
          (par) => par.ID === temp.ID
        );

        if (this.areaList.length == 0 || !this.areaList) {
          this.commonService
            .getAreaList(this.selectemodelid, this.audittypeid)
            .subscribe((data) => {
              if (data) {
                this.areaList = data;
                this.selectedarea = this.areaList.find(
                  (par) => par.Area_ID === temp.Area_ID
                );
              }
            });
        } else {
          this.selectedarea = this.areaList.find(
            (par) => par.Area_ID === temp.Area_ID
          );
        }
        // Get part
        this.auditService.getPartById(temp.Part_ID).subscribe((data) => {
          if (data) {
            this.partlist = data;
            this.selectedPart = data[0];
          }
        });

        // get Chceklist
        this.auditService.getCPByID(temp.Checkpoint_ID).subscribe((data) => {
          if (data) {
            this.cpList = data;
            this.selectedCP = data[0];
          }
        });
        this.isModify = true;

        // get Location
        this.auditService.getLocByID(temp.Location_ID).subscribe((data) => {
          if (data) {
            this.locationList = data;
            this.selectedLocation = data[0];
            this.getSpecificationList();
          }
        });

        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
      }
    }
  }

  updateNA() {
    if (this.loading) {
      return;
    }
    if (!this.selectedParameter) {
      this._toastr.warning('Please Select Parameter ');
      return;
    }
    if (!this.selectedarea) {
      this._toastr.warning('Please Select Area ');
      return;
    }
    if (!this.selectedPart) {
      this._toastr.warning('Please Select Part ');
      return;
    }
    if (!this.selectedCP) {
      this._toastr.warning('Please Select Check Point ');
      return;
    }
    if (!this.selectedLocation) {
      this._toastr.warning('Please Select Location ');
      return;
    }

    const temp = {
      Audit_ID: this.auditId,
      Parameter_ID: this.selectedParameter.ID,
      Area_ID: this.selectedarea.Area_ID,
      Part_ID: this.selectedPart.Part_ID,
      Checkpoint_ID: this.selectedCP.Checkpoint_ID,
      Location_ID: this.selectedLocation.Location_ID,
      Specification_ID: this.selectedSpecs.Specification_ID,
      Image_ID: this.imageid,
      Plant_ID: this.plantid,
      Shop_ID: this.shopid,
      Audit_Type_Id: this.audittypeid,
      Inserted_Host: this.hostname,
      Inserted_User_ID: this.userid,
      Remark: 'NA',
    };

    this.auditService.updateNA(temp).subscribe(
      (data) => {
        if (data.isErrorMessage) {
          this._toastr.error(data.messageDetail, data.messageTitle);
        } else if (data.isSuccessMessage) {
          this.firstVisit = false;
          this.refresh();
          this.getTableData();
          this._toastr.success(data.messageDetail, data.messageTitle);
        } else if (data.isAlertMessage) {
          this._toastr.warning(data.messageDetail, data.messageTitle);
        } else {
          this._toastr.error(data.messageDetail, data.messageTitle);
        }
      },
      (err) => {
        this._toastr.error('Bad request');
      }
    );
  }
  // ******************************Save,Update,delete  Section End ******************************//
  // ******************************Table  Section End ******************************//
  getTableData() {
    this.loading = true;
    if (this.plantid && this.auditId) {
      this.auditService
        .getTableData(this.plantid, this.auditId, this.audittypeid)
        .subscribe(
          (data) => {
            this.tabledata = data;
            this.calculatePist();
            this.LoadTable(data);
            this.loading = false;
          },
          (err) => {
            this.loading = false;
            this._toastr.error(err.message);
          }
        );
    }
  }

  LoadTable(jsondatas) {
    if (<any>$.fn.DataTable.isDataTable('#shopmodeltable')) {
      $('#shopmodeltable').dataTable().fnDestroy();
    }

    <any>$('#shopmodeltable').DataTable({
      destroy: true,
      lengthMenu: [
        [-1, 50, 25, 10, 5],
        ['All', 50, 25, 10, 5],
      ],
      data: jsondatas,
      columnDefs: [
        { title: 'Parameter', targets: 0 },
        { title: 'Area', targets: 1 },
        { title: 'Part_Name', targets: 2 },
        { title: 'Checkpoint', targets: 3 },
        { title: 'Location', targets: 4 },
        { title: 'Specification', targets: 5 },
        { title: 'Reading', targets: 6 },
        { title: 'Remark', targets: 7 },
        { title: 'Action', targets: 8 },
      ],

      columns: [
        { data: 'Type' },
        { data: 'Area_Name' },
        {
          data: 'Part_Name',
        },
        { data: 'Checkpoint_Name' },
        { data: 'Location_Name' },
        { data: 'Specification_Name' },
        {
          data: 'Reading',
          render: function (data, type, row) {
            var isOutOfRange = data < row.MinVal || data > row.MaxVal;
            var color = isOutOfRange ? 'red' : 'black';

            return `<span style="color: ${color};">${data}</span>`;
          },
        },
        { data: 'Remark' },
        {
          data: null,
          render: function (data, type, row) {
            if (row.Is_NA) {
              return `<div class="text-center" style="text-align:center;"> <span id="deleteaudit" class="btn fa fa-trash-o deletebutton" style="border-radius: 50%!important;
      background-color: #0b9494; 
      color: black!important;"   title = "Delete" 
             data-element-id="${data.Track_Sheet_ID}"></span> </div>`;
            }

            return `  <div class="text-center" style="text-align:center;">
     <span id="modifyaudit" class="btn fa fa-pencil" data-toggle="modal" title="Edit" 
           data-target="#mymodal" style="border-radius: 50%!important;
           background-color: #0b9494;
           color: black;"
           data-elemnt-obj="${data.Track_Sheet_ID}"></span>  
    <span id="deleteaudit" class="btn fa fa-trash-o deletebutton" style="border-radius: 50%!important;
    background-color: #0b9494; 
    color: black!important;"  title = "Delete" 
           data-element-id="${data.Track_Sheet_ID}"></span> </div> `;
          },
          createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {
            // Add an event listener for the "Edit" button
            $(cell).on('click', '#modifyaudit', () => {
              this.ngZone.run(() => {
                this.modifySelected(rowData.Track_Sheet_ID);
              });
            });

            $(cell).on('click', '#deleteaudit', () => {
              this.ngZone.run(() => {
                const dialogRef = this.dialog.open(DeletePopupComponent, {
                  width: '250px',
                  enterAnimationDuration: '0ms',
                  exitAnimationDuration: '0ms',
                });
                dialogRef.afterClosed().subscribe((result) => {
                  console.log('The dialog was closed' + result);
                  if (result) {
                    this.selectedForDelete = rowData.Track_Sheet_ID;
                    this.DeleteRecord();
                  }
                });
              });
            });
          },
        },
      ],
      ordering: false, // Disable sorting
    });
  }
  // ******************************Table  Section End ******************************//
  // ******************************Other  Section Start ******************************//

  getAuditType() {
    this.commonService.getAuditTypeList().subscribe((data) => {
      this.audittypelist = data;
      this.AuditName = this.audittypelist.find(
        (a) => a.Audit_Type_Id == this.audittypeid
      ).Audit_Type;

      if (
        this.AuditName.toLowerCase() == '1d tcf' ||
        this.AuditName.toLowerCase() == '1d-tcf'
      ) {
        this.isTCF = true;
      }
    });
  }

  onCancel() {
    this.refresh();
    this.getPartList();
  }
  refresh() {
    this.remark = null;
    this.reading = null;
    this.selectedSpecs = null;
    this.specsList = [];
    this.selectedForDelete = null;
    this.Track_Sheet_ID = null;
    if (!this.auditId) {
      return;
    }
    if (this.isModify) {
      this.reading = null;
      this.remark = null;
      this.selectedCP = null;
      this.selectedLocation = null;
      this.selectedPart = null;
      this.selectedSpecs = null;
      this.imagePath = null;
      this.isModify = false;
      this.searchCheckpoint = null;
      this.searchLocation = null;
      this.searchPart = null;
      this.imageid = null;

      // Arrays
      this.cpList = [];
      this.locationList = [];
      this.specsList = [];
      this.partlist = [];
    }
    this.locationList = this.locationList.filter(
      (loc) => loc.Location_ID !== this.selectedLocation.Location_ID
    );
    this.selectedLocation = null;
    if (this.locationList.length > 0) {
      this.onSelectLocation(this.locationList[0]);
      return;
    }

    this.cpList = this.cpList.filter(
      (cp) => cp.Checkpoint_ID !== this.selectedCP.Checkpoint_ID
    );

    this.selectedCP = null;
    if (this.cpList.length > 0) {
      this.onSelectCP(this.cpList[0]);
      return;
    }

    this.partlist = this.partlist.filter(
      (part) => part.Part_ID !== this.selectedPart.Part_ID
    );
    this.imagePath = null;
    this.imageid = null;
    this.selectedPart = null;
    if (this.partlist.length > 0) {
      this.onSelectPart(this.partlist[0]);
      return;
    }

    // this.areaList = this.areaList.filter(
    //   (part) => part.Area_ID !== this.selectedarea.Area_ID
    // );
    this.selectedarea = null;
    if (this.areaList.length > 0) {
      this.onAreaSelect(this.areaList[0]);
      return;
    } else {
      this.onParameterSelect(this.parameterList[1]);
    }
  }
  hardRefresh() {
    this.vinno = null;
    this.biwno = null;
    this.auditId = null;
    this.reading = null;
    this.remark = null;
    this.selectedCP = null;
    this.selectedLocation = null;
    this.selectedParameter = null;
    this.selectedPart = null;
    this.imageid = null;
    this.selectedSpecs = null;
    this.selectedarea = null;
    this.imagePath = null;
    this.modelname = null;
    this.auditdate = null;
    this.totalPist = 0;
    this.gapPist = 0;
    this.gapOk = 0;
    this.gapNok = 0;
    this.gapNA = 0;
    this.flushPist = 0;
    this.flushOk = 0;
    this.flushNok = 0;
    this.flushNA = 0;
    this.refresh();

    // Arrays
    this.areaList = [];
    this.partlist = [];
    this.cpList = [];
    this.locationList = [];
    this.specsList = [];
    this.tabledata = [];

    this.LoadTable(this.tabledata);
  }
  ngOnDestroy() {
    sessionStorage.removeItem('vinno');
    sessionStorage.removeItem('biwno');
  }
  openDialog() {
    const dialogRef = this.dialog.open(PopupImageComponent, {
      data: this.imagePath,
    });
  }

  // nextInput(next: string) {
  //   const inputMap = {
  //     readingInput: this.readingInput?.nativeElement,
  //     enter: this.onSave.bind(this),
  //   };

  //   const target = inputMap[next];
  //   if (target) {
  //     if (typeof target === 'function') {
  //       target(); // Call the function (onSave)
  //     } else {
  //       target.focus(); // Focus the input element
  //     }
  //   }
  // }
  nextInput(next: string) {
    if (next == 'readingInput') {
      const inputElement = document.getElementById(
        'reading'
      ) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    } else if (next === 'enter') {
      this.onSave();
    }
  }

  exit() {
    // this.router.navigate(['/configmaster']);
    this.router.navigate(['/configmaster/audit/createaudit'], {
      relativeTo: this.route,
    });
  }

  // ******************************Other  Section End ******************************//
}
