import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { SupplierSupplierlistEditComponent } from './edit/edit.component';
import { CacheService } from '@delon/cache';

@Component({
  selector: 'app-supplier-supplierlist',
  templateUrl: './supplierlist.component.html',
})
export class SupplierSupplierlistComponent implements OnInit {
  actionPath = 'SupplierManagement/SupplierList.aspx';
  searchPath = '/supplier/GetSupplierPager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: ['supplier_id'], type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '编辑',
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: SupplierSupplierlistEditComponent,
          },
        },
      ],
    },
    { title: '供应商代码', index: 'supplier_id', sort: true },
    { title: '供应商名称', index: 'supplier_name', sort: true },
    { title: '供应商地址', index: 'supplier_address', sort: true },
    { title: '供应商类型', index: 'supplier_type_name', sort: true },
    { title: '创建人', index: 'create_name', sort: true },
    { title: '创建时间', index: 'create_time', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
    { title: '联系人', index: 'contact_name', sort: true },
    { title: '联系电话', index: 'contact_tel', sort: true },

    { title: '联系手机', index: 'contact_mobile', sort: true },
    { title: '联系传真	', index: 'contact_fax', sort: true },
    { title: '联系邮箱', index: 'contact_email', sort: true },
    { title: '晚间联系人', index: 'nightcontact_name ', sort: true },
    { title: '晚间联系电话', index: 'nightcontact_tel', sort: true },
    { title: '晚间联系手机', index: 'nightcontact_mobile', sort: true },
    { title: '晚间联系传真', index: 'nightcontact_fax', sort: true },
    { title: '晚间联系邮箱', index: 'nightcontact_email', sort: true },
    { title: 'TMS供应商', type: 'yn', index: 'istms', sort: true },
    { title: '内部供应商', type: 'yn', index: 'isInternal', sort: true },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig();
  expandForm = true;
  loading: boolean;

  size = 'small';
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    supplier_id: [],
  };
  data: any[] = [];
  data_import: any;
  dataAction: any[] = [];
  sub_supplier_type = new ItemData();
  sub_supplier_code = new ItemData();

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    public msg: NzMessageService,
    private cdr: ChangeDetectorRef,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
    private xlsx: XlsxService,
    public cache: CacheService,
  ) {}

  ngOnInit() {
    this.loading = true;

    // toolBar
    this.capi.getActions(this.actionPath).subscribe((res: any) => {
      this.dataAction = res;
    });

    this.loading = false;
  }

  getCodeDetails(value: any, type: any) {
    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);
    if (value) {
      // tslint:disable-next-line: no-eval
      if (tmp_data.data.length === 0)
        this.capi.getCodeDetailInfo(type, '').subscribe((res: any) => {
          tmp_data.data = res;
        });
    }
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
        this.q.page.pi = e.pi;
        this.getData();
        break;
      case 'ps':
        this.q.page.ps = e.ps;
        this.getData();
        break;
      case 'sort':
                 this.q.sort.field = e.sort.column._sort.key;
        this.q.sort.order = e.sort.value;        this.getData();
        break;
    }
  }

  toolBarOnClick(e: any) {
    // tslint:disable-next-line:no-debugger
    // debugger;
    switch (e.action_name) {
      case 'Search':
        this.search();
        this.expandForm = false;
        break;
      case 'Export':
        this.export();
        break;
      case 'HideOrExpand':
        this.hideOrExpand();
        break;
      case 'Delete':
        this.Delete();
        break;
      case 'Create':
        this.Create();
        break;
    }
  }

  hideOrExpand() {
    this.expandForm = !this.expandForm;
  }

  Create() {
    // this.modal.create(PartPartcardlistEditComponent, { record: [] }, { size: 'xl' }).subscribe(res => {});
  }

  Delete() {
    // if (this.selectedRows.length === 0) {
    //   this.msg.error('请选择需要删除的零件！');
    //   return false;
    // } else {
    //   this.loading = true;
    //   this.http
    //     .post('/part/PartCardDelete', this.selectedRows)
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
    // this.st.clearCheck();
  }

  export() {
    if (this.st.total === 0) {
      this.msg.error('请输入条件，查询出数据方可导出数据！');
      return false;
    }

    this.q.page.export = true;
    this.http
      .post(this.searchPath, this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.st.export(res.data.rows, {
              callback: this.cfun.callbackOfExport,
              filename: 'result.xlsx',
              sheetname: 'sheet1',
            });
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );

    this.q.page.export = false;
  }

  search() {
    this.getData();
  }

  getData() {
    this.loading = true;

    this.http
      .post(this.searchPath, this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.data = res.data.rows;
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
