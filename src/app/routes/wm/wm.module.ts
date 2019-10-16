import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { WMRoutingModule } from './wm-routing.module';
import { WmTerminallistComponent } from './terminallist/terminallist.component';
import { WmTerminallistEditComponent } from './terminallist/edit/edit.component';
import { WmInboundsheetlistComponent } from './inboundsheetlist/inboundsheetlist.component';
import { WmIssuesheetlistComponent } from './issuesheetlist/issuesheetlist.component';
import { WmInboundrequestlistComponent } from './inboundrequestlist/inboundrequestlist.component';
import { WmIssuerequestlistComponent } from './issuerequestlist/issuerequestlist.component';
import { WmIssueconfirmlistComponent } from './issueconfirmlist/issueconfirmlist.component';
import { WmInboundconfirmlistComponent } from './inboundconfirmlist/inboundconfirmlist.component';
import { WmInboundconfirmlistEditComponent } from './inboundconfirmlist/edit/edit.component';
import { WmInboundrequestlistEditComponent } from './inboundrequestlist/edit/edit.component';
import { WmInboundsheetlistEditComponent } from './inboundsheetlist/edit/edit.component';
import { WmIssuesheetlistEditComponent } from './issuesheetlist/edit/edit.component';
import { WmIssuerequestlistEditComponent } from './issuerequestlist/edit/edit.component';
import { WmIssueconfirmlistEditComponent } from './issueconfirmlist/edit/edit.component';
import { WmWarehouselistComponent } from './warehouselist/warehouselist.component';
import { WmMonthplanlistComponent } from './monthplanlist/monthplanlist.component';
import { WmMonthplanlistEditComponent } from './monthplanlist/edit/edit.component';
import { WmMonthplanlistViewComponent } from './monthplanlist/view/view.component';
import { WmPendinglistComponent } from './pendinglist/pendinglist.component';
import { WmPendinglistEditComponent } from './pendinglist/edit/edit.component';
import { WmPendinglistViewComponent } from './pendinglist/view/view.component';
import { WmPendinglistUnblockComponent } from './pendinglist/unblock/unblock.component';
import { WmDiffwriteoffComponent } from './diffwriteoff/diffwriteoff.component';
import { WmDiffwriteoffViewComponent } from './diffwriteoff/view/view.component';
import { WmDiffwriteoffEditComponent } from './diffwriteoff/edit/edit.component';
import { WmMovewhlistComponent } from './movewhlist/movewhlist.component';
import { WmMovediffwhlistComponent } from './movediffwhlist/movediffwhlist.component';
import { WmMovewheditComponent } from './movewhedit/movewhedit.component';
import { WmMovewhviewComponent } from './movewhview/movewhview.component';
import { WmStockwarninglistComponent } from './stockwarninglist/stockwarninglist.component';
import { WmReturnlistComponent } from './returnlist/returnlist.component';
import { WmReturnlistEditComponent } from './returnlist/edit/edit.component';
import { WmReturnlistViewComponent } from './returnlist/view/view.component';
import { WmSelfsheetlistComponent } from './selfsheetlist/selfsheetlist.component';
import { WmSelfsheetlistViewComponent } from './selfsheetlist/view/view.component';
import { WmSelfsheetlistEditComponent } from './selfsheetlist/edit/edit.component';
import { WmTrantypelistComponent } from './trantypelist/trantypelist.component';
import { WmTrantypelistEditComponent } from './trantypelist/edit/edit.component';

const COMPONENTS = [
  WmTerminallistComponent,
  WmInboundsheetlistComponent,
  WmIssuesheetlistComponent,
  WmInboundrequestlistComponent,
  WmIssuerequestlistComponent,
  WmIssueconfirmlistComponent,
  WmInboundconfirmlistComponent,
  WmWarehouselistComponent,
  WmMonthplanlistComponent,
  WmPendinglistComponent,
  WmDiffwriteoffComponent,
  WmMovewhlistComponent,
  WmMovediffwhlistComponent,
  WmStockwarninglistComponent,
  WmReturnlistComponent,
  WmSelfsheetlistComponent,
  WmTrantypelistComponent];
const COMPONENTS_NOROUNT = [
  WmTerminallistEditComponent,
  WmInboundconfirmlistEditComponent,
  WmInboundrequestlistEditComponent,
  WmInboundsheetlistEditComponent,
  WmIssuesheetlistEditComponent,
  WmIssuerequestlistEditComponent,
  WmIssueconfirmlistEditComponent,
  WmMonthplanlistEditComponent,
  WmMonthplanlistViewComponent,
  WmPendinglistEditComponent,
  WmPendinglistViewComponent,
  WmPendinglistUnblockComponent,
  WmDiffwriteoffViewComponent,
  WmDiffwriteoffEditComponent,
  WmMovewheditComponent,
  WmMovewhviewComponent,
  WmReturnlistEditComponent,
  WmReturnlistViewComponent,
  WmSelfsheetlistViewComponent,
  WmSelfsheetlistEditComponent,
  WmTrantypelistEditComponent];

@NgModule({
  imports: [
    SharedModule,
    WMRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class WMModule { }
