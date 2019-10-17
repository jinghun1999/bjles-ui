import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { Component, OnInit, Input } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STWidthMode } from '@delon/abc';
import { CommonApiService } from '@core';

@Component({
  selector: 'app-wm-selfsheetlist-view',
  templateUrl: './view.component.html',
})
export class WmSelfsheetlistViewComponent implements OnInit {
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
  columnsDetail: STColumn[] = [
    { title: '序号', type: 'no' },
    { title: '零件号', index: 'PartNumber' },
    { title: '零件名称', index: 'PartName' },
    { title: '供应商', index: 'SupplierID' },
    { title: '需求箱数', index: 'MovedPackQty' },
    { title: '标准包装数', index: 'PackingQty' },
    { title: '需求散件数', index: 'MovedFragpartQty' },
    { title: '需求总件数', index: 'MovedPartQty' },
    { title: '单位', index: 'Unit' },
    { title: '源库位', index: 'Rdc_Dloc' },
    { title: '目的库位', index: 'Dloc' },
  ];
  // PackCountSum: any = 0;

  ngOnInit() {
    // this.capi.getActions(this.actionPath).subscribe((res: any) => {
    //   this.dataAction = res;
    // });
    this.getData();
  }
  getData() {
    const url = '/wm/GetselfsheetDetailPager';
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
