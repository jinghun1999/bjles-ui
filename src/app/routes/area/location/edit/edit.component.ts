import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { CommonApiService } from '@core';

@Component({
  selector: 'app-area-location-edit',
  templateUrl: './edit.component.html',
})
export class AreaLocationEditComponent implements OnInit {
  record: any = {};
  i: any;
  loading = true;
  plants = [];
  workshops = [];
  codes = {
    c1: [],
  }

  constructor(
    private modal: NzModalRef,
    public msg: NzMessageService,
    public http: _HttpClient,
    private capi: CommonApiService,
  ) {
  }

  ngOnInit(): void {
    this.capi.getPlant().subscribe((res: any) => { this.plants = res; });

    this.capi.getCodes('loc_type,').subscribe((res: any) => {
      this.loading = false;
      this.codes = res;
      if (this.record.plant) {
        this.record.loc_type = this.record.loc_type.toString();
        this.plantChange(this.record.plant);
      }
    });
  }
  save() {
    this.http.post('/area/postLocation', this.record).subscribe((res: any) => {
      if (res.successful) {
        this.msg.success('保存成功');
        this.modal.close(true);
        this.close();
      } else {
        this.msg.error(res.message);
      }
    });
  }
  close() {
    this.modal.destroy();
  }
  plantChange(v: string) {
    const l = this.plants.find(p => p.value === v);
    this.workshops = l.children;
  }
}
