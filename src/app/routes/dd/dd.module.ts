import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { DdRoutingModule } from './dd-routing.module';
import { DdSheetlistComponent } from './sheetlist/sheetlist.component';
import { DdManualComponent } from './manual/manual.component';
import { DdSheetlistInComponent } from './sheetlist-in/sheetlist-in.component';
import { DdDetailComponent } from './detail/detail.component';

const COMPONENTS = [DdSheetlistComponent, DdManualComponent, DdSheetlistInComponent];
const COMPONENTS_NOROUNT = [DdDetailComponent];

@NgModule({
  imports: [SharedModule, DdRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class DdModule {}
