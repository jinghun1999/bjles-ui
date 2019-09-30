import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService, TransferItem } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { CommonApiService } from '@core';

@Component({
  selector: 'app-system-setaction',
  templateUrl: './setaction.component.html',
})
export class SystemSetactionComponent implements OnInit {
  record: any = {};
  dataAction: any[] = [];
  operation = '';

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
      actionPath = 'SystemManagement/SetActionToRole.aspx';
      url = `/system/GetActionsByRole?role_id=${this.record.role_id}`;
      this.operation = 'role';
    }
    // } else if (this.record.menu_id > 0) {
    //   actionPath = 'SystemManagement/SetRoleForMenu.aspx';
    //   url = `/system/GetRolesByMenuID?menu_id=${this.record.menu_id}`;
    //   this.operation = 'menu';
    // } else if (this.record.action_id > 0) {
    //   actionPath = 'SystemManagement/SetRoleForAction.aspx';
    //   url = `/system/GetRolesByActionID?action_id=${this.record.action_id}`;
    //   this.operation = 'action';
    // }

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
    const action_ids = this.list
      .filter(p => p.direction === 'right')
      .map(p => p.Action_id)
      .toString();
    let url = '';
    if (this.operation === 'role')
      url = `/system/SaveActionsByRole?action_ids=${action_ids}&role_id=${this.record.role_id}`;
    else if (this.operation === 'menu')
      url = `/system/SaveRolesByMenu?action_ids=${action_ids}&menu_id=${this.record.menu_id}`;
    else if (this.operation === 'action')
      url = `/system/SaveRolesByAction?action_ids=${action_ids}&action_id=${this.record.action_id}`;
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
      (item.Action_name !== null && item.Action_name !== undefined && item.Action_name.indexOf(inputValue) > -1) ||
      (item.Action_name_cn !== null &&
        item.Action_name_cn !== undefined &&
        item.Action_name_cn.indexOf(inputValue) > -1) ||
      // (item.Action_Description !== null && item.Action_Description !== undefined && item.Action_Description.indexOf(inputValue) > -1) ||
      (item.menu_name !== null && item.menu_name !== undefined && item.menu_name.indexOf(inputValue) > -1) ||
      (item.Action_url !== null && item.Action_url !== undefined && item.Action_url.indexOf(inputValue) > -1)
    );
  }
}
