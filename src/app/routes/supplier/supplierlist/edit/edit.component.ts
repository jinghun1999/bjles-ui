import { Component, OnInit } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData } from 'src/app/model';
import { CommonApiService } from '@core';

@Component({
  selector: 'app-supplier-supplierlist-edit',
  templateUrl: './edit.component.html',
})
export class SupplierSupplierlistEditComponent implements OnInit {
  record: any = {};

  size = 'small';
  sub_supplier_type = new ItemData();

  loading = false;

  constructor(
    private modal: NzModalRef,
    private msg: NzMessageService,
    public http: _HttpClient,
    private capi: CommonApiService,
  ) {}

  ngOnInit(): void {
    this.initCodeDetail();
  }

  save() {
    this.loading = true;
    this.http.post('/Supplier/SupplierSaveData', this.record).subscribe(
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
    this.capi.getCodeDetailInfo('supplier_type', '', 'int').subscribe((res: any) => {
      this.sub_supplier_type.data = res;
    });
  }
}
