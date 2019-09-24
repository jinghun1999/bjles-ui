import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SupplierSupplierlistComponent } from './supplierlist/supplierlist.component';
import { SupplierPurchasinglistComponent } from './purchasinglist/purchasinglist.component';
import { SupplierWorkschedulelistComponent } from './workschedulelist/workschedulelist.component';
import { SupplierWtmodellistComponent } from './wtmodellist/wtmodellist.component';
import { SupplierWorkdaymodellistComponent } from './workdaymodellist/workdaymodellist.component';
import { SupplierWorkdaylistComponent } from './workdaylist/workdaylist.component';
import { SupplierRespondlistComponent } from './respondlist/respondlist.component';
import { SupplierSupplydatelistComponent } from './supplydatelist/supplydatelist.component';
import { SupplierComprehensivelistComponent } from './comprehensivelist/comprehensivelist.component';
import { SupplierSupplyschedulelistComponent } from './supplyschedulelist/supplyschedulelist.component';

const routes: Routes = [

  { path: 'supplierlist', component: SupplierSupplierlistComponent },
  { path: 'purchasinglist', component: SupplierPurchasinglistComponent },
  { path: 'workschedulelist', component: SupplierWorkschedulelistComponent },
  { path: 'wtmodellist', component: SupplierWtmodellistComponent },
  { path: 'workdaymodellist', component: SupplierWorkdaymodellistComponent },
  { path: 'workdaylist', component: SupplierWorkdaylistComponent },
  { path: 'respondlist', component: SupplierRespondlistComponent },
  { path: 'supplydatelist', component: SupplierSupplydatelistComponent },
  { path: 'comprehensivelist', component: SupplierComprehensivelistComponent },
  { path: 'supplyschedulelist', component: SupplierSupplyschedulelistComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupplierRoutingModule { }
