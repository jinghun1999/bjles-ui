import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JisSheetlistComponent } from './sheetlist/sheetlist.component';

const routes: Routes = [

  { path: 'sheetlist', component: JisSheetlistComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JisRoutingModule { }
