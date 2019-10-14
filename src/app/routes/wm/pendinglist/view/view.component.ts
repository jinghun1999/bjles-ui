import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { Component, OnInit, Input } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STWidthMode } from '@delon/abc';
import { CommonApiService } from '@core';

@Component({
  selector: 'app-wm-pendinglist-view',
  templateUrl: './view.component.html',
})
export class WmPendinglistViewComponent implements OnInit {
  constructor(
    private modal: NzModalRef,
    public msgSrv: NzMessageService,
    public http: _HttpClient,
    public msg: NzMessageService,
    private capi: CommonApiService,
  ) {}
  expandForm = true;

  size: 'small';
  record: any = {};
  part_no = '';
  i: any;
  dataDetail: any[] = [];
  widthMode: STWidthMode = {};
  columnsDetail: STColumn[] = [
    { title: '零件号', index: 'PartNumber' },
    { title: '零件名称', index: 'PartName' },
    { title: '供应商代码', index: 'SupplierID' },
    { title: '供应商名称', index: 'SupplierName' },
    { title: '库位', index: 'ULoc' },
    { title: '可疑箱数', index: 'PackQty' },
    { title: '标准包装数', index: 'PackStdQty' },
    { title: '原封存件数', index: 'LockPartQty' },
    { title: '剩余封存件数', index: 'PartQty' },
    { title: '解封数量', index: 'Qty' },
    { title: '解封原因', index: 'Reason' },
    { title: '解封时间', index: 'CreatedTime' },
    { title: '解封人', index: 'employee_name' },
  ];
  // PackCountSum: any = 0;

  ngOnInit() {
    // this.capi.getActions(this.actionPath).subscribe((res: any) => {
    //   this.dataAction = res;
    // });
    this.getData();
  }
  getData() {
    const url = '/wm/GetPendingDetailPager';
    this.http.post(url, this.record).subscribe(
      res => {
        this.dataDetail = res.data;
        // tslint:disable-next-line: radix
        // this.dataDetail.forEach(p => (this.PackCountSum += parseInt(p.required_pack_count)));
      },
      (err: any) => this.msg.error('获取不到物料单明细信息！！'),
    );
  }
  close() {
    this.modal.destroy();
  }
}
