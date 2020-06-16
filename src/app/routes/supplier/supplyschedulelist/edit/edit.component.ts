import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';

@Component({
  selector: 'app-supplier-supplyschedulelist-edit',
  templateUrl: './edit.component.html',
})
export class SupplierSupplyschedulelistEditComponent implements OnInit {
  record: any;

  size = 'small';
  pre_lists = [];
  sub_workshops = [];
  sub_supplier = new ItemData();

  pc_all = true;

  loading = false;
  title = '';

  constructor(
    private modal: NzModalRef,
    private msg: NzMessageService,
    public http: _HttpClient,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
  ) { }

  ngOnInit(): void {
    if (this.record.add === true) {
      this.title = '添加';
      let today = new Date();
      today = this.cfun.getDateFormat(today, 'YYYY/MM/DD');
      this.record.start_end_time = [new Date(today + ' 00:00:00'), new Date(today + ' 23:59:59')];
    } else {
      this.title = '编辑';
      this.record.start_end_time = [this.record.start_time, this.record.end_time];
    }

    this.capi.getPlant().subscribe(
      (res: any) => {
        this.pre_lists = res;
        if (this.pre_lists.length > 0) {
          this.sub_workshops = this.pre_lists[0].children;
          if (this.record.add === true) this.record.PlantID = this.pre_lists[0].value;
          this.plantChange(this.record.PlantID);

          this.workshopChange(this.record.WorkshopID);
        }
      },
      (err: any) => this.msg.error('获取不到工厂车间信息！！'),
    );

    this.initCodeDetail();
  }

  save() {
    this.loading = true;
    this.record.workday = this.cfun.getDate(this.record.workday);

    this.http.post('/supplier/SupplyScheduleSave', this.record).subscribe(
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
    // this.record.WorkshopID = '';
  }

  workshopChange(value: string): void {
    this.getListItems(true, 'supplier');
  }

  initCodeDetail() {
    // this.capi.getCodeDetailInfo('part_type', '', 'int').subscribe((res: any) => {
    //   this.sub_part_type.data = res;
    // });
    // this.capi.getCodeDetailInfo('Shift', '', 'string').subscribe((res: any) => {
    //   this.sub_Shift.data = res;
    // });
  }

  getListItems(value: any, type: any): void {
    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);

    if (value && this.record.WorkshopID.toString() !== tmp_data.last_workshop) {
      if (this.record.WorkshopID.length > 0) {
        this.loading = true;
        this.capi.getListItems(type, this.record.PlantID, this.record.WorkshopID.toString()).subscribe(
          (res: any) => {
            tmp_data.data = res;
          },
          (err: any) => this.msg.error('获取数据失败!'),
        );
        this.loading = false;
        tmp_data.last_workshop = this.record.WorkshopID.toString();
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
