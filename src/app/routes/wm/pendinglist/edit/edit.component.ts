import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';
import { format } from 'date-fns';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-wm-pendinglist-edit',
  templateUrl: './edit.component.html',
})
export class WmPendinglistEditComponent implements OnInit {
  record: any;

  size = 'small';
  pre_lists = [];
  sub_workshops = [];
  sub_supplier = new ItemData();
  sub_wm_suspicious_issuesclass = new ItemData();

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
      this.GetSupplierOfPartNo(this.record.PartNumber);
      this.getCurrentParts(this.record.PartNumber, this.record.SupplierID);
      this.record.FragParts = this.record.PartQty % this.record.PackStdQty;
    }

    this.capi.getPlant().subscribe(
      (res: any) => {
        this.pre_lists = res;
        if (this.pre_lists.length > 0) {
          this.sub_workshops = this.pre_lists[0].children;
          // this.record.plant = this.pre_lists[0].value;
          if (this.record.add === true) this.record.PlantID = this.pre_lists[0].value;
          this.plantChange(this.record.PlantID);
        }
      },
      (err: any) => this.msg.error('获取不到工厂车间信息！！'),
    );

    this.initCodeDetail();
  }

  save() {
    this.loading = true;

    this.http.post('/wm/PendingSave', this.record).subscribe(
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
    this.capi.getCodeDetailInfo('wm_suspicious_issuesclass', '', 'string').subscribe((res: any) => {
      this.sub_wm_suspicious_issuesclass.data = res;
    });
  }

  getListItems(value: any, type: any): void {
    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);

    if (value && this.record.Warehouse.toString() !== tmp_data.last_workshop) {
      if (this.record.Warehouse.length > 0) {
        this.loading = true;
        this.capi.getListItems(type, this.record.PlantID, this.record.Warehouse.toString()).subscribe(
          (res: any) => {
            tmp_data.data = res;
          },
          (err: any) => this.msg.error('获取数据失败!'),
        );
        this.loading = false;
        tmp_data.last_workshop = this.record.Warehouse.toString();
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

  GetSupplierOfPartNo(value: any): void {
    const part_no = value;
    this.http
      .get(`/supplier/GetSupplierOfPartNo?part_no=${part_no}`)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.sub_supplier.data = res.data;
            if (this.sub_supplier.data.length > 0) {
              this.record.SupplierID = this.sub_supplier.data[0].itemValue;
              this.getCurrentParts(this.record.PartNumber, this.record.SupplierID);
            }
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );
  }

  partChange(value: any): void {
    this.GetSupplierOfPartNo(value);
    this.http
      .get(`/wm/getCurrentParts?plant=${this.record.PlantID}&workshop=${this.record.Warehouse}&part_no=${value}`)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            if (res.data !== null) {
              this.record.PartName = res.data.PartName;
              this.record.PackStdQty = res.data.PackStdQty;
            }
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );
  }
  supplierChange(value: any): void {
    this.getCurrentParts(this.record.PartNumber, value);
  }

  getCurrentParts(part: string, supplier: string) {
    this.http
      .get(
        `/part/getCurrentParts?plant=${this.record.PlantID}&workshop=${this.record.Warehouse}&part_no=${part}&supplier=${supplier}`,
      )
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            if (res.data !== null) {
              this.record.CurrentParts = res.data.CurrentParts;
              this.record.ULoc = res.data.Dloc;
            }
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );
  }

  PackQtyChange(value: any) {
    // tslint:disable-next-line: radix
    let c = parseInt(value);
    // tslint:disable-next-line: radix
    let f = parseInt(this.record.FragParts);
    if (isNaN(c)) {
      c = 1;
    } else if (isNaN(f)) {
      f = 0;
    }
    c = f > 0 ? c - 1 : c;
    this.record.PartQty = c * this.record.PackStdQty + f;
  }
  FragPartsChange(value: any) {
    // tslint:disable-next-line: radix
    let f = parseInt(value);
    // tslint:disable-next-line: radix
    let c = parseInt(this.record.PackQty);
    if (isNaN(c)) {
      c = 1;
    } else if (isNaN(f)) {
      f = 0;
    }
    c = f > 0 ? c - 1 : c;
    this.record.PartQty = c * this.record.PackStdQty + f;
  }
}
