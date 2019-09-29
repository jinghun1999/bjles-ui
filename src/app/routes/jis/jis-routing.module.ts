import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JisSheetlistComponent } from './sheetlist/sheetlist.component';
import { JisRackComponent } from './rack/rack.component';
import { JisRackpartComponent } from './rackpart/rackpart.component';

const routes: Routes = [

  { path: 'sheetlist', component: JisSheetlistComponent },
  { path: 'rack', component: JisRackComponent },
  { path: 'rackpart', component: JisRackpartComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JisRoutingModule { }
