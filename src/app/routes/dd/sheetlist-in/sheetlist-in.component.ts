import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange } from '@delon/abc';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { tap } from 'rxjs/operators';
import { CacheService } from '@delon/cache';
import { DdDetailComponent } from '../detail/detail.component';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';
import { format } from 'date-fns';

@Component({
  selector: 'app-dd-sheetlist-in',
  templateUrl: './sheetlist-in.component.html',
})
export class DdSheetlistInComponent implements OnInit, OnDestroy {
  actionPath = 'DDManagement/RDCRunsheetlist.aspx';
  today = this.cfun.getDateFormat(new Date(), 'YYYY/MM/DD');
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    plant: '',
    workshop: [],
    supplier_code: [],
    dock_code: [],
    route_code: [],
    publish_time: [new Date(this.today + ' 00:00:00'), new Date(this.today + ' 23:59:59')],
    RDC_type: 'RDC',
  };
  size = 'small';
  data: any[] = [];
  dataAction: any[] = [];
  dataPrints: any[] = [];
  pre_lists = [];
  sub_workshops = [];
  sub_supplier_code = new ItemData();
  sub_dock_code = new ItemData();
  sub_route_code = new ItemData();
  sub_dd_plansheet_type = new ItemData();
  sub_wm_SheetProcessStatus = new ItemData();
  sub_jis_runsheet_PrintStatus = new ItemData();
  sub_tk_task_HasTask = new ItemData();

  sub_part_type = new ItemData();

  loading = false;
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: 'runsheet_id', type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '查看',
          type: 'modal',
          modal: {
            size: 'xl',
            params: (record: STData) => {
              record.modal_name = 'sheet';
              return record;
            },
            component: DdDetailComponent,
          },
        },
      ],
    },
    { title: '单号', index: 'runsheet_code', sort: true },
    { title: '配送路线代码', index: 'route_code', sort: true },
    { title: '发布时间', index: 'publish_time', type: 'date', sort: true },
    { title: '预期到货时间', index: 'expected_arrival_time', type: 'date', sort: true },
    { title: '工厂', index: 'plant', sort: true },
    { title: '车间', index: 'workshop', sort: true },
    { title: '仓库', index: 'supplier_code', sort: true },
    { title: 'Dock编号', index: 'dock_code', sort: true },
    { title: '物料单类型', index: 'runsheet_type_name', sort: true },
    { title: '出入库单状态', index: 'sheet_process_status_name', sort: true },
    { title: '打印状态', index: 'print_status_name', sort: true },
    { title: '任务单编号', index: 'task_no', sort: true },

    // { title: '拉动类型', index: 'part_type_name', sort: true },
    // { title: '物料单状态', index: 'sheet_status_name', sort: true },
    // { title: '车间物料单编号', index: 'workshop_runsheet_code', sort: true },
    // { title: '车间流水号', index: 'workshop_sn', sort: true },
    // { title: '供应商流水号', index: 'supplier_sn', sort: true },
    // { title: '物料单页序号', index: 'page_order', sort: true },
    // { title: '卸货时间(分)', index: 'unloading_time', sort: true },
    // { title: '收料', index: 'receiver_name', sort: true },
    // { title: '重做标志', index: 'redo_flag_name', sort: true },
    // { title: '通讯状态', index: 'mq_status_name', sort: true },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig() as STPage;
  expandForm = true;

  timer; // 定时器

  constructor(
    private http: _HttpClient,
    private srv: CacheService,
    public msg: NzMessageService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
  ) { }

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

  getData() {
    this.loading = true;
    this.initWhere();

    this.http
      .post('/dd/GetRunsheetPager', this.q)
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
    this.clrearWhere();
  }
  initWhere() {
    const tmp_workshops = this.sub_workshops.map(p => p.value);

    if (this.q.workshop === '' || this.q.workshop === undefined || this.q.workshop.length === 0) {
      this.q.workshop = tmp_workshops;
    }

    this.q.publish_time = this.cfun.getSelectDate(this.q.publish_time);
    this.q.expected_arrival_time = this.cfun.getSelectDate(this.q.expected_arrival_time);
    this.q.actual_arrival_time = this.cfun.getSelectDate(this.q.actual_arrival_time);
  }
  clrearWhere() {
    const tmp_workshops = this.sub_workshops.map(p => p.value);
    if (tmp_workshops.toString() === this.q.workshop.toString()) this.q.workshop = [];
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
      case 'StopRefresh':
        this.autoRefresh();
        break;
      case 'Print':
        this.print();
        break;
    }
  }

  reset() {
    // wait form reset updated finished
    setTimeout(() => { });
    // setTimeout(() => this.getData());
  }

  search() {
    this.getData();
  }

  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshops = l.children;
    this.q.workshop = [];
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

  print() {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择要打印的记录');
      return false;
    } else {
      this.loading = true;
      this.http
        .post('/dd/RunsheetPrint', this.selectedRows)
        .pipe(tap(() => (this.loading = false)))
        .subscribe(
          res => {
            if (res.successful) {
              this.dataPrints = res.data.data;
              this.msg.success(res.data.msg);

              this.dataPrints.forEach(p => {
                window.open(p.print_file, '_blank');
              });
            } else {
              this.msg.error(res.message);
            }
          },
          (err: any) => this.msg.error('系统异常'),
        );
    }
    this.st.clearCheck();
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
    this.initWhere();
    this.http
      .post('/dd/GetRunsheetPager', this.q)
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
    this.clrearWhere();
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer); // 销毁定时器
    }
  }

  autoRefresh() {
    const d = document.getElementById('btnStopRefresh') as HTMLButtonElement;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      d.innerHTML = '点击启动自动刷新';
    } else {
      d.innerHTML = '已启动自动刷新';
      this.timer = setInterval(() => {
        this.getData();
        d.innerHTML = `上次刷新于(${format(new Date(), 'MM-DD HH:mm:ss')})`;
      }, 20 * 1000);
    }
  }
}
