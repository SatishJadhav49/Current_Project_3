// MM_PartMaster

export class Part {
  public Part_ID?: number;
  public Part_Name: string;
  public Part_Desc: string;
  public Shop_ID: number;
  public Model_ID: number;
  public Area_ID: number;
  public Is_Active: boolean;
  public SORTORDER: number;
  public Plant_ID: number;
  public Audit_Type_Id: number;
  public Is_Purgeable?: boolean;
  public Is_Edited?: boolean;
  public Is_Deleted?: boolean;
  public Inserted_Host?: string;
  public Inserted_User_ID?: number;
  public Inserted_Date?: Date;
  public Updated_Host?: string;
  public Updated_User_ID?: number;
  public Updated_Date?: Date;
  public Is_Gap?: boolean;
  public Is_Flushness?: boolean;
  public Plant_Code: any;
}
