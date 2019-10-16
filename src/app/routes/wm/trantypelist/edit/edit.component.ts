import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';

@Component({
  selector: 'app-wm-trantypelist-edit',
  templateUrl: './edit.component.html',
})
export class WmTrantypelistEditComponent implements OnInit {
  record: any;
  // actionPath = 'Warehouse/wmtrantypeedit.aspx';

  size = 'small';
  pre_lists = [];
  sub_workshops = [];

  // dataAction: any[] = [];

  sub_wm_tran_sheet_type = new ItemData();
  sub_SAPMode = new ItemData();

  pc_all = true;

  loading = false;
  title = '';

  constructor(
    private modal: NzModalRef,
    private msg: NzMessageService,
    public http: _HttpClient,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
  ) {}

  ngOnInit(): void {
    // tslint:disable-next-line: prefer-conditional-expression
    if (this.record.add === true) {
      this.title = '添加';
    } else {
      this.title = '编辑';
      this.record.add = false;
    }

    this.capi.getPlant().subscribe(
      (res: any) => {
        this.pre_lists = res;
        if (this.pre_lists.length > 0) {
          this.sub_workshops = this.pre_lists[0].children;
          // this.record.plant = this.pre_lists[0].value;
          if (this.record.add === true && (this.record.PlantId === null || this.record.PlantId === undefined))
            this.record.PlantId = this.pre_lists[0].value;
          this.plantChange(this.record.PlantId);
        }
      },
      (err: any) => this.msg.error('获取不到工厂车间信息！！'),
    );

    // // toolBar
    // this.capi.getActions(this.actionPath).subscribe((res: any) => {
    //   this.dataAction = res;
    // });

    this.initCodeDetail();
  }

  save() {
    this.loading = true;
    // this.record.workday = this.cfun.getDate(this.record.workday);

    this.http.post('/wm/TranTypeSave', this.record).subscribe(
      (res: any) => {
        if (res.successful) {
          this.msg.success(res.data);
          this.loading = false;
          this.modal.close(true);
        } else {
          this.msg.error(res.message);
          this.loading = false;
        }
      },
      (err: any) => this.msg.error('保存失败!'),
    );
  }

  close() {
    this.modal.destroy();
  }
  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshops = l.children;
    // this.record.workshop = '';
  }

  initCodeDetail() {
    this.capi.getCodeDetailInfo('SAPMode', '', 'int').subscribe((res: any) => {
      this.sub_SAPMode.data = res;
      if (this.record.add === true && (this.record.SapSourceMode === null || this.record.SapSourceMode === undefined))
        this.record.SapSourceMode = res[0].val;
      if (this.record.add === true && (this.record.SapTargetMode === null || this.record.SapTargetMode === undefined))
        this.record.SapTargetMode = res[0].val;
    });
    this.capi.getCodeDetailInfo('wm_tran_sheet_type', '', 'string').subscribe((res: any) => {
      this.sub_wm_tran_sheet_type.data = res;
    });
  }

  getListItems(value: any, type: any): void {
    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);

    if (value && this.record.workshop.toString() !== tmp_data.last_workshop) {
      if (this.record.workshop.length > 0) {
        this.loading = true;
        this.capi.getListItems(type, this.record.PlantId, this.record.workshop.toString()).subscribe(
          (res: any) => {
            tmp_data.data = res;
          },
          (err: any) => this.msg.error('获取数据失败!'),
        );
        this.loading = false;
        tmp_data.last_workshop = this.record.workshop.toString();
      } else {
        tmp_data.data = [];
        tmp_data.last_workshop = '';
      }

      if (this.record.add === true) {
        // tslint:disable-next-line: no-eval
        eval('this.record.' + type + ' = undefined ;');
      }
    }
  }
}
