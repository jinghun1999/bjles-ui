import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WmTerminallistComponent } from './terminallist/terminallist.component';
import { WmInboundsheetlistComponent } from './inboundsheetlist/inboundsheetlist.component';
import { WmIssuesheetlistComponent } from './issuesheetlist/issuesheetlist.component';
import { WmInboundrequestlistComponent } from './inboundrequestlist/inboundrequestlist.component';
import { WmIssuerequestlistComponent } from './issuerequestlist/issuerequestlist.component';
import { WmIssueconfirmlistComponent } from './issueconfirmlist/issueconfirmlist.component';
import { WmInboundconfirmlistComponent } from './inboundconfirmlist/inboundconfirmlist.component';

const routes: Routes = [

  { path: 'terminallist', component: WmTerminallistComponent },
  { path: 'inboundsheetlist', component: WmInboundsheetlistComponent },
  { path: 'issuesheetlist', component: WmIssuesheetlistComponent },
  { path: 'inboundrequestlist', component: WmInboundrequestlistComponent },
  { path: 'issuerequestlist', component: WmIssuerequestlistComponent },
  { path: 'issueconfirmlist', component: WmIssueconfirmlistComponent },
  { path: 'inboundconfirmlist', component: WmInboundconfirmlistComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WMRoutingModule { }
