import { NgModule } from '@angular/core';
import { SharedModule } from './node_modules/@shared';
import { AreaRoutingModule } from './area-routing.module';
import { AreaPlantComponent } from './plant/plant.component';

const COMPONENTS = [
  AreaPlantComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    AreaRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class AreaModule { }
