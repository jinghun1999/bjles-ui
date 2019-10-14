import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange } from '@delon/abc';
import { CommonFunctionService, CommonApiService } from '@core';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { Form } from '@angular/forms';

@Component({
  selector: 'app-wm-pendinglist-unblock',
  templateUrl: './unblock.component.html',
})
export class WmPendinglistUnblockComponent implements OnInit {
  record: any = {};

  actionPath = 'Warehouse/SuspiciousUnblock.aspx';
  searchPath = '/wm/GetPendingPager';
  @ViewChild('st', { static: false }) st: STComponent;
  @ViewChild('f', { static: false }) f: Form;

  columns: STColumn[] = [
    { title: '', index: ['Id'], type: 'checkbox', exported: false },
    { title: '封存条', index: 'SealingStripCode', sort: true },
    { title: '工厂', index: 'PlantID', sort: true },
    { title: '车间', index: 'Warehouse', sort: true },

    { title: '零件号', index: 'PartNumber', sort: true },
    { title: '零件名称', index: 'PartName', sort: true },
    { title: '供应商', index: 'SupplierID', sort: true },
    { title: '供应商名称', index: 'SupplierName', sort: true },
    { title: '封存箱数', index: 'PackQty', sort: true },
    { title: '标准包装数', index: 'PackStdQty', sort: true },
    { title: '封存散件数', index: 'PartQty', sort: true },
    { title: '剩余封存数', index: 'PartQty', sort: true },
    { title: '解封情况', index: 'UnlockStatus_name', sort: true },

    { title: '解封箱数', render: 'rd_PackQty' },
    { title: '解封散件数', render: 'rd_FragQty' },
    { title: '解封总件数', render: 'rd_PartQty' },
    { title: '解封原因', render: 'rd_Why' },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig();
  expandForm = true;
  loading: boolean;

  size = 'small';
  data: any[] = [];
  dataAction: any[] = [];
  sub_isdefault = new ItemData();

  constructor(
    private http: _HttpClient,
    private modal1: NzModalRef,
    public msg: NzMessageService,
    private cdr: ChangeDetectorRef,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
  ) {}

  ngOnInit() {
    this.loading = true;

    // toolBar
    this.capi.getActions(this.actionPath).subscribe((res: any) => {
      // if (this.record.add === true) res = res.filter(p => p.action_name === 'Save');
      this.dataAction = res;
    });

    this.loading = false;
    this.record.page = new PageInfo();
    this.record.sort = new SortInfo();

    this.search();
  }

  stChange(e: STChange) {
    switch (e.type) {
      case 'checkbox':
        this.selectedRows = e.checkbox!;
        this.cdr.detectChanges();
        break;
      case 'filter':
        this.getData();
        break;
      case 'pi':
        this.record.page.pi = e.pi;
        this.getData();
        break;
      case 'ps':
        this.record.page.ps = e.ps;
        this.getData();
        break;
      case 'sort':
        this.record.sort.field = e.sort.column.indexKey;
        this.record.sort.order = e.sort.value;
        this.getData();
        break;
    }
  }

  toolBarOnClick(e: any) {
    switch (e.action_name) {
      case 'Search':
        this.search();
        this.expandForm = false;
        break;
      case 'HideOrExpand':
        this.hideOrExpand();
        break;
      case 'Create':
        this.Create();
        break;
      case 'Delete':
        this.Delete();
        break;
      case 'Save':
        this.save();
        break;
    }
  }

  save() {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要保存的记录！');
      return;
    }

    this.loading = true;
    this.http.post('/wm/PendingUnblock', this.selectedRows).subscribe(
      (res: any) => {
        if (res.successful) {
          this.msg.success(res.data);
          this.loading = false;
          this.modal1.close(true);
        } else {
          this.msg.error(res.message);
          this.loading = false;
        }
      },
      (err: any) => this.msg.error('保存失败!'),
    );
  }

  Delete(): void {
    // if (this.selectedRows.length === 0) {
    //   this.msg.error('请选择需要删除的记录！');
    //   return;
    // } else {
    //   this.loading = true;
    //   this.http
    //     .post('/System/CodeDetailDelete', this.selectedRows)
    //     .pipe(tap(() => (this.loading = false)))
    //     .subscribe(
    //       res => {
    //         if (res.successful) {
    //           this.msg.success(res.data);
    //           this.st.reload();
    //         } else {
    //           this.msg.error(res.message);
    //         }
    //       },
    //       (err: any) => this.msg.error('系统异常'),
    //     );
    // }
  }

  hideOrExpand() {
    this.expandForm = !this.expandForm;
  }

  Create() {}

  search() {
    this.getData();
  }

  getData() {
    this.loading = true;
    this.http
      .post(this.searchPath, this.record)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.data = res.data.rows;
            this.data.forEach(p => {
              p.unlock_frag_count = 0;
            });
            this.st.total = res.data.total;
            this.cdr.detectChanges();
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );
  }
  PackQtyChange(value: any, item: any) {
    // tslint:disable-next-line: radix
    let c = parseInt(value);
    // tslint:disable-next-line: radix
    let f = parseInt(item.unlock_frag_count);
    if (isNaN(c)) {
      c = 1;
    } else if (isNaN(f)) {
      f = 0;
    }
    c = f > 0 ? c - 1 : c;
    item.unlock_part_count = c * item.PackStdQty + f;
  }
  FragPartsChange(value: any, item: any) {
    // tslint:disable-next-line: radix
    let f = parseInt(value);
    // tslint:disable-next-line: radix
    let c = parseInt(item.unlock_pack_count);
    if (isNaN(c)) {
      c = 1;
    } else if (isNaN(f)) {
      f = 0;
    }
    c = f > 0 ? c - 1 : c;
    item.unlock_part_count = c * item.PackStdQty + f;
  }
}
