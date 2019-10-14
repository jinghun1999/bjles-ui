import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { Component, OnInit, Input } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STWidthMode, STData } from '@delon/abc';
import { CommonApiService } from '@core';

@Component({
  selector: 'app-wm-diffwriteoff-view',
  templateUrl: './view.component.html',
})
export class WmDiffwriteoffViewComponent implements OnInit {
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
    { title: '序号', type: 'no' },
    { title: '零件号', index: 'PartNumber' },
    { title: '零件名称', index: 'PartName' },
    { title: '供应商', index: 'SupplierId' },
    { title: '标准包装数', index: 'PackStdQty' },
    { title: '箱数', index: 'PackQty' },
    {
      title: '散件数',
      format: (item: STData, col: STColumn, index: number) => {
        return item.PartQty - item.PackStdQty * item.PackQty + '';
      },
      sort: { key: 'PackQty' },
    },
    { title: '件数', index: 'PartQty' },
    { title: '备注', index: 'Remark' },
  ];
  // PackCountSum: any = 0;

  ngOnInit() {
    // this.capi.getActions(this.actionPath).subscribe((res: any) => {
    //   this.dataAction = res;
    // });
    this.getData();
  }
  getData() {
    const url = '/wm/GetDiffWirteoffDetailPager';
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
