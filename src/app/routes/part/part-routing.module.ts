import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PartPartlistComponent } from './partlist/partlist.component';
import { PartPartcardlistComponent } from './partcardlist/partcardlist.component';
import { PartPartstocklistComponent } from './partstocklist/partstocklist.component';
import { PartPartstocksupplierComponent } from './partstocksupplier/partstocksupplier.component';
import { PartPartpackagelistComponent } from './partpackagelist/partpackagelist.component';
import { PartPartstocksupplierhistoryComponent } from './partstocksupplierhistory/partstocksupplierhistory.component';
import { PartPartstockhistoryComponent } from './partstockhistory/partstockhistory.component';
import { PartPartstocadjustComponent } from './partstocadjust/partstocadjust.component';

const routes: Routes = [
  { path: 'partcardlist', component: PartPartcardlistComponent },
  { path: 'partlist', component: PartPartlistComponent },
  { path: 'partstocklist', component: PartPartstocklistComponent },
  { path: 'partstocksupplier', component: PartPartstocksupplierComponent },
  { path: 'partpackagelist', component: PartPartpackagelistComponent },
  { path: 'partstocksupplierhistory', component: PartPartstocksupplierhistoryComponent },
  { path: 'partstockhistory', component: PartPartstockhistoryComponent },
  { path: 'partstocadjust', component: PartPartstocadjustComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartRoutingModule {}
