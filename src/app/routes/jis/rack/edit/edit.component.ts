import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { SFSchema, SFUISchema } from '@delon/form';
import { CommonApiService } from '@core';

@Component({
  selector: 'app-jis-rack-edit',
  templateUrl: './edit.component.html',
})
export class JisRackEditComponent implements OnInit {
  record: any = {};
  loading = true;
  plants = [];
  workshops = [];
  codes = {
    c1: [],
    c2: []
  };

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private capi: CommonApiService,
  ) { }

  ngOnInit(): void {
    this.capi.getPlant().subscribe((res: any) => {
      this.plants = res;
    });

    this.capi.getCodes('rack_state,jis_rack_seq').subscribe((res: any) => {
      this.loading = false;
      this.codes = res;
      if (this.record.plant) {
        this.record.route_type = this.record.route_type + '';
        this.plantChange(this.record.plant);
      }
    });
  }
  plantChange(v: string) {
    const l = this.plants.find(p => p.value === v);
    this.workshops = l.children;
  }
  getListItems(value: any, type: string): void {
    // tslint:disable-next-line: no-eval
    const t = eval('this.sub_' + type);
    this.loading = true;
    this.capi.getListItems(type, this.record.plant, this.record.workshop, this.record.supplier).subscribe((res: any) => {
      t.data = res;
      this.loading = false;
    });
    //  eval('this.record.'+type)
  }
  save(value: any) {
    this.http.post('/jis/postRack', this.record).subscribe((res: any) => {
      if (res.successful) {
        // this.msg.success('保存成功');
        this.modal.close(true);
        this.close();
      } else {
        // this.msg.error(res.message);
      }
    });
  }

  close() {
    this.modal.destroy();
  }
}
