// Vehicle Image Report

// one vehicle audited for the model
export class AuditedVehicle {
  public Audit_ID: number;
  public VIN_No?: string;
  public Body_No?: string;
  public Audit_Date?: Date;
}

// one row coming from the API = one mapped Location + one Parameter ( Gap / Flushness ).
// In the VIN report Reading is the reading of that vehicle , in the date range
// report it is the average of every reading taken in that range.
export class ImageReportRow {
  public Mapping_ID: number;
  public Location_ID: number;
  public X_Coordinate: number;
  public Y_Coordinate: number;
  public Area_ID: number;
  public Part_ID: number;
  public Checkpoint_ID: number;
  public Area_Name?: string;
  public Part_Name?: string;
  public Checkpoint_Name?: string;
  public Location_Name?: string;
  public Parameter_ID?: number;
  public Parameter_Type?: string;
  public Reading?: number;
  public MinVal?: number;
  public MaxVal?: number;
  public Reading_Count?: number;
  public Nok_Count?: number;
  public Vehicle_Count?: number;
}

// one point on the picture = one mapped location , with all its parameters together
export class ReportPoint {
  public Location_ID: number;
  public Location_Name?: string;
  public Area_ID: number;
  public Area_Name?: string;
  public Part_ID: number;
  public Part_Name?: string;
  public Checkpoint_ID: number;
  public Checkpoint_Name?: string;
  public X_Coordinate: number;
  public Y_Coordinate: number;
  public readings: ImageReportRow[] = [];
  // ok = every reading inside the specification
  // nok = at least one reading outside the specification
  // nodata = no reading , or reading present but specification not defined
  public status: string = 'nodata';
}
