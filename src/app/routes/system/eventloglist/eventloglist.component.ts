import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-system-eventloglist',
  templateUrl: './eventloglist.component.html',
})
export class SystemEventloglistComponent implements OnInit {
  actionPath = 'SystemManagement/EventLogList.aspx';
  searchPath = '/system/GetEventLogPager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: ['event_log_sn'], type: 'checkbox', exported: false },
    { title: '事件时间', index: 'event_time', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
    { title: '事件名称', index: 'event_name', sort: true },
    { title: '事件状态', index: 'event_state_name', sort: true },
    { title: '事件类型', index: 'event_type_name', sort: true },
    { title: '事件级别', index: 'event_level_name', sort: true },
    { title: '事件来源', index: 'event_source', sort: true },
    { title: '事件简述', index: 'event_brief', sort: true },
    { title: '事件详述', index: 'event_detail', sort: true },
    { title: '事件处理描述', index: 'event_disposal', sort: true },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig();
  expandForm = true;
  loading: boolean;

  size = 'small';
  today = this.cfun.getDateFormat(new Date(), 'YYYY/MM/DD');
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    event_time: [new Date(this.today + ' 00:00:00'), new Date(this.today + ' 23:59:59')],
  };
  data: any[] = [];
  dataAction: any[] = [];
  sub_event_type = new ItemData();
  sub_event_state = new ItemData();
  sub_event_level = new ItemData();

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

    this.loading = true;
    this.capi.getListItems(type, this.q.plant, '').subscribe(
      (res: any) => {
        tmp_data.data = res;
      },
      (err: any) => this.msg.error('获取数据失败!'),
    );
    this.loading = false;

    this.q.supplier = [];
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
      case 'Delete':
        // 批量更新
        this.Delete();
        break;
    }
  }
  Delete(): void {
    // if (this.selectedRows.length === 0) {
    //   this.msg.error('请选择需要删除的计划！');
    //   return;
    // } else {
    //   this.loading = true;
    //   this.http
    //     .post('/system/AppConfigDelete', this.selectedRows)
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
