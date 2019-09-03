import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn } from '@delon/abc';

@Component({
  selector: 'app-dd-detail',
  templateUrl: './detail.component.html',
})
export class DdDetailComponent implements OnInit {
  @Input() record: any;
  constructor(
    private modal: NzModalRef,
    public msgSrv: NzMessageService,
    public http: _HttpClient,
    public msg: NzMessageService,
  ) {}
  dataDetail: any[] = [];
  dataBasicInfo: any[] = [];
  columnsDetail: STColumn[] = [
    { title: '零件序号', index: '' },
    { title: '拉动方式', index: '', sort: true },
    { title: '零件号', index: 'part_code', sort: true },
    { title: '零件名称', index: 'part_name', sort: true },
    { title: '需求箱数', index: 'required_pack_count', sort: true },
    { title: '整包装数', index: 'pack_size', sort: true },
    { title: '包装型号', index: 'pack_type', sort: true },
    { title: '需求件数', index: 'required_part_count', sort: true },
    { title: '发货箱数', index: 'pack_count', sort: true },
    { title: '发货件数', index: 'part_count', sort: true },
    { title: '实际箱数', index: 'actual_pack_count', sort: true },
    { title: '实际件数', index: 'actual_part_count', sort: true },
    { title: '库位', index: 'dloc', sort: true },
    { title: '工位', index: 'uloc', sort: true },
    { title: '源库位地址', index: 'rdc_dloc', sort: true },
  ];

  ngOnInit() {
    this.http.get('/dd/GetRunSheetDetail?runsheet_id=' + this.record.runsheet_id).subscribe(
      res => {
        this.dataBasicInfo = res.data.basicinfo;
        this.dataDetail = res.data.detail;
      },
      (err: any) => this.msg.error('获取不到物料单明细信息！！'),
    );
  }

  close() {
    this.modal.destroy();
  }
}
