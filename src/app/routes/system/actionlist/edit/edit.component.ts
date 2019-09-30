import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { CommonApiService, CommonFunctionService } from '@core';
import { PageInfo, SortInfo } from 'src/app/model';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-system-actionlist-edit',
  templateUrl: './edit.component.html',
})
export class SystemActionlistEditComponent implements OnInit {
  record: any;

  size = 'small';
  pc_all = true;

  dataMenu: any[] = [];
  dataActionTPL: any[] = [];

  loading = false;
  title = '';
  action_tpl = '';

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

      const q: any = {
        page: new PageInfo(),
        sort: new SortInfo(),
        action_TPL: true,
      };

      this.http.post('/system/GetActionPager', q).subscribe(
        res => {
          if (res.successful) {
            this.dataActionTPL = res.data.rows;
          } else {
            this.msg.error(res.message);
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );
    } else {
      this.record.parent_menu_id = this.record.parent_menu_id + '';
    }

    this.capi.GetMenusOfTree().subscribe((res: any) => {
      this.dataMenu = res;
    });

    this.initCodeDetail();
  }

  save() {
    this.loading = true;
    this.record.workday = this.cfun.getDate(this.record.workday);

    this.http.post('/system/ActionSave', this.record).subscribe(
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

  initCodeDetail() {
    // this.capi.getCodeDetailInfo('role_type', '', 'int').subscribe((res: any) => {
    //   this.sub_role_type.data = res;
    // });
    // this.capi.getCodeDetailInfo('user_type', '', 'int').subscribe((res: any) => {
    //   this.sub_user_type.data = res;
    // });
    // this.capi.getCodeDetailInfo('Shift', '', 'int').subscribe((res: any) => {
    //   this.sub_shift.data = res;
    // });
  }

  tplChange(value: any): void {
    const l = this.dataActionTPL.find(p => p.action_name === value);
    this.record.action_name = l.action_name;
    this.record.action_url = l.action_url;
    this.record.action_type = l.action_type;
    this.record.action_name_cn = l.action_name_cn;
    this.record.icon_name = l.icon_name;
    this.record.client_js = l.client_js;
    this.record.section = l.section;
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
