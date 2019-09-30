import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SystemAppconfiglistComponent } from './appconfiglist/appconfiglist.component';
import { SystemEventlistComponent } from './eventlist/eventlist.component';
import { SystemEventloglistComponent } from './eventloglist/eventloglist.component';
import { SystemOperationloglistComponent } from './operationloglist/operationloglist.component';
import { SystemInfoErrorlistComponent } from './info-errorlist/info-errorlist.component';
import { SystemSysconfiglistComponent } from './sysconfiglist/sysconfiglist.component';
import { SystemProcesslistComponent } from './processlist/processlist.component';
import { SystemCodelistComponent } from './codelist/codelist.component';
import { SystemCachinglistComponent } from './cachinglist/cachinglist.component';
import { SystemUserlistComponent } from './userlist/userlist.component';
import { SystemRolelistComponent } from './rolelist/rolelist.component';
import { SystemMenulistComponent } from './menulist/menulist.component';
import { SystemActionlistComponent } from './actionlist/actionlist.component';

const routes: Routes = [
  { path: 'appconfiglist', component: SystemAppconfiglistComponent },
  { path: 'eventlist', component: SystemEventlistComponent },
  { path: 'eventloglist', component: SystemEventloglistComponent },
  { path: 'operationloglist', component: SystemOperationloglistComponent },
  { path: 'info_errorlist', component: SystemInfoErrorlistComponent },
  { path: 'sysconfiglist', component: SystemSysconfiglistComponent },
  { path: 'processlist', component: SystemProcesslistComponent },
  { path: 'codelist', component: SystemCodelistComponent },
  { path: 'cachinglist', component: SystemCachinglistComponent },
  { path: 'userlist', component: SystemUserlistComponent },
  { path: 'rolelist', component: SystemRolelistComponent },
  { path: 'menulist', component: SystemMenulistComponent },
  { path: 'actionlist', component: SystemActionlistComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SystemRoutingModule {}
