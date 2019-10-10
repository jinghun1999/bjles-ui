import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { Component, OnInit, Input } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STWidthMode } from '@delon/abc';
import { CommonApiService } from '@core';

@Component({
  selector: 'app-wm-monthplanlist-view',
  templateUrl: './view.component.html',
})
export class WmMonthplanlistViewComponent implements OnInit {
  constructor(
    private modal: NzModalRef,
    public msgSrv: NzMessageService,
    public http: _HttpClient,
    public msg: NzMessageService,
    private capi: CommonApiService,
  ) {}
  expandForm = true;
  dataAction: any[] = [];
  actionPath = 'WMManagement/MonthPlanInEdit.aspx';

  size: 'small';
  record: any = {};
  i: any;
  dataDetail: any[] = [];
  widthMode: STWidthMode = {};
  columnsDetail: STColumn[] = [
    { title: '序号', type: 'no', width: 60 },
    { title: '计划员编号', index: 'item.PlannerCode' },
    { title: '零件号', index: 'item.PartNo' },
    { title: '零件名称', index: 'part_name' },
    { title: '供应商代码', index: 'item.SupplierID' },
    { title: '供应商名称', index: 'supplier_name' },
    { title: '交货月份', index: 'item.DeliveryTime', type: 'date', dateFormat: `YYYY-MM` },
    { title: '交货数量', index: 'item.DeliveryQty' },
    { title: '配比', index: 'item.Proportion' },
    { title: '优先级', index: 'item.Priority' },
    { title: '标识', index: 'item.Identifier' },
    { title: '导入人', index: 'user_name' },
    { title: '导入时间', index: 'item.CreateTime', type: 'date', dateFormat: `YYYY-MM-DD HH:mm:ss` },
  ];
  // PackCountSum: any = 0;

  ngOnInit() {
    // this.capi.getActions(this.actionPath).subscribe((res: any) => {
    //   this.dataAction = res;
    // });
    this.getData();
  }
  getData() {
    const url = '/wm/GetMonthPlanInPager';
    this.http.post(url, this.record).subscribe(
      res => {
        this.dataDetail = res.data;
      },
      (err: any) => this.msg.error('获取不到物料单明细信息！！'),
    );
  }
  close() {
    this.modal.destroy();
  }

  toolBarOnClick(e: any) {
    switch (e.action_name) {
      case 'Search':
        this.getData();
        this.expandForm = false;
        break;
      case 'HideOrExpand':
        this.hideOrExpand();
        break;
    }
  }
  hideOrExpand() {
    this.expandForm = !this.expandForm;
  }
}
