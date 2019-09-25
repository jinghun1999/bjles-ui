import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrintPrintlistComponent } from './printlist/printlist.component';
import { PrintDdprintlistComponent } from './ddprintlist/ddprintlist.component';
import { PrintDefaultprintlistComponent } from './defaultprintlist/defaultprintlist.component';

const routes: Routes = [

  { path: 'printlist', component: PrintPrintlistComponent },
  { path: 'ddprintlist', component: PrintDdprintlistComponent },
  { path: 'defaultprintlist', component: PrintDefaultprintlistComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrintRoutingModule { }
