import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { CommonApiService, CommonFunctionService } from '@core';
import { ItemData } from 'src/app/model';

@Component({
  selector: 'app-system-userlist-edit',
  templateUrl: './edit.component.html',
})
export class SystemUserlistEditComponent implements OnInit {
  record: any;

  size = 'small';
  pc_all = true;

  sub_user_state = new ItemData();
  sub_user_type = new ItemData();
  sub_shift = new ItemData();

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
    if (this.record.add === true) {
      this.title = '添加';
    }
    //  else {
    //   this.record.supplier = this.record.supplier + '';
    //   this.record.route = this.record.route + '';
    // }

    this.initCodeDetail();
  }

  save() {
    this.loading = true;
    this.record.workday = this.cfun.getDate(this.record.workday);

    this.http.post('/system/UserInfoSave', this.record).subscribe(
      (res: any) => {
        if (res.successful) {
          this.msg.success(res.data);
          this.modal.close(true);
        } else {
          this.msg.error(res.message);
        }
        this.loading = false;
      },
      (err: any) => this.msg.error('保存失败!'),
    );
  }

  close() {
    this.modal.destroy();
  }

  initCodeDetail() {
    this.capi.getCodeDetailInfo('user_state', '', 'int').subscribe((res: any) => {
      this.sub_user_state.data = res;
    });
    this.capi.getCodeDetailInfo('user_type', '', 'int').subscribe((res: any) => {
      this.sub_user_type.data = res;
    });
    this.capi.getCodeDetailInfo('Shift', '', 'int').subscribe((res: any) => {
      this.sub_shift.data = res;
    });
  }

  getListItems(value: any, type: any): void {
    if (!value) return;

    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);

    this.loading = true;
    this.capi.getListItems(type, this.record.plant, '').subscribe(
      (res: any) => {
        tmp_data.data = res;
      },
      (err: any) => this.msg.error('获取数据失败!'),
    );
    this.loading = false;

    if (this.record.add === true) {
      // tslint:disable-next-line: no-eval
      eval('this.record.' + type + ' = undefined ;');
    }
  }
}
