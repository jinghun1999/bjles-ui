import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService, TransferItem } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { CommonApiService } from '@core';

@Component({
  selector: 'app-system-setprivilege-ext',
  templateUrl: './setprivilege-ext.component.html',
})
export class SystemSetprivilegeExtComponent implements OnInit {
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
      actionPath = 'SystemManagement/SetPrivilegeExtToRole.aspx';
      url = `/system/GetPrivilegeExtsByRole?role_id=${this.record.role_id}`;
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
    const PrivilegeIds = this.list
      .filter(p => p.direction === 'right')
      .map(p => p.PrivilegeId)
      .toString();
    let url = '';
    if (this.operation === 'role')
      url = `/system/SavePrivilegeExtsByRole?PrivilegeIds=${PrivilegeIds}&role_id=${this.record.role_id}`;
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
      item.PrivilegeName.indexOf(inputValue) > -1 ||
      (item.PrivilegeCode !== null && item.PrivilegeCode !== undefined && item.PrivilegeCode.indexOf(inputValue) > -1)
    );
  }
}
