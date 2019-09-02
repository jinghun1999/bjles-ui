import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-dd-detail',
  templateUrl: './detail.component.html',
})
export class DdDetailComponent implements OnInit {
  @Input() record: any;
  constructor(private modal: NzModalRef, public msgSrv: NzMessageService, public http: _HttpClient) { }

  ngOnInit() {

  }

  save() {
    this.http.post('/area/postPlant', this.record).subscribe((res: any) => {
      if (res.successful) {
        this.msgSrv.success('保存成功');
        this.modal.close(true);
        this.close();
      } else {
        this.msgSrv.error(res.message);
      }
    });
  }

  close() {
    this.modal.destroy();
  }
}
