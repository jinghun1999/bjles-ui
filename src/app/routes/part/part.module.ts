import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { PartRoutingModule } from './part-routing.module';
import { PartPartlistComponent } from './partlist/partlist.component';
import { PartPartcardlistComponent } from './partcardlist/partcardlist.component';
import { PartPartlistEditComponent } from './partlist/edit/edit.component';

const COMPONENTS = [PartPartcardlistComponent, PartPartlistComponent];
const COMPONENTS_NOROUNT = [
  
  PartPartlistEditComponent];

@NgModule({
  imports: [SharedModule, PartRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class PartModule {}
