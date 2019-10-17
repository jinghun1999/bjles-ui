import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-wm-monthplanlist-edit',
  templateUrl: './edit.component.html',
})
export class WmMonthplanlistEditComponent implements OnInit {
  record: any;

  size = 'small';
  sub_supplier = new ItemData();

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
      this.record.add = false;
    }

    this.GetSupplierOfPartNo(this.record.PartNo, 'supplier');

    this.initCodeDetail();
  }

  save() {
    this.loading = true;
    this.record.YearMonth = this.cfun.getDate(this.record.YearMonth);

    this.http.post('/wm/MonthplanSave', this.record).subscribe(
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

  initCodeDetail() {
    // this.capi.getCodeDetailInfo('part_type', '', 'int').subscribe((res: any) => {
    //   this.sub_part_type.data = res;
    // });
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
        this.capi.getListItems(type, this.record.plant, this.record.workshop.toString()).subscribe(
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
        // tslint:disable-next-line: no-eval
        eval('this.record.' + type + ' = undefined ;');
      }
    }
  }

  GetSupplierOfPartNo(value: any, type: any) {
    const part_no = value;
    this.record.SupplierID = undefined;
    if (part_no === '') {
      this.msg.error('请输入零件号!');
      this.sub_supplier.data = null;
      return false;
    }

    this.http
      .get(`/supplier/GetSupplierOfPartNo?part_no=${part_no}`)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.sub_supplier.data = res.data;
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );
  }
}
