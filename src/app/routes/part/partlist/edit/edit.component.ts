import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData } from 'src/app/model';
import { CommonApiService, CommonFunctionService, EnumPrivilegeCode } from '@core';

@Component({
  selector: 'app-part-partlist-edit',
  templateUrl: './edit.component.html',
})
export class PartPartlistEditComponent implements OnInit {
  record: any = {};
  size = 'small';
  pre_lists = [];
  sub_workshops = [];
  sub_part_type = new ItemData();
  sub_part_state = new ItemData();
  sub_monitor_category = new ItemData();
  sub_ver_record = new ItemData();
  sub_ptr_flag = new ItemData();
  pc_all = true;
  pc_part_type = true;
  pc_is_direct = true;

  loading = false;

  constructor(
    private modal: NzModalRef,
    public msg: NzMessageService,
    public http: _HttpClient,
    private capi: CommonApiService,
  ) { }

  ngOnInit(): void {
    this.capi.getPlant().subscribe(
      (res: any) => {
        this.pre_lists = res;
        if (this.pre_lists.length > 0) {
          this.sub_workshops = this.pre_lists[0].children;
          // this.record.plant = this.pre_lists[0].value;
          this.plantChange(this.record.plant);
        }
      },
      (err: any) => this.msg.error('获取不到工厂车间信息！！'),
    );

    this.initCodeDetail();
    this.getPrivilegeExt();
  }

  save() {
    this.loading = true;
    this.http.post('/part/PartSaveData', this.record).subscribe(
      (res: any) => {
        if (res.successful) {
          this.msg.success(res.data);
          this.loading = false;
          this.modal.close(true);
        } else {
          this.msg.error(res.message);
          this.loading = false;
        }
      },
      (err: any) => this.msg.error('保存失败!'),
    );
  }

  close() {
    this.modal.destroy();
  }
  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshops = l.children;
    // this.record.workshop = '';
  }

  initCodeDetail() {
    this.capi.getCodeDetailInfo('part_type', '', 'int').subscribe((res: any) => {
      this.sub_part_type.data = res;
    });
    this.capi.getCodeDetailInfo('monitor_category', '', 'int').subscribe((res: any) => {
      this.sub_monitor_category.data = res;
    });
    this.capi.getCodeDetailInfo('ver_record', '', 'int').subscribe((res: any) => {
      this.sub_ver_record.data = res;
    });
    this.capi.getCodeDetailInfo('part_state', '', 'int').subscribe((res: any) => {
      this.sub_part_state.data = res;
    });
    this.capi.getCodeDetailInfo('ptr_flag', '', 'int').subscribe((res: any) => {
      this.sub_ptr_flag.data = res;
    });
  }

  getPrivilegeExt() {
    this.http
      .get('/System/GetPrivilegeExt?PrivilegeCode=' + EnumPrivilegeCode.PartManageIsDirectOnly)
      .subscribe((res: any) => {
        this.pc_is_direct = res.data;
        this.http
          .get('/System/GetPrivilegeExt?PrivilegeCode=' + EnumPrivilegeCode.PartManagePullTypeOnly)
          .subscribe((res1: any) => {
            this.pc_part_type = res.data;
            if (this.pc_is_direct || this.pc_part_type) this.pc_all = false;
            else {
              this.pc_is_direct = true;
              this.pc_part_type = true;
            }
          });
      });
  }
}
