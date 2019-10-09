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

const COMPONENTS = [
  WmTerminallistComponent,
  WmInboundsheetlistComponent,
  WmIssuesheetlistComponent,
  WmInboundrequestlistComponent,
  WmIssuerequestlistComponent,
  WmIssueconfirmlistComponent,
  WmInboundconfirmlistComponent];
const COMPONENTS_NOROUNT = [
  WmTerminallistEditComponent,
  WmInboundconfirmlistEditComponent,
  WmInboundrequestlistEditComponent,
  WmInboundsheetlistEditComponent,
  WmIssuesheetlistEditComponent,
  WmIssuerequestlistEditComponent,
  WmIssueconfirmlistEditComponent];

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
