import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PartPartlistComponent } from './partlist/partlist.component';
import { PartPartcardlistComponent } from './partcardlist/partcardlist.component';

const routes: Routes = [
  { path: 'partcardlist', component: PartPartcardlistComponent },
  { path: 'partlist', component: PartPartlistComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartRoutingModule {}
