import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AreaPlantComponent } from './plant/plant.component';

const routes: Routes = [

  { path: 'plant', component: AreaPlantComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AreaRoutingModule { }
