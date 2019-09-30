import { Component, OnInit } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { STColumn } from '@delon/abc';

@Component({
  selector: 'app-jis-sheetlist-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.less'],
})
export class JisSheetlistDetailComponent implements OnInit {
  record: any = {};
  data: any = {};
  columnsDetail: STColumn[] = [
    { title: '吊架号', index: 'car_seqence' },
    { title: 'CSN', index: 'csn' },
    { title: '车型	', index: 'vehicle_config' },
    { title: 'VSN码', index: 'vsn' },
    { title: '零件号', index: 'part_no' },
    { title: '颜色', index: 'color' },
    { title: '空调', index: 'air' },
    { title: '上线时间', index: 'online_date', type: 'date' },
    { title: '供应商代码', index: 'supplier' },
  ];

  column_sum_part: STColumn[] = [
    { title: '零件号', index: 'JISPartNumber' },
    { title: '数量', index: 'CountJISPartNumber' },
  ];
  column_sum_car: STColumn[] = [
    { title: '车型', index: 'VehicleConfig' },
    { title: '数量', index: 'CountVehicleConfig' },
  ];
  constructor(private modal: NzModalRef, public msgSrv: NzMessageService, public http: _HttpClient) {}

  ngOnInit(): void {
    this.http.get('/jis/getJisDetail', { id: this.record.id }).subscribe(res => {
      if (res.successful) {
        this.data = res.data;
      } else {
        this.msgSrv.error(res.data);
      }
    });
  }

  close() {
    this.modal.destroy();
  }
}
