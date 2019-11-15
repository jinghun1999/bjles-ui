import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { Component, OnInit, Input } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STWidthMode, STData } from '@delon/abc';
import { CommonApiService, CommonFunctionService } from '@core';

@Component({
  selector: 'app-wm-inventoryreport-view',
  templateUrl: './view.component.html',
})
export class WmInventoryreportViewComponent implements OnInit {
  constructor(
    private modal: NzModalRef,
    public msgSrv: NzMessageService,
    public http: _HttpClient,
    public msg: NzMessageService,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
  ) { }
  expandForm = true;
  loading = false;

  size: 'small';
  record: any = {};
  dataAction: any[] = [];
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
      render: 'rd_part',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.PartName, b.PartName);
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
      title: '供应商',
      index: 'SupplierId',
      render: 'rd_supplier',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.SupplierId, b.SupplierId);
        },
      },
    },

    {
      title: '快照零件数',
      index: 'SnapshotPartQty',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.SnapshotPartQty, b.SnapshotPartQty);
        },
      },
    },
    {
      title: '实盘零件数',
      index: 'RealPartQty',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.RealPartQty, b.RealPartQty);
        },
      },
    },
    {
      title: '差异数量',
      index: 'DiffPartQty',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.DiffPartQty, b.DiffPartQty);
        },
      },
    },
    {
      title: '快照时间',
      index: 'SnapshotTime',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.SnapshotTime, b.SnapshotTime);
        },
      }, type: 'date', dateFormat: `YYYY-MM-DD HH:mm`
    },
    {
      title: '盘点时间',
      index: 'ResultTime',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.ResultTime, b.ResultTime);
        },
      }
      , type: 'date', dateFormat: `YYYY-MM-DD HH:mm`
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
    if (this.record.pageStatus !== undefined && this.record.pageStatus !== '') {
      let actionUrl = '';
      if (this.record.pageStatus === 'Unblock')
        actionUrl = 'Warehouse/StoreInventoryResultUnblock.aspx';
      else if (this.record.pageStatus === 'Confirm')
        actionUrl = 'Warehouse/StoreInventoryResultConfirm.aspx';
      // 确认差异
      this.capi.getActions(actionUrl).subscribe((res: any) => {
        this.dataAction = res;
      });
    }
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
  save() {
    let serverUrl = '';
    this.loading = true;
    if (this.record.pageStatus === 'Unblock')
      serverUrl = '/wm/InventoryResultUnblock';
    else if (this.record.pageStatus === 'Confirm')
      serverUrl = '/wm/InventoryConfirmedDiff';
    this.http.post(serverUrl, this.record).subscribe(
      (res: any) => {
        if (res.successful) {
          this.msg.success(res.data);
          this.modal.close(true);
        } else {
          this.msg.error(res.message);
        }
        this.loading = false;
      },
      (err: any) => this.msg.error('保存失败!'),
    );


  }
  toolBarOnClick(e: any) {
    switch (e.action_name) {
      case 'Save':
        // 确认差异
        this.save();
        break;

    }
  }

}
