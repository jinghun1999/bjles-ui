import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { Component, OnInit, Input } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STWidthMode } from '@delon/abc';
import { CommonApiService, CommonFunctionService } from '@core';

@Component({
  selector: 'app-wm-inventorylist-view',
  templateUrl: './view.component.html',
})
export class WmInventorylistViewComponent implements OnInit {
  constructor(
    private modal: NzModalRef,
    public msgSrv: NzMessageService,
    public http: _HttpClient,
    public msg: NzMessageService,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
  ) { }
  expandForm = true;

  size: 'small';
  record: any = {};
  part_no = '';
  i: any;
  dataDetail: any[] = [];
  widthMode: STWidthMode = {};
  columnsDetail: STColumn[] = [
    { title: '序号', type: 'no' },
    {
      title: '零件号',
      index: 'PartNumber',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.PartNumber, b.PartNumber);
        },
      },
    },
    {
      title: '零件名称',
      index: 'PartName',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.PartName, b.PartName);
        },
      },
    },
    {
      title: '供应商代码',
      index: 'SupplierId',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.SupplierId, b.SupplierId);
        },
      },
    },
    {
      title: '供应商名称',
      index: 'SupplierName',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.SupplierName, b.SupplierName);
        },
      },
    },
    {
      title: '库位地址',
      index: 'Dloc',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.Dloc, b.Dloc);
        },
      },
    },
    {
      title: '备注',
      index: 'Remark',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.Remark, b.Remark);
        },
      },
    },
  ];
  // PackCountSum: any = 0;

  ngOnInit() {
    // this.capi.getActions(this.actionPath).subscribe((res: any) => {
    //   this.dataAction = res;
    // });
    this.getData();
  }
  getData() {
    const url = '/wm/GetInventoryDetailPager';
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
