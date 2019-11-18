import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { DdRoutingModule } from './dd-routing.module';
import { DdSheetlistComponent } from './sheetlist/sheetlist.component';
import { DdManualComponent } from './manual/manual.component';
import { DdSheetlistInComponent } from './sheetlist-in/sheetlist-in.component';
import { DdDetailComponent } from './detail/detail.component';
import { DdSheetlistPartComponent } from './sheetlist-part/sheetlist-part.component';
import { DdKanbanscanlistComponent } from './kanbanscanlist/kanbanscanlist.component';
import { DdKanbanversionlistComponent } from './kanbanversionlist/kanbanversionlist.component';
import { DdKanbanscanqueryComponent } from './kanbanscanquery/kanbanscanquery.component';

const COMPONENTS = [DdSheetlistComponent, DdManualComponent, DdSheetlistInComponent,
  DdSheetlistPartComponent,
  DdKanbanscanlistComponent,
  DdKanbanversionlistComponent,
  DdKanbanscanqueryComponent];
const COMPONENTS_NOROUNT = [DdDetailComponent];

@NgModule({
  imports: [SharedModule, DdRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class DdModule {}
