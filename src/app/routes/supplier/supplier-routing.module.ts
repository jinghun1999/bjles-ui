import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SupplierSupplierlistComponent } from './supplierlist/supplierlist.component';
import { SupplierPurchasinglistComponent } from './purchasinglist/purchasinglist.component';

const routes: Routes = [

  { path: 'supplierlist', component: SupplierSupplierlistComponent },
  { path: 'purchasinglist', component: SupplierPurchasinglistComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupplierRoutingModule { }
