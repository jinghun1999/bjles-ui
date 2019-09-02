import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { AreaRoutingModule } from './area-routing.module';
import { AreaPlantComponent } from './plant/plant.component';
import { AreaPlantEditComponent } from './plant/edit/edit.component';

const COMPONENTS = [
  AreaPlantComponent];
const COMPONENTS_NOROUNT = [
  AreaPlantEditComponent];

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
