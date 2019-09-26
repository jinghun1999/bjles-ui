import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { SystemRoutingModule } from './system-routing.module';
import { SystemAppconfiglistComponent } from './appconfiglist/appconfiglist.component';
import { SystemAppconfiglistEditComponent } from './appconfiglist/edit/edit.component';
import { SystemEventlistComponent } from './eventlist/eventlist.component';
import { SystemEventloglistComponent } from './eventloglist/eventloglist.component';
import { SystemOperationloglistComponent } from './operationloglist/operationloglist.component';
import { SystemInfoErrorlistComponent } from './info-errorlist/info-errorlist.component';
import { SystemSysconfiglistComponent } from './sysconfiglist/sysconfiglist.component';
import { SystemSysconfiglistEditComponent } from './sysconfiglist/edit/edit.component';
import { SystemProcesslistComponent } from './processlist/processlist.component';
import { SystemCodelistComponent } from './codelist/codelist.component';
import { SystemCachinglistComponent } from './cachinglist/cachinglist.component';
import { SystemCodelistEditComponent } from './codelist/edit/edit.component';

const COMPONENTS = [
  SystemAppconfiglistComponent,
  SystemEventlistComponent,
  SystemEventloglistComponent,
  SystemOperationloglistComponent,
  SystemInfoErrorlistComponent,
  SystemSysconfiglistComponent,
  SystemProcesslistComponent,
  SystemCodelistComponent,
  SystemCachinglistComponent];
const COMPONENTS_NOROUNT = [
  SystemAppconfiglistEditComponent,
  SystemSysconfiglistEditComponent,
  SystemCodelistEditComponent];

@NgModule({
  imports: [
    SharedModule,
    SystemRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class SystemModule { }
