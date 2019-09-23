import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { SupplierWorkdaylistEditComponent } from './edit/edit.component';

@Component({
  selector: 'app-supplier-workdaylist',
  templateUrl: './workdaylist.component.html',
})
export class SupplierWorkdaylistComponent implements OnInit {
  actionPath = 'SupplierManagement/WorkDayWindowsList.aspx';
  searchPath = '/supplier/GetWorkDayPager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: ['wt_workday_detail_id'], type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '编辑',
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: SupplierWorkdaylistEditComponent,
          },
        },
      ],
    },
    { title: '工厂', index: 'plant', sort: true },
    { title: '车间', index: 'workshop', sort: true },
    { title: '供应商代码', index: 'supplier', sort: true },
    { title: '供应商名称', index: 'supplier_name', sort: true },
    { title: '配送路线代码', index: 'route', sort: true },
    { title: '拉动类型', index: 'part_type_name', sort: true },
    { title: '工作日', index: 'workday', sort: true, type: 'date', dateFormat: `YYYY-MM-DD` },
    { title: '窗口时间', index: 'window_time', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
    { title: '响应时间', index: 'online_time', sort: true },
    { title: '发送时间', index: 'send_time', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
    { title: '最后发送时间', index: 'last_send_time', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig();
  expandForm = true;
  loading: boolean;

  size = 'small';
  today = new Date().toLocaleDateString();
  currentStartDate = new Date(this.today + ' 00:00:00');
  currentEndDate = new Date(this.today + ' 23:59:59');
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    plant: '',
    workshop: [],
    supplier: [],
    route: [],
    workday: [this.currentStartDate, this.currentEndDate],
  };
  data: any[] = [];
  dataAction: any[] = [];
  pre_lists = [];
  sub_workshops = [];
  sub_supplier = new ItemData();
  sub_route = new ItemData();
  sub_part_type = new ItemData();

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    public msg: NzMessageService,
    private cdr: ChangeDetectorRef,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
    private xlsx: XlsxService,
  ) {}

  ngOnInit() {
    this.loading = true;

    this.capi.getPlant().subscribe(
      (res: any) => {
        this.pre_lists = res;
        if (this.pre_lists.length > 0) {
          this.sub_workshops = this.pre_lists[0].children;
          this.q.plant = this.pre_lists[0].value;
          this.plantChange(this.q.plant);
        }
      },
      (err: any) => this.msg.error('获取不到工厂车间信息！！'),
    );

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
    const tmp_data = eval('this.sub_' + type);

    if (value && this.q.workshop.toString() !== tmp_data.last_workshop) {
      if (this.q.workshop.length > 0) {
        this.loading = true;
        this.capi.getListItems(type, this.q.plant, this.q.workshop.toString()).subscribe(
          (res: any) => {
            tmp_data.data = res;
          },
          (err: any) => this.msg.error('获取数据失败!'),
        );
        this.loading = false;
        tmp_data.last_workshop = this.q.workshop.toString();
      } else {
        tmp_data.data = [];
        tmp_data.last_workshop = '';
      }
      // tslint:disable-next-line: no-eval
      eval('this.q.' + type + ' =  [];');
    }
  }

  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshops = l.children;
    this.q.workshop = '';
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
        this.q.sort.field = e.sort.column.indexKey;
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
        this.Create();
        break;
      case 'Delete':
        this.Delete();
        break;
      case 'Calculate':
        this.Calculate();
        break;
    }
  }
  Calculate(): void {
    if (this.q.supplier === '' || this.q.supplier.filter(p => p !== '').length !== 1) {
      this.msg.error('请选择一个供应商！');
      return;
    }
    if (this.q.route === '' || this.q.route.filter(p => p !== '').length !== 1) {
      this.msg.error('请选择一个线路配置代码！');
      return;
    }
    if (this.q.workshop === '' || this.q.workshop.filter(p => p !== '').length !== 1) {
      this.msg.error('请选择一个车间进行窗口时间计算！');
      return;
    } else {
      this.loading = true;

      this.http
        .post('/supplier/WorkDayCalculate', this.q)
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
  Delete(): void {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要删除的计划！');
      return;
    } else {
      this.loading = true;

      this.http
        .post('/supplier/WorkDayDelete', this.selectedRows)
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
    this.modal.create(SupplierWorkdaylistEditComponent, { record: { add: true } }, { size: 'xl' }).subscribe(res => {
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
    const tmp_workshops = this.sub_workshops.map(p => p.value);

    if (this.q.workshop === '' || this.q.workshop === undefined || this.q.workshop.length === 0) {
      this.q.workshop = tmp_workshops;
    }
    if (this.q.workday !== undefined && this.q.workday.length === 2)
      this.q.workday = this.cfun.getSelectDate(this.q.workday);

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
    if (tmp_workshops === this.q.workshop) this.q.workshop = [];
  }
}
