import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { CommonApiService } from '@core';

@Component({
  selector: 'app-area-workshop-edit',
  templateUrl: './edit.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreaWorkshopEditComponent implements OnInit {
  record: any = {};
  i: any;
  loading = true;
  plants = [];
  codes = {
    c1: [],
    c2: [],
    c3: []
  }

  constructor(
    private modal: NzModalRef,
    public msg: NzMessageService,
    public http: _HttpClient,
    private capi: CommonApiService,
    // cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    // this.http.get(`/user/${this.record.id}`).subscribe(res => this.i = res);
    this.capi.getPlant().subscribe(
      (res: any) => {
        this.plants = res;
        // this.cdr.detectChanges();
      },
      (err: any) => this.msg.error('获取不到工厂车间信息'),
    );

    this.capi.getCodes('workshop_type,workshop_workschedule_type,workshop_due').subscribe((res: any) => {
      this.loading = false;
      this.codes = res;
      if (this.record.plant) {
        this.record.workshop_type = this.record.workshop_type.toString();
        this.record.workschedule_type = this.record.workschedule_type.toString();
        this.record.workshop_due = this.record.workshop_due.toString();
      }
      // this.cdr.markForCheck();
    });
  }
  save() {
    this.http.post('/area/postWorkshop', this.record).subscribe((res: any) => {
      if (res.successful) {
        this.msg.success('保存成功');
        this.modal.close(true);
        this.close();
      } else {
        this.msg.error(res.message);
      }
    });
  }
  close() {
    this.modal.destroy();
  }
}
