import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { DdRoutingModule } from './dd-routing.module';
import { DdSheetlistComponent } from './sheetlist/sheetlist.component';
import { DdManualComponent } from './manual/manual.component';


const COMPONENTS = [
  DdSheetlistComponent,
  DdManualComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    DdRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class DdModule { }
