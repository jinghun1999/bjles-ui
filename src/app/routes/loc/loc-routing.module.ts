import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LocPlantComponent } from './plant/plant.component';

const routes: Routes = [

  { path: 'plant', component: LocPlantComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LocRoutingModule { }
