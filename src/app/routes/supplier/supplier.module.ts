import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { SupplierRoutingModule } from './supplier-routing.module';
import { SupplierSupplierlistComponent } from './supplierlist/supplierlist.component';
import { SupplierSupplierlistEditComponent } from './supplierlist/edit/edit.component';
import { SupplierPurchasinglistComponent } from './purchasinglist/purchasinglist.component';
import { SupplierPurchasinglistEditComponent } from './purchasinglist/edit/edit.component';
import { SupplierWorkschedulelistComponent } from './workschedulelist/workschedulelist.component';
import { SupplierWorkschedulelistEditComponent } from './workschedulelist/edit/edit.component';
import { SupplierWtmodellistComponent } from './wtmodellist/wtmodellist.component';
import { SupplierWtmodellistEditComponent } from './wtmodellist/edit/edit.component';
import { SupplierWtmodellistDetaileditComponent } from './wtmodellist/detailedit/detailedit.component';
import { SupplierWorkdaymodellistComponent } from './workdaymodellist/workdaymodellist.component';
import { SupplierWorkdaylistComponent } from './workdaylist/workdaylist.component';
import { SupplierWorkdaymodellistEditComponent } from './workdaymodellist/edit/edit.component';
import { SupplierWorkdaylistEditComponent } from './workdaylist/edit/edit.component';
import { SupplierRespondlistComponent } from './respondlist/respondlist.component';
import { SupplierRespondlistEditComponent } from './respondlist/edit/edit.component';

const COMPONENTS = [
  SupplierSupplierlistComponent,
  SupplierPurchasinglistComponent,
  SupplierWorkschedulelistComponent,
  SupplierWtmodellistComponent,
  SupplierWorkdaymodellistComponent,
  SupplierWorkdaylistComponent,
  SupplierRespondlistComponent];
const COMPONENTS_NOROUNT = [
  SupplierSupplierlistEditComponent,
  SupplierPurchasinglistEditComponent,
  SupplierWorkschedulelistEditComponent,
  SupplierWtmodellistEditComponent,
  SupplierWtmodellistDetaileditComponent,
  SupplierWorkdaymodellistEditComponent,
  SupplierWorkdaylistEditComponent,
  SupplierRespondlistEditComponent];

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
