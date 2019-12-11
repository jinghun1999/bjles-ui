import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { format } from 'date-fns';
import { _HttpClient } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange } from '@delon/abc';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { tap } from 'rxjs/operators';
import { JisSheetlistDetailComponent } from './detail/detail.component';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';

@Component({
  selector: 'app-jis-sheetlist',
  templateUrl: './sheetlist.component.html',
})
export class JisSheetlistComponent implements OnInit, OnDestroy {
  constructor(
    private http: _HttpClient,
    public msg: NzMessageService,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
  ) {}

  today = this.cfun.getDateFormat(new Date(), 'YYYY/MM/DD');
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    plant: '',
    workshop: [],
    supplier: [],
    dock: [],
    rack: [],
    publish_time: [new Date(this.today + ' 00:00:00'), new Date(this.today + ' 23:59:59')],
    actual_time: [],
    inner_only: false,
  };
  size = 'small';
  data: any[] = [];
  actions: any[] = [];
  dataPrints: any[] = [];
  pre_lists = [];

  sub_workshop = [];
  sub_supplier = new ItemData();
  sub_dock = new ItemData();
  sub_rack = new ItemData();
  sub_dd_plansheet_type = new ItemData();
  sub_dd_plansheet_status = new ItemData();
  sub_wm_SheetProcessStatus = new ItemData();
  sub_jis_runsheet_PrintStatus = new ItemData();

  loading = false;

  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox', exported: false },
    {
      title: '',
      buttons: [
        {
          text: '查看',
          type: 'modal',
          modal: {
            size: 'xl',
            component: JisSheetlistDetailComponent,
          },
        },
      ],
    },
    { title: '单号', index: 'runsheet_code', sort: true },
    { title: '工厂', index: 'plant', sort: true },
    { title: '车间', index: 'workshop', sort: true },
    { title: '料架', index: 'rack', sort: true },
    { title: '排序类型', index: 'rack_name', sort: true },
    { title: '日计单数', index: 'sheet_sequence', sort: true },
    { title: '供应商代码', index: 'supplier', sort: true },
    { title: '供应商名称', index: 'supplier_name', sort: true },
    { title: '发布时间', index: 'publish_time', type: 'date', sort: true },
    { title: '供应商JIS流水号', index: 'supplier_sn', sort: true },
    { title: '工位地址', index: 'uloc', sort: true },
    { title: '卸货区', index: 'dock', sort: true },

    { title: '预期到货时间', index: 'expected_time', type: 'date', sort: true },
    { title: '实际到货时间', index: 'actual_time', type: 'date', sort: true },
    { title: '开始车号', index: 'start_csn', sort: true },
    { title: '结束车号', index: 'end_csn', sort: true },

    { title: '收料人', index: 'receiver', sort: true },
    { title: '重做标志', index: 'redo_flag', sort: true },
    { title: '单据状态', index: 'sheet_status_text', sort: true },
    { title: '打印状态', index: 'print_status_name', sort: true },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig() as STPage;

  expandForm = true;
  timer; // 定时器

  ngOnInit() {
    this.loading = true;
    this.capi.getPlant().subscribe(
      (res: any) => {
        this.pre_lists = res;
        if (this.pre_lists.length > 0) {
          this.sub_workshop = this.pre_lists[0].children;
          this.q.plant = this.pre_lists[0].value;
          this.plantChange(this.q.plant);
        }
      },
      (err: any) => this.msg.error('获取查询条件出错'),
    );

    this.capi.getActions('JISManagement/RunSheetList.aspx').subscribe((res: any) => {
      this.actions = res;
    });

    this.loading = false;
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

  getData() {
    this.loading = true;
    const tmp_workshops = this.sub_workshop.map(p => p.value);

    if (this.q.workshop === '' || this.q.workshop === undefined || this.q.workshop.length === 0) {
      this.q.workshop = tmp_workshops;
    }

    this.q.publish_time = this.cfun.getSelectDate(this.q.publish_time);
    this.q.receive_time = this.cfun.getSelectDate(this.q.receive_time);
    this.q.actual_arrival_time = this.cfun.getSelectDate(this.q.actual_arrival_time);

    this.http
      .post('/jis/postRunsheetPager', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(res => {
        if (res.successful) {
          this.data = res.data.rows;
          this.st.total = res.data.total;
        } else {
          this.msg.error(res.message);
        }
      });
  }

  stChange(e: STChange) {
    switch (e.type) {
      case 'checkbox':
        this.selectedRows = e.checkbox!;
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
    setTimeout(() => {});
    // setTimeout(() => this.getData());
  }

  search() {
    this.getData();
  }

  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshop = l.children;
    this.q.workshop = [];
  }

  getListItems(value: any, type: string): void {
    // tslint:disable-next-line: no-eval
    const t = eval('this.sub_' + type);
    let supplier = null;
    const wk = this.q.workshop.toString();
    if (type === 'rack') {
      supplier = this.q.supplier.toString();
    }
    if (!value || (wk === t.last_workshop && type !== 'rack')) {
      return;
    }
    if (this.q.workshop.length > 0) {
      this.loading = true;
      this.capi.getListItems(type, this.q.plant, wk, supplier).subscribe((res: any) => {
        t.data = res;
      });
      this.loading = false;
      t.last_workshop = wk;
    } else {
      t.data = [];
      t.last_workshop = '';
    }
    // tslint:disable-next-line: no-eval
    eval('this.q.' + type + ' =  [];');
  }

  getCodeDetails(value: any, type: any) {
    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);
    if (value) {
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
        .post('/jis/postPrint', this.selectedRows)
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
    this.loading = true;
    this.q.page.export = true;
    this.http
      .post('/jis/postRunsheetPager', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(res => {
        this.q.page.export = false;
        if (res.successful) {
          this.st.export(res.data.rows, {
            callback: this.cfun.callbackOfExport,
            filename: 'jis.xlsx',
            sheetname: 'sheet1',
          });
        } else {
          this.msg.error(res.message);
        }
      });
  }
}
