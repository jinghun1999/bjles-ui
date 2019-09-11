import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { JisRoutingModule } from './jis-routing.module';
import { JisSheetlistComponent } from './sheetlist/sheetlist.component';
import { JisRackComponent } from './rack/rack.component';

const COMPONENTS = [
  JisSheetlistComponent,
  JisRackComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    JisRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class JisModule { }
