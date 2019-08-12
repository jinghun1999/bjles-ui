import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DdSheetlistComponent } from './sheetlist/sheetlist.component';
import { DdManualComponent } from './manual/manual.component';

const routes: Routes = [

  { path: 'sheetlist', component: DdSheetlistComponent },
  { path: 'manual', component: DdManualComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DdRoutingModule { }
