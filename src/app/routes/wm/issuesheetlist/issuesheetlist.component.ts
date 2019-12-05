import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { WmIssuesheetlistEditComponent } from './edit/edit.component';

@Component({
  selector: 'app-wm-issuesheetlist',
  templateUrl: './issuesheetlist.component.html',
})
export class WmIssuesheetlistComponent implements OnInit {
  actionPath = 'WMManagement/IssueSheetQueryList.aspx';
  searchPath = '/wm/GetIssueSheetPager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: ['IssueId'], type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '查看',
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: WmIssuesheetlistEditComponent,
          },
        },
      ],
    },
    { title: '物料单号', index: 'ResourceSheetNo', sort: true },
    { title: '工厂', index: 'PlantId', sort: true },
    { title: '供应商名称', index: 'supplier_name', sort: { key: 'SupplierId' } },
    { title: '目标仓库', index: 'WorkshopId', sort: true },
    { title: '单据类型	', index: 'business_type_name', sort: { key: 'BusinessType' } },
    { title: '移动类型编号', index: 'TransactionCode', sort: true },
    { title: '移动类型名称', index: 'TransactionName', sort: true },
    { title: '发布时间', index: 'PublishTime', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
    { title: '预期到货时间', index: 'ExpectedArrivalTime', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
    { title: 'Dock编号', index: 'DockId', sort: true },
    { title: '配送路线代码', index: 'RouteId', sort: true },
    { title: '创建时间', index: 'create_time', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
    { title: '备注', index: 'Remark', sort: true },
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
    plant: '',
    workshop: [],
    supplier: [],
    PublishTime: [new Date(this.today + ' 00:00:00'), new Date(this.today + ' 23:59:59')],
  };
  data: any[] = [];
  dataAction: any[] = [];
  pre_lists = [];
  sub_workshops = [];
  sub_wm_tran_sheet_type = new ItemData();

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
        this.Create();
        break;
    }
  }

  hideOrExpand() {
    this.expandForm = !this.expandForm;
  }

  Create() {
    // this.modal.create(WmIssuesheetlistEditComponent, { record: { add: true } }, { size: 'xl' }).subscribe(res => {
    //   if (res) this.st.reload();
    // });
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

  search() {
    this.getData();
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
    if (this.q.PublishTime !== undefined && this.q.PublishTime.length === 2)
    this.q.PublishTime = this.cfun.getSelectDate(this.q.PublishTime);
  if (this.q.ExpectedArrivalTime !== undefined && this.q.ExpectedArrivalTime.length === 2)
    this.q.ExpectedArrivalTime = this.cfun.getSelectDate(this.q.ExpectedArrivalTime);
}
  clrearWhere() {
    const tmp_workshops = this.sub_workshops.map(p => p.value);
    if (tmp_workshops.toString() === this.q.workshop.toString()) this.q.workshop = [];
  }}
