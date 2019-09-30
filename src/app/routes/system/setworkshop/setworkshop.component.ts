import { Component, OnInit } from '@angular/core';
import { NzModalRef, NzMessageService, TransferItem } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { CommonApiService } from '@core';

@Component({
  selector: 'app-system-setworkshop',
  templateUrl: './setworkshop.component.html',
})
export class SystemSetworkshopComponent implements OnInit {
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
    const actionPath = 'SystemManagement/SetWorkShopForUser.aspx';
    const url = `/system/GetWorkshopsByUserID?user_id=${this.record.user_id}`;

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
    const workshops = this.list.filter(p => p.direction === 'right');
    this.http.post(`/system/SaveWorkshopsByUser`, { workshops, user_id: this.record.user_id }).subscribe(
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

  filterOption(inputValue: string, item: any): boolean {
    return (
      (item.plant !== null && item.plant !== undefined && item.plant.indexOf(inputValue) > -1) ||
      (item.workshop_name !== null &&
        item.workshop_name !== undefined &&
        item.workshop_name.indexOf(inputValue) > -1) ||
      (item.workshop !== null && item.workshop !== undefined && item.workshop.indexOf(inputValue) > -1)
    );
  }
}
