import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange } from '@delon/abc';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { tap } from 'rxjs/operators';
import { CacheService } from '@delon/cache';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';
import { format } from 'date-fns';

@Component({
  selector: 'app-dd-kanbanscanquery',
  templateUrl: './kanbanscanquery.component.html',
})
export class DdKanbanscanqueryComponent implements OnInit {
  actionPath = 'DDManagement/ScanCardQuery.aspx';
  searchPath = '/dd/GetkbScanQueryPager';

  today = this.cfun.getDateFormat(new Date(), 'YYYY/MM/DD');
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    plant: '',
    workshop: [],
    supplier_code: [],
    route_code: [],
    process_time: [new Date(this.today + ' 00:00:00'), new Date(this.today + ' 23:59:59')],
  };
  size = 'small';
  data: any[] = [];
  dataAction: any[] = [];
  pre_lists = [];
  sub_workshops = [];
  sub_supplier_inner = new ItemData();
  sub_route_code = new ItemData();


  loading = false;
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '工厂', index: 'plant_code', sort: true },
    { title: '车间', index: 'workshop_code', sort: true },
    { title: '零件号', index: 'part_code', sort: true },
    { title: '零件名称', index: 'part_name', sort: true, render: "rd_part_name" },
    { title: '零件卡号', index: 'card_code', sort: true },
    { title: '看板卡号', index: 'Scan_CardCode', sort: true },
    { title: '需求箱数', index: 'pack_count', sort: true },
    { title: '配送路线代码', index: 'route_code', sort: true },
    { title: '工位编号', index: 'uloc', sort: true },
    { title: '供应商代码', index: 'supplier_code', sort: true },
    { title: '供应商名称', index: 'supplier_name', sort: true, render: "rd_supplier_name" },
    { title: '发布时间', index: 'process_time', type: 'date', sort: true },

    { title: '操作人', index: 'book_keeper', sort: true },
    { title: '物料单编号', index: 'runsheet_no', sort: true },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig() as STPage;
  expandForm = true;


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

    this.capi.getPlantOfDiff('', '', '0').subscribe(
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
    this.clrearWhere();
  }
  initWhere() {
    const tmp_workshops = this.sub_workshops.map(p => p.value);

    if (this.q.workshop === '' || this.q.workshop === undefined || this.q.workshop.length === 0) {
      this.q.workshop = tmp_workshops;
    }
    this.q.process_time = this.cfun.getSelectDate(this.q.process_time);
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
    }
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
    this.clrearWhere();
  }


}
