import { submenu } from './submenu.model';

export class UserAuthenticate {
  public Employee_ID: number;
  public Menu_ID: number;
  //    public Sub_Menu_ID: number;
  public Employee_No: string;
  //    public LinkName:string;
  public Employee_Name: string;
  public Department_Name: string;

  //    public ActionName:string;
  public Role_Name: string;
  public SubMenuList: submenu[];
  public Is_Create: boolean;
  public Is_Edit: boolean;
  public Is_Delete: boolean;
}
