import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { LocRoutingModule } from './loc-routing.module';
import { LocPlantComponent } from './plant/plant.component';

const COMPONENTS = [
  LocPlantComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    LocRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class LocModule { }
