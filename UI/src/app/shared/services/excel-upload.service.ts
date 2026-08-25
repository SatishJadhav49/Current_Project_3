import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from 'src/app/appConfig';

@Injectable({
  providedIn: 'root',
})
export class ExcelUploadService {

  constructor(private http: HttpClient, private appConfig: AppConfig) { }

  specificationExcelUpload(fileToUpload: File, data: any): Observable<any> {
    try {
      const userInfo = {
        Plant_ID: localStorage.getItem('plantid'),
        Inserted_User_ID: localStorage.getItem('userid'),
        Inserted_Host: localStorage.getItem('hostname'),
        Audit_Type_Id: localStorage.getItem('audittypeid'),
        Shop_ID: data.shopid,
        Model_ID: data.modelid,
      };
      const endpoint =
        this.appConfig.baseApiPath + 'api/MM_SpecificationMaster/UploadData';
      const formData: FormData = new FormData();
      formData.append('otherinfo', JSON.stringify(userInfo));
      formData.append('excel', fileToUpload, fileToUpload.name);
      return this.http.post(endpoint, formData);
    } catch (error) {
      throw error;
    }
  }
  
}

