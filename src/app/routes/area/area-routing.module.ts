import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AreaPlantComponent } from './plant/plant.component';
import { AreaWorkshopComponent } from './workshop/workshop.component';
import { AreaRouteComponent } from './route/route.component';
import { AreaLocationComponent } from './location/location.component';
import { AreaDockComponent } from './dock/dock.component';

const routes: Routes = [

  { path: 'plant', component: AreaPlantComponent },
  { path: 'workshop', component: AreaWorkshopComponent },
  { path: 'route', component: AreaRouteComponent },
  { path: 'location', component: AreaLocationComponent },
  { path: 'dock', component: AreaDockComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AreaRoutingModule { }
