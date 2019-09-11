import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { PartRoutingModule } from './part-routing.module';
import { PartPartlistComponent } from './partlist/partlist.component';
import { PartPartcardlistComponent } from './partcardlist/partcardlist.component';
import { PartPartlistEditComponent } from './partlist/edit/edit.component';
import { PartPartlistViewComponent } from './partlist/view/view.component';
import { PartPartcardlistEditComponent } from './partcardlist/edit/edit.component';
import { PartPartstocklistComponent } from './partstocklist/partstocklist.component';
import { PartPartstocklistEditComponent } from './partstocklist/edit/edit.component';
import { PartPartstocksupplierComponent } from './partstocksupplier/partstocksupplier.component';
import { PartPartstocksupplierEditComponent } from './partstocksupplier/edit/edit.component';
import { PartPartpackagelistComponent } from './partpackagelist/partpackagelist.component';
import { PartPartpackagelistEditComponent } from './partpackagelist/edit/edit.component';
import { PartPartstocksupplierhistoryComponent } from './partstocksupplierhistory/partstocksupplierhistory.component';
import { PartPartstockhistoryComponent } from './partstockhistory/partstockhistory.component';
import { PartPartstocadjustComponent } from './partstocadjust/partstocadjust.component';

const COMPONENTS = [
  PartPartcardlistComponent,
  PartPartlistComponent,
  PartPartstocklistComponent,
  PartPartstocksupplierComponent,
  PartPartpackagelistComponent,
  PartPartstocksupplierhistoryComponent,
  PartPartstockhistoryComponent,
  PartPartstocadjustComponent,
];
const COMPONENTS_NOROUNT = [
  PartPartlistEditComponent,
  PartPartlistViewComponent,
  PartPartcardlistEditComponent,
  PartPartstocklistEditComponent,
  PartPartstocksupplierEditComponent,
  PartPartpackagelistEditComponent,
];

@NgModule({
  imports: [SharedModule, PartRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class PartModule {}
