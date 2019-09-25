import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { PrintRoutingModule } from './print-routing.module';
import { PrintPrintlistComponent } from './printlist/printlist.component';
import { PrintDdprintlistComponent } from './ddprintlist/ddprintlist.component';
import { PrintPrintlistEditComponent } from './printlist/edit/edit.component';
import { PrintDdprintlistEditComponent } from './ddprintlist/edit/edit.component';
import { PrintDefaultprintlistComponent } from './defaultprintlist/defaultprintlist.component';
import { PrintDefaultprintlistEditComponent } from './defaultprintlist/edit/edit.component';

const COMPONENTS = [
  PrintPrintlistComponent,
  PrintDdprintlistComponent,
  PrintDefaultprintlistComponent];
const COMPONENTS_NOROUNT = [
  PrintPrintlistEditComponent,
  PrintDdprintlistEditComponent,
  PrintDefaultprintlistEditComponent];

@NgModule({
  imports: [
    SharedModule,
    PrintRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class PrintModule { }
