import { Injectable } from '@angular/core';
import { ApirequestService } from './apirequest.service';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  constructor(private apiRequest: ApirequestService) { }

  sendMail(data: any) {
    return this.apiRequest.post('api/MM_Audit_Plan_Master/sendMail', data);
  }
}
