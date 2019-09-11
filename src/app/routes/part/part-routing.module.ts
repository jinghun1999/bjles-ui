import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PartPartlistComponent } from './partlist/partlist.component';
import { PartPartcardlistComponent } from './partcardlist/partcardlist.component';
import { PartPartstocklistComponent } from './partstocklist/partstocklist.component';

const routes: Routes = [
  { path: 'partcardlist', component: PartPartcardlistComponent },
  { path: 'partlist', component: PartPartlistComponent },

  { path: 'partstocklist', component: PartPartstocklistComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartRoutingModule {}
