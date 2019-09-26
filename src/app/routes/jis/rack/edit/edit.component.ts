import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { SFSchema, SFUISchema } from '@delon/form';
import { CommonApiService } from '@core';
import { ItemData } from 'src/app/model';

@Component({
  selector: 'app-jis-rack-edit',
  templateUrl: './edit.component.html',
})
export class JisRackEditComponent implements OnInit {
  record: any = {};
  loading = true;
  plants = [];
  sub_workshops = [];
  sub_supplier = new ItemData();
  sub_route = new ItemData();
  sub_dock = new ItemData();
  sub_rack_state = new ItemData();
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
      this.plants = res;

      this.capi.getCodes('rack_state,jis_rack_seq').subscribe((rs1: any) => {
        this.loading = false;

        this.codes = rs1;

        if (!this.record.add) {
          // 修改界面需要默认初始化下拉数据
          this.record.seq = this.record.seq + '';
          this.record.status = this.record.status + '';
          this.sub_workshops = this.plants.find(p => p.value === this.record.plant).children;
          this.getListItems(null, 'supplier', false);
          this.getListItems(null, 'route', false);
          this.getListItems(null, 'dock', false);
        }
      });
    });
  }

  plantChange(v: string, init: boolean = false) {
    const l = this.plants.find(p => p.value === v);
    this.sub_workshops = l.children;

    this.record.workshop = '';
    // this.wsChange(null);
  }

  wsChange(v: string) {
    this.record.dock = '';
    this.record.route = '';
    this.record.supplier = '';
    this.record.receive_supplier = '';
  }
  getListItems(value: any, type: string, clear: boolean = false): void {
    // tslint:disable-next-line: no-eval
    const t = eval(`this.sub_${type}`);
    // this.loading = true;
    this.capi
      .getListItems(type, this.record.plant, this.record.workshop, this.record.supplier)
      .subscribe((res: any) => {
        t.data = res;
        // this.loading = false;
      });
    if (clear) {
      // tslint:disable-next-line: no-eval
      eval(`this.record.${type}=''`);
    }
  }
  save() {
    this.http.post('/jis/postRack', this.record).subscribe(
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
