import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';

@Component({
  selector: 'app-supplier-workschedulelist-edit',
  templateUrl: './edit.component.html',
})
export class SupplierWorkschedulelistEditComponent implements OnInit {
  record: any;

  size = 'small';
  pre_lists = [];
  sub_workshops = [];
  sub_Work_schedule_type = new ItemData();
  sub_Shift = new ItemData();
  sub_card_state = new ItemData();

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
    this.capi.getPlant().subscribe(
      (res: any) => {
        this.pre_lists = res;
        if (this.pre_lists.length > 0) {
          this.sub_workshops = this.pre_lists[0].children;
          // this.record.plant = this.pre_lists[0].value;
          if (this.record.plant === undefined || this.record.plant === '') this.record.plant = this.pre_lists[0].value;
          this.plantChange(this.record.plant);
        }
      },
      (err: any) => this.msg.error('获取不到工厂车间信息！！'),
    );

    this.initCodeDetail();

    // tslint:disable-next-line: prefer-conditional-expression
    if (this.record.add === true) {
      this.title = '添加';
      this.record.Periods = '0';
      this.record.work_schedule_type = this.sub_Work_schedule_type.data.find(p => p.text === '工作时间').val;
      this.record.shift = this.sub_Shift.data[0].val;
      let today = new Date();
      today = this.cfun.getDateFormat(today, 'YYYY/MM/DD');
      this.record.start_end_time = [new Date(today + ' 00:00:00'), new Date(today + ' 23:59:59')];
      this.record.work_date = today;
      this.record.work_schedule_sn = 0;
    } else {
      this.title = '编辑';
      this.record.start_end_time = [this.record.start_time, this.record.end_time];
    }
  }

  save() {
    this.loading = true;
    this.record.work_date = this.cfun.getDate(this.record.work_date);
    this.record.start_end_time = this.cfun.getSelectDate(this.record.start_end_time);

    this.http.post('/supplier/WorkScheduleSave', this.record).subscribe(
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
    this.capi.getCodeDetailInfo('Work_schedule_type', '', 'int').subscribe((res: any) => {
      this.sub_Work_schedule_type.data = res;
    });
    this.capi.getCodeDetailInfo('Shift', '', 'string').subscribe((res: any) => {
      this.sub_Shift.data = res;
    });
  }
}
