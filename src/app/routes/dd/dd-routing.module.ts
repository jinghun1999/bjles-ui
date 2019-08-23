import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DdSheetlistComponent } from './sheetlist/sheetlist.component';
import { DdManualComponent } from './manual/manual.component';
import { DdSheetlistInComponent } from './sheetlist-in/sheetlist-in.component';

const routes: Routes = [

  { path: 'sheetlist', component: DdSheetlistComponent },
  { path: 'manual', component: DdManualComponent },
  { path: 'sheetlist-in', component: DdSheetlistInComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DdRoutingModule { }
