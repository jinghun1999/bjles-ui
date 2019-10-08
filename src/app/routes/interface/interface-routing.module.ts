import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InterfaceImportexportComponent } from './importexport/importexport.component';

const routes: Routes = [

  { path: 'importexport', component: InterfaceImportexportComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InterfaceRoutingModule { }
