import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';
import { CacheService } from '@delon/cache';
import { iif } from 'rxjs';

@Component({
  selector: 'app-supplier-supplydatelist-edit',
  templateUrl: './edit.component.html',
})
export class SupplierSupplydatelistEditComponent implements OnInit {
  record: any;

  size = 'small';
  sub_supplier_code = new ItemData();

  pc_all = true;

  loading = false;
  title = '';

  checkOptions = [
    { label: '星期一', value: '1', checked: false },
    { label: '星期二', value: '2', checked: false },
    { label: '星期三', value: '3', checked: false },
    { label: '星期四', value: '4', checked: false },
    { label: '星期五', value: '5', checked: false },
    { label: '星期六', value: '6', checked: false },
    { label: '星期七', value: '7', checked: false },
  ];

  constructor(
    private modal: NzModalRef,
    private msg: NzMessageService,
    public http: _HttpClient,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
    public cache: CacheService,
  ) {}

  ngOnInit(): void {
    // tslint:disable-next-line: prefer-conditional-expression
    if (this.record.add === true) {
      this.title = '添加';
    } else {
      this.title = '编辑';
      this.checkOptions.forEach(p => {
        const supplyDate = this.record.SupplyDate.split(',');
        // tslint:disable-next-line: radix
        supplyDate.forEach(pp => {
          if (p.value === pp) {
            p.checked = true;
          }
        });
      });
      this.record.suppliers = this.record.supplier;
    }

    this.getListItems(true, 'supplier_code');
    this.initCodeDetail();
  }

  save() {
    this.loading = true;
    this.record.SupplyDate = this.checkOptions
      .filter(p => p.checked)
      .map(p => p.value)
      .toString();
    this.http.post('/supplier/SupplyDateSave', this.record).subscribe(
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
    const tmp_data = eval(`this.sub_${type}`);
    if (value && tmp_data.data.length === 0) {
      this.loading = true;
      const cache_data = this.cache.getNone(type);
      if (cache_data === undefined || cache_data === null || cache_data === '' || cache_data === []) {
        this.capi.getListItems(type, '', '').subscribe(
          (res: any) => {
            tmp_data.data = res;
            this.cache.set(type, res.data, { type: 's', expire: 10 });
            this.loading = false;
          },
          (err: any) => this.msg.error('获取数据失败!'),
        );
      } else {
        tmp_data.data = cache_data;
        this.loading = false;
      }
    }
  }
}
