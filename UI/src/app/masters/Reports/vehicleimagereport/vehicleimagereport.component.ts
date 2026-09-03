import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  NgZone,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { shop } from 'src/app/shared/models/shop.model';
import { Model } from 'src/app/shared/models/model.model';
import { Area } from 'src/app/shared/models/area.model';
import { Part } from 'src/app/shared/models/part.model';
import { CheckPoint } from 'src/app/shared/models/checkpoint.model';
import { VehicleImage } from 'src/app/shared/models/vehicleimage.model';
import {
  AuditedVehicle,
  ImageReportRow,
  ReportPoint,
} from 'src/app/shared/models/vehicleimagereport.model';
import { CommonService } from 'src/app/masters/common/common.service';
import { ReportsService } from '../reports.service';
import { ReadingChartsComponent } from './reading-charts/reading-charts.component';
declare var $: any;

@Component({
  selector: 'app-vehicleimagereport',
  templateUrl: './vehicleimagereport.component.html',
  styleUrls: ['./vehicleimagereport.component.css'],
  providers: [DatePipe],
})
export class VehicleimagereportComponent {
  //Developer = Satish Jadhav
  // Token No.= 50005817
  // New Development
  // ********************************** Declaration Section Start *******************************//
  audittypeid: number;
  userid: number;
  plantid: number;
  shopid: number;
  allshops: boolean;
  loading: boolean = true;

  // Shop / Model
  shoplist: shop[] = [];
  selectedShop: shop;
  modelList: Model[] = [];
  selectedmodel: Model;

  // Report type : 'vin' = VIN / BIW wise , 'range' = date range wise ,
  //               'lastn' = last N audits
  reportType: string = 'vin';
  lastNCount: number = 10;
  // VIN wise shows one reading only , the charts need a series , so they
  // fall back to the last 30 audits
  readonly DEFAULT_CHART_AUDITS = 30;
  startdate: string;
  enddate: string;
  startDateValue: Date;
  endDateValue: Date;

  // Audited vehicles
  vehicleList: AuditedVehicle[] = [];
  selectedVehicle: AuditedVehicle;

  // Vehicle image
  modelImageList: VehicleImage[] = [];
  selectedImage: VehicleImage;
  imageMaxWidth: string = 'none';
  private imageRatio: number = 0;

  // Filters
  AreaList: Area[] = [];
  selectedArea: Area;
  partList: Part[] = [];
  selectedPart: Part;
  cpList: CheckPoint[] = [];
  selectedCP: CheckPoint;
  parameterList: any[] = [];
  selectedParameter: any;
  viewMode: string = 'all'; // 'all' = overall , 'nok' = Not Ok only

  // Report data
  reportRows: ImageReportRow[] = [];
  allPoints: ReportPoint[] = [];
  filteredPoints: ReportPoint[] = [];
  selectedPoint: ReportPoint;

  // Counts shown on the top
  vehicleCount: number = 0;
  okCount: number = 0;
  nokCount: number = 0;
  nodataCount: number = 0;

  constructor(
    private commonService: CommonService,
    private reportsService: ReportsService,
    private toaster: ToastrService,
    private router: Router,
    private ngZone: NgZone,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private cdref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    $('#ngslide').hide();
    $('.sidebar-mini').addClass('sidebar-collapse');
    $(window).scrollTop(0);
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false
    this.audittypeid = this.commonService.getAuditType();
    this.userid = this.commonService.getUserID();
    this.plantid = this.commonService.getplantID();

    // by default last 30 days
    const today = new Date();
    const before = new Date();
    before.setDate(today.getDate() - 30);
    this.startDateValue = before;
    this.endDateValue = today;
    this.startdate = this.datePipe.transform(before, 'yyyy-MM-dd');
    this.enddate = this.datePipe.transform(today, 'yyyy-MM-dd');

    this.getShopList();
    this.getParameterList();
  }

  ngAfterViewChecked() {
    this.cdref.detectChanges();
  }
  // ********************************** Declaration Section End *******************************//

  // ************************************ Shop Section Start **************************************//
  getShopList() {
    this.shoplist = [];
    this.commonService
      .getShopListForPlant(
        this.plantid,
        this.audittypeid,
        this.shopid,
        this.allshops
      )
      .subscribe((data) => {
        this.shoplist = data;
        this.loading = false;
      });
  }

  selectShop(shop: shop) {
    if (shop) {
      this.selectedShop = shop;
      this.selectedmodel = null;
      this.modelList = [];
      this.clearModelData();
      this.getModelList();
    }
  }
  // ************************************ Shop Section End **************************************//

  // ********************************** Model Section Start *******************************//
  getModelList() {
    if (this.selectedShop) {
      this.commonService
        .getModelList(this.selectedShop.Shop_ID, this.audittypeid)
        .subscribe((res) => {
          this.modelList = res;
        });
    }
  }

  selectModel(model: Model) {
    if (model) {
      this.selectedmodel = model;
      this.clearModelData();
      this.getVehicleImages();
      this.getAreaList();
      this.getAuditedVehicles();
    }
  }

  clearModelData() {
    this.modelImageList = [];
    this.selectedImage = null;
    this.vehicleList = [];
    this.selectedVehicle = null;
    this.vehicleCount = 0;
    this.AreaList = [];
    this.selectedArea = null;
    this.partList = [];
    this.selectedPart = null;
    this.cpList = [];
    this.selectedCP = null;
    this.clearReport();
  }

  clearReport() {
    this.reportRows = [];
    this.allPoints = [];
    this.filteredPoints = [];
    this.selectedPoint = null;
    this.okCount = 0;
    this.nokCount = 0;
    this.nodataCount = 0;
    this.LoadTable([]);
  }
  // ********************************** Model Section End *******************************//

  // ********************************** Date Section Start *******************************//
  onStartDateChange(event: any) {
    if (event.value) {
      this.startDateValue = event.value;
      this.startdate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
      this.getAuditedVehicles();
    }
  }

  onEndDateChange(event: any) {
    if (event.value) {
      this.endDateValue = event.value;
      this.enddate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
      this.getAuditedVehicles();
    }
  }
  // ********************************** Date Section End *******************************//

  // ********************************** Vehicle Section Start *******************************//
  //  VIN mode    -> vehicles audited between the two dates , they fill the dropdown
  //  Range mode  -> the audits between the two dates , the count is the list size
  //  Last N mode -> the last N audits , the dates are not used
  getAuditedVehicles() {
    this.vehicleList = [];
    this.vehicleCount = 0;
    if (!this.selectedmodel) {
      return;
    }
    let topn = 0;
    if (this.reportType === 'lastn') {
      topn = this.lastNCount > 0 ? this.lastNCount : 1;
    } else if (!this.startdate || !this.enddate) {
      return;
    }
    this.reportsService
      .getAuditedVehicles(
        this.plantid,
        this.audittypeid,
        this.selectedmodel.Model_ID,
        this.startdate,
        this.enddate,
        topn
      )
      .subscribe((data) => {
        this.vehicleList = data ? data : [];
        // in VIN mode the list is only the dropdown , one vehicle is reported
        this.vehicleCount =
          this.reportType === 'vin' ? 1 : this.vehicleList.length;

        // keep the same vehicle selected if it is still in the list
        if (this.selectedVehicle) {
          const temp = this.vehicleList.find(
            (v) => v.Audit_ID == this.selectedVehicle.Audit_ID
          );
          this.selectedVehicle = temp ? temp : null;
        }
        if (!this.selectedVehicle && this.vehicleList.length) {
          this.selectedVehicle = this.vehicleList[0];
        }
        this.loadReport();
      });
  }

  selectVehicle(vehicle: AuditedVehicle) {
    if (vehicle) {
      this.selectedVehicle = vehicle;
      this.loadReport();
    }
  }

  // VIN number is shown when it is filled , otherwise the BIW / body number
  vehicleLabel(vehicle: AuditedVehicle): string {
    if (!vehicle) {
      return '';
    }
    const no = vehicle.VIN_No ? vehicle.VIN_No : vehicle.Body_No;
    const dt = vehicle.Audit_Date
      ? this.datePipe.transform(vehicle.Audit_Date, 'dd-MMM-yyyy')
      : '';
    return (no ? no : 'Audit ' + vehicle.Audit_ID) + ' ( ' + dt + ' )';
  }

  changeReportType(type: string) {
    this.reportType = type;
    this.selectedPoint = null;
    this.getAuditedVehicles();
  }

  // typed a new value in " Last N audits "
  changeLastN() {
    if (!this.lastNCount || this.lastNCount < 1) {
      this.lastNCount = 1;
    }
    if (this.lastNCount > 500) {
      this.lastNCount = 500;
    }
    this.getAuditedVehicles();
  }
  // ********************************** Vehicle Section End *******************************//

  // ********************************** Vehicle Image Section Start *******************************//
  getVehicleImages() {
    this.modelImageList = [];
    if (!this.selectedShop || !this.selectedmodel) {
      return;
    }
    this.commonService
      .getVehicleImages(
        this.plantid,
        this.audittypeid,
        this.selectedShop.Shop_ID,
        this.selectedmodel.Model_ID
      )
      .subscribe((data) => {
        this.modelImageList = data ? data : [];
        this.modelImageList.forEach((img) => this.setImageUrl(img));
        if (this.modelImageList.length) {
          this.selectImage(this.modelImageList[0]);
        }
      });
  }

  setImageUrl(img: VehicleImage) {
    if (!img.FileContent) {
      img.FileUrl = null;
    } else if (String(img.FileContent).indexOf('data:') === 0) {
      img.FileUrl = img.FileContent;
    } else {
      img.FileUrl = 'data:image/jpg;base64,' + img.FileContent;
    }
  }

  selectImage(img: VehicleImage) {
    if (img) {
      this.selectedImage = img;
      this.selectedPoint = null;
      this.loadReport();
    }
  }

  isCurrentImage(img: VehicleImage) {
    if (this.selectedImage) {
      return this.selectedImage.Vehicle_Image_ID == img.Vehicle_Image_ID;
    } else {
      return false;
    }
  }

  // the picture is shown in a fixed height box , the box is limited by width
  // ( height x aspect ratio ) so that the point co-ordinates stay exact
  onImageLoad(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img && img.naturalHeight > 0) {
      this.imageRatio = img.naturalWidth / img.naturalHeight;
    }
    this.setImageBox();
  }

  @HostListener('window:resize')
  setImageBox() {
    if (!this.imageRatio) {
      this.imageMaxWidth = 'none';
      return;
    }
    let maxheight = Math.round(window.innerHeight * 0.58);
    if (maxheight < 260) {
      maxheight = 260;
    }
    if (maxheight > 620) {
      maxheight = 620;
    }
    this.imageMaxWidth = Math.round(maxheight * this.imageRatio) + 'px';
  }
  // ********************************** Vehicle Image Section End *******************************//

  // ********************************** Filter Section Start *******************************//
  getAreaList() {
    if (this.selectedmodel) {
      this.commonService
        .getAreaList(this.selectedmodel.Model_ID, this.audittypeid)
        .subscribe((data) => {
          this.AreaList = data;
        });
    }
  }

  selectArea(area: Area) {
    this.selectedArea = area;
    this.selectedPart = null;
    this.partList = [];
    this.selectedCP = null;
    this.cpList = [];
    if (area) {
      this.commonService
        .getPartList(area.Area_ID, this.audittypeid)
        .subscribe((data) => {
          this.partList = data;
        });
    }
    this.applyFilters();
  }

  selectPart(part: Part) {
    this.selectedPart = part;
    this.selectedCP = null;
    this.cpList = [];
    if (part) {
      this.commonService
        .getCPList(part.Part_ID, this.audittypeid)
        .subscribe((data) => {
          this.cpList = data ? data : [];
        });
    }
    this.applyFilters();
  }

  selectCP(cp: CheckPoint) {
    this.selectedCP = cp;
    this.applyFilters();
  }

  getParameterList() {
    this.commonService.getParameter().subscribe((data) => {
      // 'All' keeps Gap and Flushness together on one point
      this.parameterList = [{ ID: 0, Type: 'All' }].concat(data ? data : []);
      this.selectedParameter = this.parameterList[0];
    });
  }

  selectParameter(parameter: any) {
    this.selectedParameter = parameter;
    this.buildPoints();
  }

  setViewMode(mode: string) {
    this.viewMode = mode;
    this.applyFilters();
  }

  clearFilters() {
    this.selectedArea = null;
    this.selectedPart = null;
    this.selectedCP = null;
    this.partList = [];
    this.cpList = [];
    this.viewMode = 'all';
    if (this.parameterList.length) {
      this.selectedParameter = this.parameterList[0];
    }
    this.buildPoints();
  }
  // ********************************** Filter Section End *******************************//

  // ********************************** Report Section Start *******************************//
  loadReport() {
    this.clearReport();
    if (!this.selectedImage) {
      return;
    }

    if (this.reportType === 'vin') {
      if (!this.selectedVehicle) {
        return;
      }
      this.reportsService
        .getVinImageReport(
          this.plantid,
          this.audittypeid,
          this.selectedImage.Vehicle_Image_ID,
          this.selectedVehicle.Audit_ID
        )
        .subscribe((data) => {
          this.reportRows = data ? data : [];
          this.buildPoints();
        });
    } else if (this.reportType === 'lastn') {
      this.reportsService
        .getLastNImageReport(
          this.plantid,
          this.audittypeid,
          this.selectedImage.Vehicle_Image_ID,
          this.selectedmodel.Model_ID,
          this.lastNCount
        )
        .subscribe((data) => {
          this.reportRows = data ? data : [];
          this.buildPoints();
        });
    } else {
      if (!this.startdate || !this.enddate) {
        this.toaster.warning('Please select Start date and End date .');
        return;
      }
      this.reportsService
        .getRangeImageReport(
          this.plantid,
          this.audittypeid,
          this.selectedImage.Vehicle_Image_ID,
          this.startdate,
          this.enddate
        )
        .subscribe((data) => {
          this.reportRows = data ? data : [];
          this.buildPoints();
        });
    }
  }

  // one API row = one Location + one Parameter.
  // Here they are grouped back so that one location becomes one point on the picture.
  buildPoints() {
    const paramid =
      this.selectedParameter && this.selectedParameter.ID
        ? this.selectedParameter.ID
        : 0;
    const points: ReportPoint[] = [];

    this.reportRows.forEach((row) => {
      let point = points.find((p) => p.Location_ID === row.Location_ID);
      if (!point) {
        point = {
          Location_ID: row.Location_ID,
          Location_Name: row.Location_Name,
          Area_ID: row.Area_ID,
          Area_Name: row.Area_Name,
          Part_ID: row.Part_ID,
          Part_Name: row.Part_Name,
          Checkpoint_ID: row.Checkpoint_ID,
          Checkpoint_Name: row.Checkpoint_Name,
          X_Coordinate: row.X_Coordinate,
          Y_Coordinate: row.Y_Coordinate,
          readings: [],
          status: 'nodata',
        };
        points.push(point);
      }
      // a row without a reading only tells us that the location is mapped
      if (row.Reading === null || row.Reading === undefined) {
        return;
      }
      if (paramid && row.Parameter_ID != paramid) {
        return;
      }
      point.readings.push(row);
    });

    points.forEach((point) => {
      point.status = this.statusOfPoint(point);
    });

    this.allPoints = points;
    this.applyFilters();
  }

  private statusOfPoint(point: ReportPoint): string {
    if (!point.readings.length) {
      return 'nodata';
    }
    let judged = false;
    for (const row of point.readings) {
      if (row.MinVal === null || row.MinVal === undefined) {
        continue;
      }
      if (row.MaxVal === null || row.MaxVal === undefined) {
        continue;
      }
      judged = true;
      if (row.Reading < row.MinVal || row.Reading > row.MaxVal) {
        return 'nok';
      }
    }
    // reading is there but the specification is not defined , so it can not be judged
    return judged ? 'ok' : 'nodata';
  }

  isReadingNok(row: ImageReportRow): boolean {
    if (row.Reading === null || row.Reading === undefined) {
      return false;
    }
    if (row.MinVal === null || row.MinVal === undefined) {
      return false;
    }
    if (row.MaxVal === null || row.MaxVal === undefined) {
      return false;
    }
    return row.Reading < row.MinVal || row.Reading > row.MaxVal;
  }

  // How far the reading is outside the specification.
  // Positive = above the maximum , negative = below the minimum.
  deviationOf(row: ImageReportRow): number {
    if (!this.isReadingNok(row)) {
      return 0;
    }
    if (row.Reading > row.MaxVal) {
      return row.Reading - row.MaxVal;
    }
    return row.Reading - row.MinVal;
  }

  // worst deviation of the point , this is the label shown next to the red dot
  deviationText(point: ReportPoint): string {
    let worst = 0;
    point.readings.forEach((row) => {
      const dev = this.deviationOf(row);
      if (Math.abs(dev) > Math.abs(worst)) {
        worst = dev;
      }
    });
    if (!worst) {
      return '';
    }
    const value = Math.round(worst * 100) / 100;
    return (value > 0 ? '+' : '') + value;
  }

  applyFilters() {
    let data = this.allPoints;
    if (this.selectedArea) {
      data = data.filter((p) => p.Area_ID === this.selectedArea.Area_ID);
    }
    if (this.selectedPart) {
      data = data.filter((p) => p.Part_ID === this.selectedPart.Part_ID);
    }
    if (this.selectedCP) {
      data = data.filter(
        (p) => p.Checkpoint_ID === this.selectedCP.Checkpoint_ID
      );
    }

    // counts are of the current Area / Part / Check Point selection ,
    // they are taken before the Not Ok only filter is applied
    this.okCount = data.filter((p) => p.status === 'ok').length;
    this.nokCount = data.filter((p) => p.status === 'nok').length;
    this.nodataCount = data.filter((p) => p.status === 'nodata').length;

    if (this.viewMode === 'nok') {
      data = data.filter((p) => p.status === 'nok');
    }

    this.filteredPoints = data;
    if (
      this.selectedPoint &&
      !data.some((p) => p.Location_ID === this.selectedPoint.Location_ID)
    ) {
      this.selectedPoint = null;
    }
    this.LoadTable(this.filteredPoints);
  }

  colorOf(point: ReportPoint): string {
    if (point.status === 'ok') {
      return '#2e7d32';
    }
    if (point.status === 'nok') {
      return '#d32f2f';
    }
    return '#9e9e9e';
  }

  selectPoint(point: ReportPoint, ev?: Event) {
    if (ev) {
      ev.stopPropagation();
    }
    this.selectedPoint = point;
    this.openCharts(point);
  }

  /*  X bar , Histogram , MR charts and the Cp / Cpk box of the clicked location.
   *
   *  The charts always need a series of readings , so :
   *      Date range wise -> the same two dates
   *      Last N audits   -> the same N
   *      VIN / BIW wise  -> one vehicle is only one reading , which can not make a
   *                         chart , so the last 30 audits are taken by default
   */
  openCharts(point: ReportPoint) {
    if (!point || !this.selectedmodel) {
      return;
    }

    // the parameters ( Gap / Flushness ) which this location actually has
    const parameters = [];
    this.reportRows.forEach((row) => {
      if (row.Location_ID !== point.Location_ID || !row.Parameter_ID) {
        return;
      }
      if (!parameters.some((p) => p.Parameter_ID === row.Parameter_ID)) {
        parameters.push({
          Parameter_ID: row.Parameter_ID,
          Parameter_Type: row.Parameter_Type,
        });
      }
    });

    // This vehicle / range has no reading on that location , but its history
    // can still be charted , so every real parameter is offered instead.
    if (!parameters.length) {
      this.parameterList.forEach((p) => {
        if (p.ID) {
          parameters.push({ Parameter_ID: p.ID, Parameter_Type: p.Type });
        }
      });
    }

    if (!parameters.length) {
      this.toaster.warning(
        'No parameter is available for ' + point.Location_Name + ' .'
      );
      return;
    }

    this.dialog.open(ReadingChartsComponent, {
      // not fully full screen , a small gap is left on the top
      width: '100vw',
      maxWidth: '100vw',
      height: 'calc(100vh - 40px)',
      maxHeight: 'calc(100vh - 40px)',
      position: { top: '40px' },
      panelClass: 'reading-charts-panel',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
      data: {
        plantid: this.plantid,
        audittypeid: this.audittypeid,
        modelid: this.selectedmodel.Model_ID,
        locationid: point.Location_ID,
        locationName: point.Location_Name,
        partName: point.Part_Name,
        checkpointName: point.Checkpoint_Name,
        parameters: parameters,
        fromdate: this.startdate,
        todate: this.enddate,
        topn:
          this.reportType === 'lastn'
            ? this.lastNCount
            : this.reportType === 'vin'
            ? this.DEFAULT_CHART_AUDITS
            : 0,
      },
    });
  }

  isCurrentPoint(point: ReportPoint) {
    if (this.selectedPoint) {
      return this.selectedPoint.Location_ID == point.Location_ID;
    } else {
      return false;
    }
  }

  // how many of the readings behind this point were out of specification
  nokPercent(row: ImageReportRow): string {
    if (!row.Reading_Count) {
      return '0';
    }
    const pct = (row.Nok_Count / row.Reading_Count) * 100;
    // one decimal , but a round number stays round ( 60 , not 60.0 )
    return (Math.round(pct * 10) / 10).toString();
  }

  // shown inside the point tooltip and in the side list
  readingText(row: ImageReportRow): string {
    if (row.Reading === null || row.Reading === undefined) {
      return '-';
    }
    return (Math.round(row.Reading * 100) / 100).toString();
  }

  specText(row: ImageReportRow): string {
    if (
      row.MinVal === null ||
      row.MinVal === undefined ||
      row.MaxVal === null ||
      row.MaxVal === undefined
    ) {
      return 'No specification';
    }
    return row.MinVal + ' to ' + row.MaxVal;
  }
  // ********************************** Report Section End *******************************//

  // ********************************** Table Section Start *******************************//
  LoadTable(points: ReportPoint[]) {
    // the table is flat , one row per Location + Parameter
    const rows = [];
    (points ? points : []).forEach((point) => {
      if (!point.readings.length) {
        rows.push({
          Area_Name: point.Area_Name,
          Part_Name: point.Part_Name,
          Checkpoint_Name: point.Checkpoint_Name,
          Location_Name: point.Location_Name,
          Parameter_Type: '-',
          Reading: '-',
          Specification: '-',
          Status: 'No Data',
        });
        return;
      }
      point.readings.forEach((row) => {
        rows.push({
          Area_Name: point.Area_Name,
          Part_Name: point.Part_Name,
          Checkpoint_Name: point.Checkpoint_Name,
          Location_Name: point.Location_Name,
          Parameter_Type: row.Parameter_Type ? row.Parameter_Type : '-',
          Reading: this.readingText(row),
          Specification: this.specText(row),
          Status: this.isReadingNok(row) ? 'Not Ok' : 'Ok',
        });
      });
    });

    const dataTable = $('#vehicleimagereporttable');

    if ($.fn.DataTable.isDataTable(dataTable)) {
      dataTable.DataTable().destroy();
    }

    dataTable.DataTable({
      destroy: true,
      lengthMenu: [
        [-1, 50, 25, 10, 5],
        ['All', 50, 25, 10, 5],
      ],
      data: rows,
      columnDefs: [
        { title: 'Area Name', targets: 0 },
        { title: 'Part Name', targets: 1 },
        { title: 'Check Point', targets: 2 },
        { title: 'Location', targets: 3 },
        { title: 'Parameter', targets: 4 },
        { title: 'Reading', targets: 5 },
        { title: 'Specification', targets: 6 },
        { title: 'Status', targets: 7 },
      ],
      columns: [
        { data: 'Area_Name' },
        { data: 'Part_Name' },
        { data: 'Checkpoint_Name' },
        { data: 'Location_Name' },
        { data: 'Parameter_Type' },
        { data: 'Reading' },
        { data: 'Specification' },
        {
          data: 'Status',
          render: function (data) {
            let color = '#9e9e9e';
            if (data === 'Ok') {
              color = '#2e7d32';
            } else if (data === 'Not Ok') {
              color = '#d32f2f';
            }
            return (
              '<span style="padding:2px 10px;border-radius:10px;color:#fff;font-size:11px;background:' +
              color +
              '">' +
              data +
              '</span>'
            );
          },
        },
      ],
    });
  }
  // ********************************** Table Section End *******************************//

  // ********************************** Other Section Start *******************************//
  refresh() {
    this.selectedShop = null;
    this.selectedmodel = null;
    this.modelList = [];
    this.viewMode = 'all';
    this.clearModelData();
  }

  exit() {
    $('#ngslide').show();
    this.router.navigate(['/configmaster']);
  }
  // ********************************** Other Section End *******************************//
}
