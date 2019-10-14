import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';

@Component({
  selector: 'app-print-ddprintlist-edit',
  templateUrl: './edit.component.html',
})
export class PrintDdprintlistEditComponent implements OnInit {
  record: any;

  size = 'small';
  pre_lists = [];
  sub_workshops = [];
  sub_part_type = new ItemData();
  sub_supplier_print = new ItemData();
  sub_printer_name = new ItemData();
  sub_route = new ItemData();
  sub_dock = new ItemData();
  sub_rack = new ItemData();

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
    // tslint:disable-next-line: prefer-conditional-expression
    if (this.record.add === true) {
      this.title = '添加';
    } else {
      this.title = '编辑';
      // this.record.supplier = this.record.supplier + '';
      // this.record.route = this.record.route + '';
    }

    this.capi.getPlant().subscribe(
      (res: any) => {
        this.pre_lists = res;
        if (this.pre_lists.length > 0) {
          this.sub_workshops = this.pre_lists[0].children;
          // this.record.plant = this.pre_lists[0].value;
          if (this.record.add === true) this.record.plant = this.pre_lists[0].value;
          this.plantChange(this.record.plant);

          this.workshopChange(this.record.workshop);
          this.supplierChange(this.record.supplier);
        }
      },
      (err: any) => this.msg.error('获取不到工厂车间信息！！'),
    );

    this.initCodeDetail();
  }

  save() {
    this.loading = true;
    this.record.workday = this.cfun.getDate(this.record.workday);

    this.http.post('/print/DDPrintSave', this.record).subscribe(
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

  workshopChange(value: string): void {
    this.getListItems(true, 'supplier_print');
    this.getListItems(true, 'dock');
    this.getListItems(true, 'route');
  }

  supplierChange(value: string): void {
    this.getListItems(true, 'rack');
    this.getListItems(true, 'printer_name');
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
    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);

    if (value && this.record.workshop.toString() !== tmp_data.last_workshop) {
      if (this.record.workshop.length > 0) {
        this.loading = true;
        this.capi
          .getListItems(type, this.record.plant, this.record.workshop.toString(), this.record.supplier)
          .subscribe(
            (res: any) => {
              tmp_data.data = res;
            },
            (err: any) => this.msg.error('获取数据失败!'),
          );
        this.loading = false;
        tmp_data.last_workshop = this.record.workshop.toString();
      } else {
        tmp_data.data = [];
        tmp_data.last_workshop = '';
      }

      if (this.record.add === true) {
        if (type === 'supplier_print') this.record.supplier = undefined;
        // tslint:disable-next-line: no-eval
        else eval('this.record.' + type + ' = undefined ;');
      }
    }
  }
}
