// MM_Shift
import { Time } from '@angular/common';

export class Shift {
  public SHIFT_NO?: number;
  public SHIFT_DESC: string;
  public START_TIME: Time;
  public END_TIME: Time;
  public WORKING: string;
  public Plant_ID?: number;
  public Shop_ID?: number;
  public Line_ID?: number;
  public Is_Transferred?: boolean;
  public Is_Purgeable?: boolean;
  public Is_Edited?: boolean;
  public Inserted_Host?: string;
  public Inserted_User_ID?: number;
  public Inserted_Date?: Date;
  public Updated_Host?: string;
  public Updated_User_ID?: number;
  public Updated_Date?: Date;
  public Is_Active?: boolean;
  public LUNCH_START_TIME?: Time;
  public LUNCH_END_TIME?: Time;
  public Is_PostshiftTimeNextDay?: boolean;
  public Audit_Type_Id: number;
}
