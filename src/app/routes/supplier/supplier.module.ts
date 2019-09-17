import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { SupplierRoutingModule } from './supplier-routing.module';
import { SupplierSupplierlistComponent } from './supplierlist/supplierlist.component';
import { SupplierSupplierlistEditComponent } from './supplierlist/edit/edit.component';
import { SupplierPurchasinglistComponent } from './purchasinglist/purchasinglist.component';
import { SupplierPurchasinglistEditComponent } from './purchasinglist/edit/edit.component';

const COMPONENTS = [
  SupplierSupplierlistComponent,
  SupplierPurchasinglistComponent];
const COMPONENTS_NOROUNT = [
  SupplierSupplierlistEditComponent,
  SupplierPurchasinglistEditComponent];

@NgModule({
  imports: [
    SharedModule,
    SupplierRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class SupplierModule { }
