import { Component, OnInit } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { CommonApiService } from '@core';
import { ItemData } from 'src/app/model';

@Component({
  selector: 'app-jis-rackpart-edit',
  templateUrl: './edit.component.html',
})
export class JisRackpartEditComponent implements OnInit {
  record: any = {};
  loading = true;
  plants = [];
  sub_workshops = [];
  sub_supplier = new ItemData();
  sub_rack = new ItemData();
  codes = {
    c1: [],
    c2: [],
  };

  constructor(
    private modal: NzModalRef,
    private msg: NzMessageService,
    public http: _HttpClient,
    private capi: CommonApiService,
  ) {}

  ngOnInit(): void {
    this.capi.getPlant().subscribe((res: any) => {
      this.loading = false;
      this.plants = res;
      this.record.plant = res[0].value;
      this.plantChange(this.record.plant);
    });
  }

  plantChange(v: string) {
    const l = this.plants.find(p => p.value === v);
    this.sub_workshops = l.children;

    this.record.workshop = this.sub_workshops[0].val;
    this.wsChange(null);
  }

  wsChange(v: string) {
    this.record.rack = '';
    this.record.supplier = '';
    this.record.jit_part_no = '';
  }
  getListItems(value: any, type: string, clear: boolean = false): void {
    // tslint:disable-next-line: no-eval
    const t = eval(`this.sub_${type}`);
    // this.loading = true;
    this.capi.getListItems(type, this.record.plant, this.record.workshop, this.record.supplier).subscribe(
      (res: any) => {
        t.data = res;
        // this.loading = false;
      },
      err => {},
    );
    if (clear) {
      // tslint:disable-next-line: no-eval
      eval(`this.record.${type}=''`);
    }
  }
  save() {
    this.http.post('/jis/postRackPart', this.record).subscribe(
      (res: any) => {
        if (res.successful) {
          // this.msg.success('保存成功');
          this.modal.close(true);
          this.close();
        } else {
          this.msg.error(res.message);
        }
      },
      (err: any) => {
        this.msg.error('数据验证失败，请检查');
      },
    );
  }

  close() {
    this.modal.destroy();
  }
}
