import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JisSheetlistComponent } from './sheetlist/sheetlist.component';
import { JisRackComponent } from './rack/rack.component';
import { JisRackpartComponent } from './rackpart/rackpart.component';
import { JisSheetvinComponent } from './sheetvin/sheetvin.component';
import { JisSheetinnerComponent } from './sheetinner/sheetinner.component';

const routes: Routes = [

  { path: 'sheetlist', component: JisSheetlistComponent },
  { path: 'rack', component: JisRackComponent },
  { path: 'rackpart', component: JisRackpartComponent },
  { path: 'sheetvin', component: JisSheetvinComponent },
  { path: 'sheetinner', component: JisSheetinnerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JisRoutingModule { }
