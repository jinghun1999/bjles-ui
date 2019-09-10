import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { AreaRoutingModule } from './area-routing.module';
import { AreaPlantComponent } from './plant/plant.component';
import { AreaPlantEditComponent } from './plant/edit/edit.component';
import { AreaWorkshopComponent } from './workshop/workshop.component';
import { AreaWorkshopEditComponent } from './workshop/edit/edit.component';
import { AreaRouteComponent } from './route/route.component';
import { AreaRouteEditComponent } from './route/edit/edit.component';

const COMPONENTS = [
  AreaPlantComponent,
  AreaWorkshopComponent,
  AreaRouteComponent];
const COMPONENTS_NOROUNT = [
  AreaPlantEditComponent,
  AreaWorkshopEditComponent,
  AreaRouteEditComponent,];

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
