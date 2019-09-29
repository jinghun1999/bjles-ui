import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { JisRoutingModule } from './jis-routing.module';
import { JisSheetlistComponent } from './sheetlist/sheetlist.component';
import { JisRackComponent } from './rack/rack.component';
import { JisRackEditComponent } from './rack/edit/edit.component';
import { JisRackpartComponent } from './rackpart/rackpart.component';
import { JisRackpartEditComponent } from './rackpart/edit/edit.component';

const COMPONENTS = [
  JisSheetlistComponent,
  JisRackComponent,
  JisRackpartComponent];
const COMPONENTS_NOROUNT = [
  JisRackEditComponent,
  JisRackpartEditComponent];

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
