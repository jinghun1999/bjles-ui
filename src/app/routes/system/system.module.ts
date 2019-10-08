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
import { SystemProcesslistEditComponent } from './processlist/edit/edit.component';
import { SystemCodelistDetailComponent } from './codelist/detail/detail.component';
import { SystemUserlistComponent } from './userlist/userlist.component';
import { SystemUserlistEditComponent } from './userlist/edit/edit.component';
import { SystemRoleComponent } from './setrole/setrole.component';
import { SystemRolelistComponent } from './rolelist/rolelist.component';
import { SystemRolelistEditComponent } from './rolelist/edit/edit.component';
import { SystemMenulistComponent } from './menulist/menulist.component';
import { SystemActionlistComponent } from './actionlist/actionlist.component';
import { SystemMenulistEditComponent } from './menulist/edit/edit.component';
import { SystemActionlistEditComponent } from './actionlist/edit/edit.component';
import { SystemSetworkshopComponent } from './setworkshop/setworkshop.component';
import { SystemSetsupplierComponent } from './setsupplier/setsupplier.component';
import { SystemSetmenuComponent } from './setmenu/setmenu.component';
import { SystemSetactionComponent } from './setaction/setaction.component';
import { SystemSetuserComponent } from './setuser/setuser.component';
import { SystemSetprivilegeExtComponent } from './setprivilege-ext/setprivilege-ext.component';

const COMPONENTS = [
  SystemAppconfiglistComponent,
  SystemEventlistComponent,
  SystemEventloglistComponent,
  SystemOperationloglistComponent,
  SystemInfoErrorlistComponent,
  SystemSysconfiglistComponent,
  SystemProcesslistComponent,
  SystemCodelistComponent,
  SystemCachinglistComponent,
  SystemUserlistComponent,
  SystemRolelistComponent,
  SystemMenulistComponent,
  SystemActionlistComponent,
];
const COMPONENTS_NOROUNT = [
  SystemAppconfiglistEditComponent,
  SystemSysconfiglistEditComponent,
  SystemCodelistEditComponent,
  SystemProcesslistEditComponent,
  SystemCodelistDetailComponent,
  SystemUserlistEditComponent,
  SystemRoleComponent,
  SystemRolelistEditComponent,
  SystemMenulistEditComponent,
  SystemActionlistEditComponent,
  SystemSetworkshopComponent,
  SystemSetsupplierComponent,
  SystemSetmenuComponent,
  SystemSetactionComponent,
  SystemSetuserComponent,
  SystemSetprivilegeExtComponent,
];

@NgModule({
  imports: [SharedModule, SystemRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class SystemModule {}
