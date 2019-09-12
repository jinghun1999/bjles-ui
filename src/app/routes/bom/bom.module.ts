import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { BomRoutingModule } from './bom-routing.module';
import { BomVsnbomlistComponent } from './vsnbomlist/vsnbomlist.component';
import { BomVinbomlistComponent } from './vinbomlist/vinbomlist.component';
import { BomVehiclesequencelistComponent } from './vehiclesequencelist/vehiclesequencelist.component';
import { BomVsnbomversionlistComponent } from './vsnbomversionlist/vsnbomversionlist.component';

const COMPONENTS = [
  BomVsnbomlistComponent,
  BomVinbomlistComponent,
  BomVehiclesequencelistComponent,
  BomVsnbomversionlistComponent,
];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, BomRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class BomModule {}
