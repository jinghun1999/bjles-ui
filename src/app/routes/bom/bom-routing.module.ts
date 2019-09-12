import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BomVsnbomlistComponent } from './vsnbomlist/vsnbomlist.component';
import { BomVinbomlistComponent } from './vinbomlist/vinbomlist.component';
import { BomVehiclesequencelistComponent } from './vehiclesequencelist/vehiclesequencelist.component';
import { BomVsnbomversionlistComponent } from './vsnbomversionlist/vsnbomversionlist.component';

const routes: Routes = [
  { path: 'vsnbomlist', component: BomVsnbomlistComponent },
  { path: 'vinbomlist', component: BomVinbomlistComponent },
  { path: 'vehiclesequencelist', component: BomVehiclesequencelistComponent },
  { path: 'vsnbomversionlist', component: BomVsnbomversionlistComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BomRoutingModule {}
