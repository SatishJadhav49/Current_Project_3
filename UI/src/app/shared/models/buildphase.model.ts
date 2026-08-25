//MM_Audit_BuildPhase_Mstr

export class BuildPhase {
  public Build_Phase_ID?: number;
  public Build_Phase_Name: string;
  public Build_Phase_Description?: string;
  public Plant_ID?: number;
  public Audit_Type_Id: number;
  public Shop_ID?: number;
  public Line_ID?: number;
  public Is_Transfered?: boolean;
  public Is_Purgeable?: boolean;
  public Is_Edited?: boolean;
  public Is_Deleted?: boolean;
  public Inserted_Host?: string;
  public Inserted_User_ID?: number;
  public Inserted_Date?: Date;
  public Updated_Host?: string;
  public Updated_User_ID?: number;
  public Updated_Date?: Date;
  public Plant_Code: any;
}