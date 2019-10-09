import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { Component, OnInit, Input } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STWidthMode } from '@delon/abc';
import { CommonApiService } from '@core';

@Component({
  selector: 'app-wm-inboundrequestlist-edit',
  templateUrl: './edit.component.html',
})
export class WmInboundrequestlistEditComponent implements OnInit {
  constructor(
    private modal: NzModalRef,
    public msgSrv: NzMessageService,
    public http: _HttpClient,
    public msg: NzMessageService,
    private capi: CommonApiService,
  ) {}
  expandForm = true;
  dataAction: any[] = [];
  actionPath = 'WMManagement/InboundRequestDetailEdit.aspx';

  size: 'small';
  record: any = {};
  part_no = '';
  i: any;
  dataDetail: any[] = [];
  widthMode: STWidthMode = {};
  columnsDetail: STColumn[] = [
    { title: '序号', type: 'no', width: 60 },
    { title: '工厂', index: 'PlantId' },
    { title: '车间', index: 'WorkshopId' },
    { title: '零件号', index: 'PartNumber' },
    { title: '零件名称', index: 'PartName' },
    { title: '供应商代码', index: 'SupplierId' },
    { title: '供应商名称', index: 'SupplierName' },
    { title: '库位', index: 'Dloc' },
    { title: '工位', index: 'Uloc' },
    { title: '配送线路代码', index: 'RouteId' },
    { title: 'Dock编号', index: 'DockId' },
    { title: 'DN单号', index: 'DN' },
    { title: '订单类型', index: 'OrderType' },
    { title: '标准包装数', index: 'PackStdQty' },
    { title: '需求箱数', index: 'RequiredPackCount' },
    { title: '需求件数', index: 'RequiredPartCount' },
    { title: '实送箱数', index: 'RealSendPackCount' },
    { title: '实送件数', index: 'RealSendPartCount' },
    { title: '实收箱数', index: 'ReceivedPackCount' },
    { title: '实收件数', index: 'ReceivedPartCount' },

    { title: '备注', index: 'Remark' },
  ];
  // PackCountSum: any = 0;

  ngOnInit() {
    this.capi.getActions(this.actionPath).subscribe((res: any) => {
      this.dataAction = res;
    });
    this.getData();
  }
  getData() {
    let url = '/wm/GetInboundRequestDetailPager?InboundRequestId=' + this.record.InboundRequestId + '&part_no=';
    if (this.part_no !== '') url = `${url}${this.part_no}`;
    this.http.get(url).subscribe(
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
