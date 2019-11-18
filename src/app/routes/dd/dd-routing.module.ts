import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DdSheetlistComponent } from './sheetlist/sheetlist.component';
import { DdManualComponent } from './manual/manual.component';
import { DdSheetlistInComponent } from './sheetlist-in/sheetlist-in.component';
import { DdSheetlistPartComponent } from './sheetlist-part/sheetlist-part.component';
import { DdKanbanscanlistComponent } from './kanbanscanlist/kanbanscanlist.component';
import { DdKanbanversionlistComponent } from './kanbanversionlist/kanbanversionlist.component';
import { DdKanbanscanqueryComponent } from './kanbanscanquery/kanbanscanquery.component';

const routes: Routes = [

  { path: 'sheetlist', component: DdSheetlistComponent },
  { path: 'manual', component: DdManualComponent },
  { path: 'sheetlist-in', component: DdSheetlistInComponent },
  { path: 'sheetlist-part', component: DdSheetlistPartComponent },
  { path: 'kanbanscanlist', component: DdKanbanscanlistComponent },
  { path: 'kanbanversionlist', component: DdKanbanversionlistComponent },
  { path: 'kanbanscanquery', component: DdKanbanscanqueryComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DdRoutingModule { }
