import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService, TransferItem } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { CommonApiService } from '@core';

@Component({
  selector: 'app-system-setuser',
  templateUrl: './setuser.component.html',
})
export class SystemSetuserComponent implements OnInit {
  record: any = {};
  dataAction: any[] = [];
  operation = '';
  title = '';

  list: any[] = [];
  showSearch = true;

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public msg: NzMessageService,
    private capi: CommonApiService,
    public http: _HttpClient,
  ) {}

  ngOnInit(): void {
    let actionPath = '';
    let url = '';

    if (this.record.role_id > 0) {
      actionPath = 'SystemManagement/SetUserToRole.aspx';
      url = `/system/GetUsersByRole?role_id=${this.record.role_id}`;
      this.operation = 'role';
      this.title = this.record.role_name + '(角色)';
      // } else if (this.record.menu_id > 0) {
      //   actionPath = 'SystemManagement/SetRoleForMenu.aspx';
      //   url = `/system/GetRolesByMenuID?menu_id=${this.record.menu_id}`;
      //   this.operation = 'menu';
      // } else if (this.record.action_id > 0) {
      //   actionPath = 'SystemManagement/SetRoleForAction.aspx';
      //   url = `/system/GetRolesByActionID?action_id=${this.record.action_id}`;
      //   this.operation = 'action';
    }

    this.capi.getActions(actionPath).subscribe((res: any) => {
      this.dataAction = res.filter(p => p.action_name !== 'Search');
    });

    this.http.get(url).subscribe(
      res => {
        if (res.successful) {
          this.list = res.data;
        } else {
          this.msg.error(res.message);
        }
      },
      (err: any) => this.msg.error('系统异常'),
    );
  }

  save() {
    const user_ids = this.list
      .filter(p => p.direction === 'right')
      .map(p => p.user_id)
      .toString();
    let url = '';
    if (this.operation === 'role') url = `/system/SaveUsersByRole?user_ids=${user_ids}&role_id=${this.record.role_id}`;
    // else if (this.operation === 'menu')
    //   url = `/system/SaveRolesByMenu?role_ids=${role_ids}&menu_id=${this.record.menu_id}`;
    // else if (this.operation === 'action')
    //   url = `/system/SaveRolesByAction?role_ids=${role_ids}&action_id=${this.record.action_id}`;
    this.http.get(url).subscribe(
      (res: any) => {
        if (res.successful) {
          this.msg.success(res.data);
          this.modal.close(true);
        } else {
          this.msg.error(res.message);
        }
      },
      (err: any) => this.msg.error('保存失败!'),
    );
  }

  close() {
    this.modal.destroy();
  }

  convertItems(items: TransferItem[]): TransferItem[] {
    return items.filter(i => !i.hide);
  }

  toolBarOnClick(e: any) {
    switch (e.action_name) {
      case 'HideOrExpand':
        this.hideOrExpand();
        break;
      case 'Save':
        this.save();
        break;
    }
  }
  hideOrExpand() {
    this.showSearch = !this.showSearch;
  }

  select(ret: {}): void {
    // console.log('nzSelectChange', ret);
  }

  change(ret: {}): void {
    // console.log('nzChange', ret);
  }
  filterOption(inputValue: string, item: any): boolean {
    return (
      item.user_name.indexOf(inputValue) > -1 ||
      (item.employee_name !== null &&
        item.employee_name !== undefined &&
        item.employee_name.indexOf(inputValue) > -1) ||
      (item.shift_name !== null && item.shift_name !== undefined && item.shift_name.indexOf(inputValue) > -1) ||
      (item.user_type_name !== null &&
        item.user_type_name !== undefined &&
        item.user_type_name.indexOf(inputValue) > -1) ||
      (item.status_name !== null && item.status_name !== undefined && item.status_name.indexOf(inputValue) > -1)
    );
  }
}
