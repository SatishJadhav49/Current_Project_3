import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { AppConfig } from 'src/app/appConfig';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ApirequestService {
  apiurl: String;
  constructor(
    private appConfig: AppConfig,
    private http: HttpClient,
    private router: Router,
    private toaster: ToastrService
  ) {
    this.apiurl = this.appConfig.baseApiPath;
  }

  /**
   * This is a Global place to add all the request headers for every REST calls
   */
  appendAuthHeader(): Headers {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token');
    if (token !== null) {
      headers.append('Authorization', 'Bearer ' + token);
    }
    // headers.append('Access-Control-Allow-Origin', '*');
    return headers;
  }

  /**
   * This is a Global place to define all the Request Headers that must be sent for every ajax call
   */
  getRequestOptions(urlParams?: HttpParams, body?: any) {
    const headers = this.appendAuthHeader();
    const options: any = {
      headers,
      body,
      params: urlParams,
      observe: 'response', // Use 'response' to access the full HTTP response.
    };
    return options;
  }
  get(url: string, urlParams?: HttpParams): Observable<any> {
    const me = this;
    const requestOptions = {
      params: urlParams,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    return this.http.get(this.appConfig.baseApiPath + url, requestOptions).pipe(
      map((response: any) => {
        if (response.messageDataObj) {
          if (response.messageDataObj.isErrorMessage) {
            this.toaster.error(
              response.messageDataObj.messageDetail,
              response.messageDataObj.messageTitle
            );
            return;
          } else {
            return response.dataList;
          }
        } else {
          return response;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          me.router.navigate(['/logout']);
        } else if (error.status === 0) {
          me.router.navigate(['/NotAccess']);
        }
        return throwError(error || 'Server error');
      })
    );
  }

  post(url: string, body: any): Observable<any> {
    const me = this;
    const requestOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    return this.http
      .post(this.appConfig.baseApiPath + url, body, requestOptions)
      .pipe(
        map((resp: any) => resp),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // console.log('In request option error block');
            me.router.navigate(['']);
          }
          return throwError(error || 'Server error');
        })
      );
  }

  put(url: string, id: number, body: any): Observable<any> {
    const me = this;
    const requestOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    return this.http
      .put(this.appConfig.baseApiPath + `${url}/${id}`, body, requestOptions)
      .pipe(
        map((resp: any) => resp),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            me.router.navigate(['/logout']);
          }
          return throwError(error || 'Server error');
        })
      );
  }

  delete(url: string, body: any): Observable<any> {
    const me = this;
    const requestOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: body,
    };

    return this.http
      .delete(this.appConfig.baseApiPath + url, requestOptions)
      .pipe(
        map((resp: any) => resp),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            me.router.navigate(['/logout']);
          }
          return throwError(error || 'Server error');
        })
      );
  }

  geturladdress(): string {
    // Nashik
    var url = 'http://10.2.198.188:2425'; //use for live
    //  var url="http://localhost:64018"  //use for local
    // Test
    //var url = "http://localhost:64018";
    //  genovac link
    //var url="http://10.192.68.131:23456";

    return url.toString();
  }
}
