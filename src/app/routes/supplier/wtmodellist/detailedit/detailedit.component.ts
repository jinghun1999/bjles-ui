import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';

@Component({
  selector: 'app-supplier-wtmodellist-detailedit',
  templateUrl: './detailedit.component.html',
})
export class SupplierWtmodellistDetaileditComponent implements OnInit {
  record: any;

  size = 'small';
  pre_lists = [];
  sub_workshops = [];
  sub_part_type = new ItemData();
  sub_supplier = new ItemData();
  sub_route = new ItemData();

  loading = false;
  title = '';

  constructor(
    private modal: NzModalRef,
    private msg: NzMessageService,
    public http: _HttpClient,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
  ) {}

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
    this.getListItems(true, 'route');
    this.getListItems(true, 'supplier');

    // tslint:disable-next-line: prefer-conditional-expression
    if (this.record.add === true) {
      this.title = '添加';
    } else {
      this.title = '编辑';
    }
  }

  save() {
    this.loading = true;
    this.http.post('/supplier/WTDetailSave', this.record).subscribe(
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
  }

  getListItems(value: any, type: any): void {
    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);

    if (value && this.record.workshop !== tmp_data.last_workshop) {
      if (this.record.workshop !== undefined && this.record.workshop.length > 0) {
        this.loading = true;
        this.capi.getListItems(type, this.record.plant, this.record.workshop).subscribe(
          (res: any) => {
            tmp_data.data = res;
            this.loading = false;
          },
          (err: any) => this.msg.error('获取数据失败!'),
        );
        tmp_data.last_workshop = this.record.workshop;
      } else {
        tmp_data.data = [];
        tmp_data.last_workshop = '';
      }
    }
  }
}
