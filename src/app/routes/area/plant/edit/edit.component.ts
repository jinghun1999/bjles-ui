import { Component, OnInit } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-area-plant-edit',
  templateUrl: './edit.component.html',
})
export class AreaPlantEditComponent implements OnInit {
  record: any = {};
  i: any;

  constructor(
    private modal: NzModalRef,
    public msgSrv: NzMessageService,
    public http: _HttpClient
  ) { }

  ngOnInit(): void {
    // this.http.get(`/user/${this.record.id}`).subscribe(res => this.i = res);
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
