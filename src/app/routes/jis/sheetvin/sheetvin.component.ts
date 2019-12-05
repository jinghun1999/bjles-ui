import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { format } from 'date-fns';
import { _HttpClient } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange } from '@delon/abc';
import { NzMessageService } from 'ng-zorro-antd';
import { tap } from 'rxjs/operators';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';

@Component({
  selector: 'app-jis-sheetvin',
  templateUrl: './sheetvin.component.html',
})
export class JisSheetvinComponent implements OnInit {
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
    part_no: '',
    csn_start: '',
    csn_end: '',
  };
  size = 'small';
  data: any[] = [];
  actions: any[] = [];
  pre_lists = [];
  sub_workshop = [];

  loading = false;

  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: 'csn', type: 'checkbox', exported: false },
    { title: '车号', index: 'csn', sort: true },
    { title: '工厂', index: 'plant', sort: true },
    { title: '车间', index: 'workshop', sort: true },
    { title: '料架', index: 'rack', sort: true },
    { title: '供应商', index: 'supplier', sort: true },

    { title: '料架', index: 'rack', sort: true },
    { title: '物料单编号', index: 'runsheet_code', sort: true },
    { title: '零件号', index: 'part_no', sort: true },
    { title: '零件名称', index: 'part_name', sort: true },

    { title: '卸货位置', index: 'dock', sort: true },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig();

  expandForm = true;

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

    this.capi.getActions('JISManagement/CarFindPart.aspx').subscribe((res: any) => {
      this.actions = res;
    });

    this.loading = false;
  }

  getData() {
    this.loading = true;
    const tmp_workshops = this.sub_workshop.map(p => p.value);

    if (this.q.workshop === '' || this.q.workshop === undefined || this.q.workshop.length === 0) {
      this.q.workshop = tmp_workshops;
    }
    this.http
      .post('/jis/postCarPartPager', this.q)
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
        this.getData();
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

  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshop = l.children;
    this.q.workshop = '';
  }

  getListItems(value: any, type: string): void {
    // tslint:disable-next-line: no-eval
    const t = eval('this.sub_' + type);
    const wk = this.q.workshop.toString();
    if (this.q.workshop.length > 0) {
      this.loading = true;
      this.capi.getListItems(type, this.q.plant, wk, null).subscribe((res: any) => {
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
      .post('/jis/postCarPartPager', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(res => {
        this.q.page.export = false;
        if (res.successful) {
          this.st.export(res.data.rows, {
            callback: this.cfun.callbackOfExport,
            filename: 'jis-part.xlsx',
            sheetname: 'sheet1',
          });
        } else {
          this.msg.error(res.message);
        }
      });
  }
}
