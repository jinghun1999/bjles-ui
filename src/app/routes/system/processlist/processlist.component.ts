import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { SystemProcesslistEditComponent } from './edit/edit.component';

@Component({
  selector: 'app-system-processlist',
  templateUrl: './processlist.component.html',
})
export class SystemProcesslistComponent implements OnInit {
  actionPath = 'SystemManagement/ProcessScheduleList.aspx';
  searchPath = '/system/GetProcessPager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: ['system_id'], type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: `启用`,
          click: record => this.ProcessCommand([record], 'active'),
        },
        {
          text: `停用`,
          click: record => this.ProcessCommand([record], 'stop'),
        },
        {
          text: `手工调用`,
          click: record => this.ProcessCommand([record], 'manual'),
        },
        {
          text: '编辑',
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: SystemProcesslistEditComponent,
          },
        },
      ],
    },
    { title: '系统名称', index: 'system_name', sort: true },
    {
      title: '最后运行开始时间',
      index: 'last_run_begin_time',
      sort: true,
      type: 'date',
      dateFormat: `YYYY-MM-DD HH:mm`,
    },
    { title: '最后运行结束时间', index: 'last_run_end_time', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
    { title: '最后运行状态', index: 'last_run_status_name', sort: true },
    { title: '运行时间间隔', index: 'run_interval', sort: true },
    { title: '检查间隔时间', index: 'check_interval', sort: true },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig() as STPage;
  expandForm = true;
  loading: boolean;

  size = 'small';
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
  };
  data: any[] = [];
  dataAction: any[] = [];
  sub_system_status = new ItemData();

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
      case 'Refresh':
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
      case 'Active':
        this.ProcessCommand(this.selectedRows, 'active');
        break;
      case 'Stop':
        this.ProcessCommand(this.selectedRows, 'stop');
        break;
    }
  }
  ProcessCommand(records: STData[], CommandName: string) {
    if (records === null || records === undefined || records.length === 0) {
      this.msg.error('请选择记录！');
      return;
    } else {
      this.loading = true;
      this.http
        .post('/system/ProcessCommand', { res: records, name: CommandName })
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
    // if (this.selectedRows.length === 0) {
    //   this.msg.error('请选择需要删除的计划！');
    //   return;
    // } else {
    //   this.loading = true;
    //   this.http
    //     .post('/supplier/RespondDelete', this.selectedRows)
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

  Create() {
    this.modal.create(SystemProcesslistEditComponent, { record: { add: true } }, { size: 'xl' }).subscribe(res => {
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
