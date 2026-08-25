import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApirequestService } from 'src/app/shared/services/apirequest.service';
// app/models/sub-menu.model.ts
declare var $: any;

export interface SubMenu {
  ActionName: string;
  LinkName: string;
  Menu_ID: number;
  Sort_Order: number;
  Is_Active: number;
  Audit_Type_Id: number;
}

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.css'],
})
export class TestingComponent {
  subMenu = {
    ActionName: '',
    LinkName: '',
    Menu_ID: 47,
    Sort_Order: 1,
    Is_Active: 1,
    Audit_Type_Id: 2,
  };

  constructor(
    private ApirequestService: ApirequestService,
    private toster: ToastrService
  ) {
    $('#ngslide').hide();
  }

  onSubmit() {
    this.ApirequestService.post(
      'api/MM_Sub_Menus/PostMM_Sub_Menu',
      this.subMenu
    ).subscribe((data) => {
      if (data.IsErrorAlertNotFound || data.IsErrorAlert) {
        this.toster.error(data.IsMassege, data.IsTitle);
      } else if (data.IsSuccessAlert) {
        this.toster.success(data.IsMassege, data.IsTitle);
        this.subMenu.ActionName = 'configmaster/masters/';
        this.subMenu.LinkName = 'Master';
        this.subMenu.Sort_Order = this.subMenu.Sort_Order + 1;
      } else if (data.IsErrorAlertDuplicate) {
        this.toster.warning(data.IsMassege, data.IsTitle);
      } else {
        this.toster.error('Something went wrong');
      }
    });
    console.log(this.subMenu);
  }
}
// [Route("api/MM_Sub_Menus/PostMM_Sub_Menu")]
//         [HttpPost]
//         [ActionName("PostMM_Sub_Menu")]
//         public IHttpActionResult PostMM_Sub_Menu(MM_Sub_Menus subMenu)
//         {
//             if (!ModelState.IsValid)
//             {
//                 return BadRequest(ModelState);
//             }

//             try
//             {
//                 // Check if a similar record already exists
//                 if (db.MM_Sub_Menus.Any(m => m.ActionName.ToLower().Trim() == subMenu.ActionName.ToLower().Trim() && m.Menu_ID == subMenu.Menu_ID))
//                 {
//                     return Ok(new { IsErrorAlertDuplicate = true, IsTitle = "Record Already Exists", IsMessage = "The record is already existed." });
//                 }

//                 // If not, proceed to save the record
//                 subMenu.Inserted_Date = DateTime.Now;
//                 db.MM_Sub_Menus.Add(subMenu);
//                 db.SaveChanges();

//                 return Ok(new { IsSuccessAlert = true, IsTitle = "Record Added Successfully", IsMessage = "The record has been added successfully." });
//             }
//             catch (DbEntityValidationException ex)
//             {
//                 foreach (var entityValidationErrors in ex.EntityValidationErrors)
//                 {
//                     foreach (var validationError in entityValidationErrors.ValidationErrors)
//                     {
//                         // Access validation error details
//                         var propertyName = validationError.PropertyName;
//                         var errorMessage = validationError.ErrorMessage;

//                         // Handle or log the validation error as needed
//                     }
//                 }

//                 return InternalServerError(ex);
//             }
//             catch (Exception e)
//             {
//                 return InternalServerError(e);
//             }
//         }
