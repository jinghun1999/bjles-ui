import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { SupplierSupplydatelistEditComponent } from './edit/edit.component';
import { CacheService } from '@delon/cache';

@Component({
  selector: 'app-supplier-supplydatelist',
  templateUrl: './supplydatelist.component.html',
})
export class SupplierSupplydatelistComponent implements OnInit {
  actionPath = 'SupplierManagement/SupplierSupplyDateList.aspx';
  searchPath = '/supplier/GetSupplyDatePager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: ['Id'], type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '编辑',
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: SupplierSupplydatelistEditComponent,
          },
        },
      ],
    },
    { title: '供应商代码', index: 'supplier', sort: true },
    { title: '供应商名称', index: 'supplier_name', sort: true },
    { title: '配置类型', index: 'DateType', sort: true },
    {
      title: '供货日历',
      // format: (item: STData, col: STColumn, index: number) => {
      //   // return '星期' + item.SupplyDate.replace(',', ',星期');
      //   return item.SupplyDate.split(',').map(p => this.week[p - 1]);
      // },
      index: 'SupplyDate',
      sort: true,
    },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig();
  expandForm = true;
  loading: boolean;

  // week = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  size = 'small';
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    supplier: [],
  };
  data: any[] = [];
  dataAction: any[] = [];
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
        this.q.sort.order = e.sort.value;
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
      case 'Export':
        this.export();
        break;
      case 'HideOrExpand':
        this.hideOrExpand();
        break;
      case 'Create':
      case 'Create1':
        this.Create();
        break;
      case 'Delete':
        this.Delete();
        break;
      case 'Import':
        this.import();
        break;
    }
  }
  import(): void {
    const file1 = document.getElementById('import') as HTMLInputElement;
    if (file1.files.length === 0) {
      this.msg.error('请选择需要导入的数据文件！');
      return;
    }
    const file = file1.files[0];
    this.loading = true;
    this.xlsx.import(file).then(res1 => {
      // EXCEL文件之中文字段改为英文字段
      // for (let j = 0, len = res1.sheet1[0].length; j < len; j++) {
      //   res1.sheet1[0][j] = this.columns.find(p => p.title === res1.sheet1[0][j]).index;
      // }
      this.http
        .post('/supplier/SupplyDateImport', res1)
        .pipe(tap(() => (this.loading = false)))
        .subscribe(
          res => {
            if (res.successful) {
              if (!res.data.result) {
                this.cfun.downErrorExcel(res.data.column, res.data.errDT, 'supplyDate_error.xlsx');
              }
              this.msg.success(res.data.msg);
              this.st.reload();
            } else {
              this.msg.error(res.message);
              this.loading = false;
            }
          },
          (err: any) => this.msg.error('系统异常'),
        );
    });
  }

  Delete(): void {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要删除的计划！');
      return;
    } else {
      this.loading = true;

      this.http
        .post('/supplier/SupplyDateDelete', this.selectedRows)
        .pipe(tap(() => (this.loading = false)))
        .subscribe(
          res => {
            if (res.successful) {
              this.msg.success(res.data);
              this.st.reload();
            } else {
              this.msg.error(res.message);
            }
          },
          (err: any) => this.msg.error('系统异常'),
        );
    }
  }

  hideOrExpand() {
    this.expandForm = !this.expandForm;
  }

  Create() {
    this.modal.create(SupplierSupplydatelistEditComponent, { record: { add: true } }, { size: 'xl' }).subscribe(res => {
      if (res) this.st.reload();
    });
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
}
