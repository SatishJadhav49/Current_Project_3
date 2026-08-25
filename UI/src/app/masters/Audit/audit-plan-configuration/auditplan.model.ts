export class AuditPlan {
    public Audit_Plan_ID?: number;
    public Model_ID: number;
    public Shop_ID: number;
    public Schedule_Type_ID: number;
    public Assign_User_ID: number;
    public IS_Active: boolean;
    public Plant_ID: number;
    public Audit_Type_Id: number;
    public Is_Purgeable?: boolean;
    public Is_Edited?: boolean;
    public Is_Deleted?: boolean;
    public Inserted_Host: string;
    public Inserted_User_ID: number;
    public Inserted_Date?: Date;
    public Updated_Host: string;
    public Updated_User_ID: number;
    public Updated_Date?: Date;
    public Audit_Start_Date: Date;
    public Audit_End_Date: Date;
    public Plant_Code: string;
    public Frequency: number
}
