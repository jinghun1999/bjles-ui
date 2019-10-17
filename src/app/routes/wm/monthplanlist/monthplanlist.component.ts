import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService, ExpHttpService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { WmMonthplanlistEditComponent } from './edit/edit.component';
import { WmMonthplanlistViewComponent } from './view/view.component';
import { CacheService } from '@delon/cache';

@Component({
  selector: 'app-wm-monthplanlist',
  templateUrl: './monthplanlist.component.html',
})
export class WmMonthplanlistComponent implements OnInit {
  actionPath = 'WMManagement/MonthPlanList.aspx';
  searchPath = '/wm/GetMonthplanPager';
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
            component: WmMonthplanlistEditComponent,
          },
        },
        {
          text: '查看',
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: WmMonthplanlistViewComponent,
          },
        },
      ],
    },
    { title: '计划员编号', index: 'PlannerCode', sort: true },
    { title: '计划协议号', index: 'PlanAgreementNo', sort: true },
    { title: '零件号', index: 'PartNo', sort: true },
    { title: '零件名称', index: 'part_name', sort: { key: 'PartNo' } },
    { title: '供应商', index: 'SupplierID', sort: true },
    { title: '供应商名称', index: 'supplier_name', sort: true },
    { title: '交货月份', index: 'YearMonth', sort: true, type: 'date', dateFormat: `YYYY-MM` },
    { title: '当月实际收货数量', index: 'MonthActualQty', sort: true },
    { title: '当月最大收货数量', index: 'MonthMaxQty', sort: true },
    { title: '计划剩余数', index: 'MonthSurplusQty', sort: true },
    { title: '本次增补数量	', index: 'AugmentQty', sort: true },
    { title: '增补标识', index: 'Identifier', sort: true },
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
  sub_wm_month_plan_identifier = new ItemData();
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
    private httpService: ExpHttpService,
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
        this.q.sort.order = e.sort.value;
        this.getData();
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
      case 'Import':
        this.import();
        break;
      case 'Download':
        this.Download();
        break;
    }
  }

  hideOrExpand() {
    this.expandForm = !this.expandForm;
  }

  Create() {
    this.modal.create(WmMonthplanlistEditComponent, { record: { add: true } }, { size: 'xl' }).subscribe(res => {
      if (res) this.st.reload();
    });
  }

  Delete() {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要删除的零件！');
      return false;
    } else {
      this.loading = true;
      this.http
        .post('/wm/MonthplanDelete', this.selectedRows)
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
    this.st.clearCheck();
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
        .post('/wm/MonthplanImport', res1)
        .pipe(tap(() => (this.loading = false)))
        .subscribe(
          res => {
            if (res.successful) {
              if (!res.data.result) {
                // this.cfun.downErrorExcel(res.data.column, res.data.errDT, 'supplyDate_error.xlsx');
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
  Download() {
    this.httpService.downLoadFile('/assets/tpl/month_plan_import.xlsx', 'monthPlanTPL');
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

    this.q.YearMonth = this.cfun.getSelectDate(this.q.YearMonth);

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
  GetSupplierOfPartNo(value: any, type: any): void {
    // tslint:disable-next-line: no-eval
    const tmp_data = eval(`this.sub_${type}`);
    if (value) {
      // if (this.q.part_no === undefined || this.q.part_no === '') {
      //   this.msg.error('请输入零件号!');
      //   return;
      // }
      if (this.q.part_no === undefined) this.q.part_no = '';
      this.loading = true;
      this.http
        .get(`/supplier/GetSupplierOfPartNo?part_no=${this.q.part_no}`)
        .pipe(tap(() => (this.loading = false)))
        .subscribe(
          res => {
            if (res.successful) {
              tmp_data.data = res.data;
            } else {
              this.msg.error(res.message);
              this.loading = false;
            }
          },
          (err: any) => this.msg.error('系统异常'),
        );
    }
  }
}
