import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { Component, OnInit, Input } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STWidthMode } from '@delon/abc';

@Component({
  selector: 'app-dd-detail',
  templateUrl: './detail.component.html',
})
export class DdDetailComponent implements OnInit {
  constructor(
    private modal: NzModalRef,
    public msgSrv: NzMessageService,
    public http: _HttpClient,
    public msg: NzMessageService,
  ) { }
  size: 'small';
  record: any = {};
  i: any;
  dataDetail: any[] = [];
  widthMode: STWidthMode = {};
  columnsDetail: STColumn[] = [
    { title: '零件序号', type: 'no', width: 60 },
    { title: '拉动方式', index: 'interface_types' },
    { title: '零件号', index: 'part_code' },
    { title: '零件名称', index: 'part_name', render: 'rd_part', },
    { title: '需求箱数', index: 'required_pack_count' },
    { title: '整包装数', index: 'pack_size' },
    { title: '包装型号', index: 'pack_type' },
    { title: '需求件数', index: 'required_part_count' },
    { title: '发货箱数', index: 'actual_send_pack_qty' },
    { title: '发货件数', index: 'actual_send_part_qty' },
    { title: '实际箱数', index: 'actual_pack_count' },
    { title: '实际件数', index: 'actual_part_count' },
    { title: '库位', index: 'dloc' },
    { title: '工位', index: 'uloc' },
    { title: '源库位地址', index: 'rdc_dloc' },
  ];
  PackCountSum: any = 0;

  ngOnInit() {
    this.http.get('/dd/GetRunSheetDetail?runsheet_id=' + this.record.runsheet_id).subscribe(
      res => {
        this.dataDetail = res.data;
        // tslint:disable-next-line: radix
        this.dataDetail.forEach(p => (this.PackCountSum += parseInt(p.required_pack_count)));
      },
      (err: any) => this.msg.error('获取不到物料单明细信息！！'),
    );
  }

  close() {
    this.modal.destroy();
  }
}
