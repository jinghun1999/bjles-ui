import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JisSheetlistComponent } from './sheetlist/sheetlist.component';
import { JisRackComponent } from './rack/rack.component';

const routes: Routes = [

  { path: 'sheetlist', component: JisSheetlistComponent },
  { path: 'rack', component: JisRackComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JisRoutingModule { }
