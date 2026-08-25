import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap, tap } from 'rxjs';
import { ApirequestService } from '../shared/services/apirequest.service';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  router = inject(Router);
  route = inject(ActivatedRoute);
  constructor(private apiRequest: ApirequestService) {}
  hasRoles(expectedRole: string): boolean {
    // Getting an roles for user from sessionstorage
    let rolesInSession = sessionStorage.getItem('userRoles');
    // Converting to array
    const roles = rolesInSession ? JSON.parse(rolesInSession) : [];
    return roles.find((roles) => roles == expectedRole);
  }

  getTokenCurrentPC(): Observable<any> {
    return this.apiRequest.get('api/MM_Employee/GetTokenCurrent');
  }

  checkToken(tokennumber: string): Observable<any> {
    return this.apiRequest.get('api/MM_Employee/SearchToken/' + tokennumber);
  }

  getplantlistforuser(tokenNo: string): Observable<any> {
    return this.apiRequest.get(
      'api/MM_Employee/GetPlantListForUser/' + tokenNo
    );
  }

  saveLoginUser(token_no: Object) {
    return this.apiRequest.post('api/MM_Employee/SaveLoginUserData', token_no);
  }

  getAuthenticateUser(
    tokenNo: string,
    plantId: number,
    audittype: number
  ): Observable<any> {
    return this.apiRequest.get(
      'api/MM_Employee/UserAthentication/' +
        tokenNo +
        ',' +
        plantId +
        ',' +
        audittype
    );
  }

  logout() {
    localStorage.setItem('user', '');
    localStorage.setItem('audittypeid', '');
    localStorage.setItem('plantid', '');
    localStorage.setItem('shopid', '');
  }

  loadUserData(): Observable<any> {
    return this.apiRequest.get('api/MM_Employee/GetTokenCurrent').pipe(
      switchMap((token) =>
        this.apiRequest.get('api/MM_Employee/SearchToken/' + token).pipe(
          map((data) => ({ token, data })) // Combine token and data into a single object
        )
      ),
      tap(({ token, data }) => {
        if (data === null || data === undefined) {
          debugger;
          this.router.navigate(['NotAccess']);
        } else {
          localStorage.setItem('user', token);
          localStorage.setItem('userType', data[0].Department_ID);
          localStorage.setItem('isallshops', data[0].Is_AllShops ? '1' : '0');
          localStorage.setItem('audittypeid', data[0].Audit_Type_Id);
          localStorage.setItem('plantid', data[0].Plant_ID);
          localStorage.setItem('Plant_Code', data[0].Plant_Code);
          localStorage.setItem('userid', data[0].Employee_ID);
          localStorage.setItem('Email', data[0].Email_Address);
          localStorage.setItem('Name', data[0].Employee_Name);
          localStorage.setItem('shopid', data[0].Shop_ID);
          localStorage.setItem('canCreate', '0');
          localStorage.setItem('canUpdate', '0');
          localStorage.setItem('canDelete', '0');

          if (localStorage.getItem('user')) {
            this.router.navigate(['/configmaster'], { queryParams: { returnURL: '/configmaster/audit/auditsheet' }, relativeTo: this.route });
          } else {
            this.router.navigate(['/']);
          }
        }
      })
    );
  }
}
