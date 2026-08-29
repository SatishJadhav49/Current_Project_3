import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApirequestService } from 'src/app/shared/services/apirequest.service';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {

  STATISTICAL_REPORTS = [
    {
      REPORT_ID:1,
      REPORT_TITLE:"Graphical Report"
    },
    {
      REPORT_ID:2,
      REPORT_TITLE:"Graphical Report with Calculated Limits"
    },
    {
      REPORT_ID:3,
      REPORT_TITLE:"Box Plot"
    },
    {
      REPORT_ID:4,
      REPORT_TITLE:"Trend Chart"
    },
    {
      REPORT_ID:5,
      REPORT_TITLE:"SPC Rules"
    },
    {
      REPORT_ID:6,
      REPORT_TITLE:"Histogram"
    },
    {
      REPORT_ID:7,
      REPORT_TITLE:"Comparison Trend"
    }
  ]


  constructor(private apirequest: ApirequestService) { }
  getStartreportlink(): string {
    var url =
      'https://mmnsk1drsv.corp.mahindra.com/DronaRep/Pages/ReportViewer.aspx?%2fPQ+Dashboard';
    return url.toString();
  }

  getChakanReportUrl() {
    var url =
      'https://mvml-drnrs.corp.mahindra.com/DronaRep/Pages/ReportViewer.aspx?%2fPQ+Dashboard';
    return url.toString();
  }

  getKNDReportUrl() {
    var url =
      'https://mmknddrnars.corp.mahindra.com/ReportServer/Pages/ReportViewer.aspx?%2fPQ+Dashboard';
    return url.toString();
  }

   getHaridwarReportUrl() {
    var url =
      'https://mmhrddrnrs.corp.mahindra.com/ReportServer/Pages/ReportViewer.aspx?%2fPQ+Dashboard';
    return url.toString();
  }

  getReportsList(): Observable<any[]> {
    return of(this.STATISTICAL_REPORTS);
  }

  getBiwList(modelid, startdate, enddate, audittypeid) {
    return this.apirequest.get(
      'api/MIS_Report/Get_BIW_List/' +
      modelid +
      ',' +
      startdate +
      ',' +
      enddate +
      ',' +
      audittypeid
    );
  }

  getBoxPlotData(year, Part_ID, Checkpoint_ID, Location_ID, Parameter_ID): Observable<any> {
    return this.apirequest.get(
      'api/MasterAPIS/GetBoxPlotData/' +
        year +
        ',' +
        Part_ID +
        ',' +
        Checkpoint_ID +
        ',' +
        Location_ID +
        ',' +
        Parameter_ID
    );
  }
   getBoxPlotDataByDates(startdate, enddate, Part_ID, Checkpoint_ID, Location_ID, Parameter_ID): Observable<any> {
    return this.apirequest.get(
      'api/MasterAPIS/GetBoxPlotDataByDates/' +
        startdate +
        ',' +
        enddate +
        ',' +
        Part_ID +
        ',' +
        Checkpoint_ID +
        ',' +
        Location_ID +
        ',' +
        Parameter_ID
    );
  }

  
  findMedian(arr: number[]): number {
    const sortedArr = arr.sort((a, b) => a - b);
    const len = sortedArr.length;

    if (len === 0) {
      throw new Error('Cannot calculate median for an empty array.');
    }

    if (len % 2 === 0) {
      console.log((sortedArr[len / 2 - 1] + sortedArr[len / 2]) / 2);
      
      return (sortedArr[len / 2 - 1] + sortedArr[len / 2]) / 2;
    } else {
      console.log(sortedArr[Math.floor(len / 2)]);
      return sortedArr[Math.floor(len / 2)];
    }
  }

  // Function to calculate the first quartile (Q1)
  findQ1(arr: number[]): number {
    const sortedArr = arr.sort((a, b) => a - b);
    const len = sortedArr.length;

    if (len === 0) {
      throw new Error('Cannot calculate Q1 for an empty array.');
    }

    // Q1 is the median of the lower half of the data
    const lowerHalf = sortedArr.slice(0, Math.floor(len / 2));
    return this.findMedian(lowerHalf);
  }

  // Function to calculate the third quartile (Q3)
  findQ3(arr: number[]): number {
    const sortedArr = arr.sort((a, b) => a - b);
    const len = sortedArr.length;

    if (len === 0) {
      throw new Error('Cannot calculate Q3 for an empty array.');
    }

    // Q3 is the median of the upper half of the data
    const upperHalf = sortedArr.slice(Math.ceil(len / 2));
    return this.findMedian(upperHalf);
  }

  // Function to calculate the interquartile range (IQR)
  findIQR(arr: number[]): number {
    const q1 = this.findQ1(arr);
    const q3 = this.findQ3(arr);
    return q3 - q1;
  }

  // Function to calculate outliers using IQR
  findOutliers(arr: number[]): number[] {
    const sortedArr = arr.sort((a, b) => a - b);
    const iqr = this.findIQR(sortedArr);
    const q1 = this.findQ1(sortedArr);
    const q3 = this.findQ3(sortedArr);

    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;

    // Find outliers (values below lowerFence or above upperFence)
    return sortedArr.filter(val => val < lowerFence || val > upperFence);
  }

  // Function to calculate the lower whisker
  findLowerWhisker(arr: number[]): number {
    const sortedArr = arr.sort((a, b) => a - b);
    const q1 = this.findQ1(sortedArr);
    const iqr = this.findIQR(sortedArr);
    const lowerFence = q1 - 1.5 * iqr;

    // The lower whisker is the largest value less than or equal to the lower fence
    return sortedArr.filter(val => val >= lowerFence)[0];
  }

  // Function to calculate the upper whisker
  findUpperWhisker(arr: number[]): number {
    const sortedArr = arr.sort((a, b) => a - b);
    const q3 = this.findQ3(sortedArr);
    const iqr = this.findIQR(sortedArr);
    const upperFence = q3 + 1.5 * iqr;

    // The upper whisker is the smallest value greater than or equal to the upper fence
    return sortedArr.filter(val => val <= upperFence).pop();
  }

   getSPCRulesData(startDate: string, endDate: string, areaid: number, modelId: number, plantId: number, partid: number, checpointid: number,location:number,parameter:number): Observable<any> {
    return this.apirequest.get(`api/Report/GetSPCRulesData/${startDate},${endDate},${areaid},${modelId},${plantId},${partid},${checpointid},${location},${parameter}`);
  }


  getXbarData(fromdate, todate, modelid, areaid, partid, checkpointid, locationid, ID: number) {
    return this.apirequest.get(
      'api/Report/GetXbarData/' +
       fromdate +
        ',' +
        todate +
        ',' +
        modelid +
        ',' +
        areaid +
        ',' +
        partid +
        ',' +
        checkpointid +
        ',' +
        locationid +
        ',' +
        ID
 
    );
  }

  getMappingData(fromdate, todate,modelid, areaid, partid, checkpointid, locationid, ID: number, audittypeid) {
    return this.apirequest.get(
      'api/Report/GetMappingData/' +
       fromdate +
        ',' +
        todate +
        ',' +
         modelid +
        ',' +
        areaid +
        ',' +
        partid +
        ',' +
        checkpointid +
        ',' +
        locationid +
        ',' +
        ID +
        ',' +
        audittypeid 
 
    );
  }

  // getMergedData(fromdate, todate, modelid, areaid, partid, checkpointid, locationid, ID: number, audittypeid) {
  //   return this.apirequest.get(
  //     'api/Report/GetMergedData/' +
  //      fromdate +
  //       ',' +
  //       todate +
  //       ',' +
  //       modelid +
  //       ',' +
  //       areaid +
  //       ',' +
  //       partid +
  //       ',' +
  //       checkpointid +
  //       ',' +
  //       locationid +
  //       ',' +
  //       ID +
  //       ',' +
  //       audittypeid 
 
  //   );
  // }
  

  // ---------- Vehicle Image Report Start ---------------------------//

  // vehicles audited for this model , used for the VIN / BIW dropdown and
  // for the " vehicles audited " count.
  // topn > 0 -> last N audits ( the two dates are ignored )
  // topn = 0 -> every audit between the two dates
  getAuditedVehicles(plantid, audittypeid, modelid, fromdate, todate, topn) {
    return this.apirequest.get(
      'api/MM_Vehicle_Image_Report/GetAuditedVehicles/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      modelid +
      ',' +
      fromdate +
      ',' +
      todate +
      ',' +
      topn
    );
  }

  // readings of one vehicle
  getVinImageReport(plantid, audittypeid, vehicleimageid, auditid) {
    return this.apirequest.get(
      'api/MM_Vehicle_Image_Report/GetVinReport/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      vehicleimageid +
      ',' +
      auditid
    );
  }

  // average of every reading taken in the range
  getRangeImageReport(plantid, audittypeid, vehicleimageid, fromdate, todate) {
    return this.apirequest.get(
      'api/MM_Vehicle_Image_Report/GetRangeReport/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      vehicleimageid +
      ',' +
      fromdate +
      ',' +
      todate
    );
  }
  // average of the readings of the last N audits
  getLastNImageReport(plantid, audittypeid, vehicleimageid, modelid, topn) {
    return this.apirequest.get(
      'api/MM_Vehicle_Image_Report/GetLastNReport/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      vehicleimageid +
      ',' +
      modelid +
      ',' +
      topn
    );
  }
  // every individual reading of one mapped location + one parameter ,
  // used by the X bar / Histogram / MR charts and the Cp - Cpk box.
  // topn > 0 -> last N readings ( dates ignored ) , topn = 0 -> date range
  getLocationReadings(
    plantid,
    audittypeid,
    modelid,
    locationid,
    parameterid,
    fromdate,
    todate,
    topn
  ) {
    return this.apirequest.get(
      'api/MM_Vehicle_Image_Report/GetLocationReadings/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      modelid +
      ',' +
      locationid +
      ',' +
      parameterid +
      ',' +
      fromdate +
      ',' +
      todate +
      ',' +
      topn
    );
  }
  // ---------- Vehicle Image Report End ---------------------------//
}
