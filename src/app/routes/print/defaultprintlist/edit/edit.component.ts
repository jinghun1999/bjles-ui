import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';

@Component({
  selector: 'app-print-defaultprintlist-edit',
  templateUrl: './edit.component.html',
})
export class PrintDefaultprintlistEditComponent implements OnInit {
  record: any;

  size = 'small';
  pre_lists = [];
  sub_workshops = [];
  sub_supplier_print = new ItemData();
  sub_part_type = new ItemData();
  sub_printer_name = new ItemData();

  pc_all = true;

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
    if (this.record.add === true) {
      this.title = '添加';
    }
    //  else {
    //   this.record.supplier = this.record.supplier + '';
    //   this.record.route = this.record.route + '';
    // }

    this.capi.getPlant().subscribe(
      (res: any) => {
        this.pre_lists = res;
        if (this.pre_lists.length > 0) {
          this.sub_workshops = this.pre_lists[0].children;
          // this.record.plant = this.pre_lists[0].value;
          if (this.record.add === true) this.record.plant = this.pre_lists[0].value;
          this.plantChange(this.record.plant);

          if (!this.record.add) this.getListItems(true, 'printer_name');
        }
      },
      (err: any) => this.msg.error('获取不到工厂车间信息！！'),
    );

    this.initCodeDetail();
  }

  save() {
    this.loading = true;
    this.record.workday = this.cfun.getDate(this.record.workday);

    this.http.post('/print/DefaultPrintSave', this.record).subscribe(
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
    this.getListItems(true, 'supplier_print');
  }

  initCodeDetail() {
    this.capi.getCodeDetailInfo('part_type', '', 'int').subscribe((res: any) => {
      this.sub_part_type.data = res;
    });
    // this.capi.getCodeDetailInfo('Shift', '', 'string').subscribe((res: any) => {
    //   this.sub_Shift.data = res;
    // });
  }

  getListItems(value: any, type: any): void {
    if (!value) return;
    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);

    if (type === 'printer_name' && (this.record.supplier === null || this.record.supplier === '')) return;

    this.loading = true;
    this.capi.getListItems(type, this.record.plant, '', this.record.supplier).subscribe(
      (res: any) => {
        tmp_data.data = res;
      },
      (err: any) => this.msg.error('获取数据失败!'),
    );
    this.loading = false;

    if (this.record.add === true) {
      // tslint:disable-next-line: no-eval
      eval('this.record.' + type + ' = undefined ;');
    }
  }
}
