import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { InterfaceRoutingModule } from './interface-routing.module';
import { InterfaceImportexportComponent } from './importexport/importexport.component';

const COMPONENTS = [
  InterfaceImportexportComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    InterfaceRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class InterfaceModule { }
