// MM_Vehicle_Image_Master

export class VehicleImage {
  public Vehicle_Image_ID?: number;
  public Image_Name: string;
  public FileContent?: any;
  public FileName?: string;
  public FileType?: string;
  public ContentType?: string;
  public FileUrl?: string; // only for display , not saved in DB
  public Shop_ID: number;
  public Model_ID: number;
  public Plant_ID: number;
  public Audit_Type_Id: number;
  public Is_Active?: boolean;
  public Is_Purgeable?: boolean;
  public Is_Edited?: boolean;
  public Is_Deleted?: boolean;
  public Inserted_Host?: string;
  public Inserted_User_ID?: number;
  public Inserted_Date?: Date;
  public Updated_Host?: string;
  public Updated_User_ID?: number;
  public Updated_Date?: Date;
  public Shop_Name?: string;
  public Model_Name?: string;
  public Mapping_Count?: number; // how many locations are mapped on this image
}

// MM_Vehicle_Image_Mapping
// X_Coordinate / Y_Coordinate are kept in % of the image ( 0 to 100 ) ,
// so the marker stays on the same point of the vehicle on any screen size.

export class VehicleImageMapping {
  public Mapping_ID?: number;
  public Vehicle_Image_ID: number;
  public Shop_ID: number;
  public Model_ID: number;
  public Area_ID: number;
  public Part_ID: number;
  public Checkpoint_ID: number;
  public Location_ID: number;
  public X_Coordinate: number;
  public Y_Coordinate: number;
  public Is_Active?: boolean;
  public Is_Purgeable?: boolean;
  public Is_Edited?: boolean;
  public Is_Deleted?: boolean;
  public Inserted_Host?: string;
  public Inserted_User_ID?: number;
  public Inserted_Date?: Date;
  public Updated_Host?: string;
  public Updated_User_ID?: number;
  public Updated_Date?: Date;
  public Plant_ID?: number;
  public Audit_Type_Id?: number;
  // display names , filled by the API joins ( kept locally for now )
  public Area_Name?: string;
  public Part_Name?: string;
  public Checkpoint_Name?: string;
  public Location_Name?: string;
}
