import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from 'src/app/appConfig';
import { ApirequestService } from 'src/app/shared/services/apirequest.service';

@Injectable({
  providedIn: 'root'
})
export class DigitalGapgunService {


  constructor(private apirequest: ApirequestService,
    private http: HttpClient,
    private appConfig: AppConfig
  ) { }

  // ************************** Digital Gapgun *****************************//
  gapgunExcelUpload(fileToUpload: File, data: any): Observable<any> {
    try {

      // user + required info
      const userInfo = {
        Plant_ID: localStorage.getItem('plantid'),
        Inserted_User_ID: localStorage.getItem('userid'),
        Inserted_Host: localStorage.getItem('hostname'),
        Audit_Type_Id: localStorage.getItem('audittypeid'),
        Plant_Code: localStorage.getItem('Plant_Code'),

        Shop_ID: data.shopid,
        Model_ID: data.modelid
      };

      // API endpoint
      const endpoint =
        this.appConfig.baseApiPath + 'api/MM_Digital_Gapgun/UploadGapgunExcel';

      // FormData
      const formData: FormData = new FormData();

      formData.append('otherinfo', JSON.stringify(userInfo));
      formData.append('excel', fileToUpload, fileToUpload.name);

      //  POST call
      return this.http.post(endpoint, formData);

    } catch (error) {
      throw error;
    }
  }

  getByVin(vin: string) {
    return this.apirequest.get(
      'api/MM_Digital_Gapgun/GetByVin/' + vin
    );
  }

  getMailPreview(auditDate: string, modelId: number) {
    return this.apirequest.get(
      'api/DigitalGapgun_AutoMailController/GetAuditMailPreview/' +
      auditDate +
      ',' +
      modelId
    );
  }

  sendMail(auditdate: string, modelId: number) {
    return this.apirequest.post(`api/DigitalGapgun_AutoMailController/SendAuditMail/${auditdate},${modelId}`, {});
  }

}
