import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { PartPartcardlistEditComponent } from './edit/edit.component';

@Component({
  selector: 'app-part-partlist',
  templateUrl: './partcardlist.component.html',
})
export class PartPartcardlistComponent implements OnInit {
  actionPath = 'PartManagement/PartCardList.aspx';
  searchPath = '/part/GetPartCardPager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: ['plant', 'workshop', 'card_no'], type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '编辑',
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: PartPartcardlistEditComponent,
          },
        },
      ],
    },
    { title: '工厂', index: 'plant', sort: true },
    { title: '车间', index: 'workshop', sort: true },
    { title: '卡号', index: 'card_no', sort: true },
    { title: '零件号', index: 'part_no', sort: true },
    { title: '零件名称', index: 'part_cname', sort: true },
    { title: '工位地址', index: 'uloc', sort: true },
    { title: '车型', index: 'CarModel', sort: true },
    { title: '车型具体配置', index: 'VehicleConfig', sort: true },

    { title: '最大存量', index: 'MaxPiece', sort: true },
    { title: '最小存量	', index: 'MinPiece', sort: true },
    { title: '占列', index: 'Column', sort: true },
    { title: '堆高', index: 'HeapHeight', sort: true },
    { title: '包装类型', index: 'store_packing', sort: true },
    { title: '包装数量', index: 'packing_qty', sort: true },
    { title: '库位地址', index: 'dloc', sort: true },
    { title: '配送路线代码', index: 'route_code', sort: true },
    { title: '卡片状态', index: 'card_state_name', sort: true },
    { title: '卡片类型', index: 'card_type_name', sort: true },
    { title: '零件活动状态', index: 'part_state_name', sort: true },
    { title: '删除标识', index: 'Flag', sort: true },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig();
  expandForm = true;
  loading: boolean;

  size = 'small';
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    plant: '',
    workshop: [],
  };
  data: any[] = [];
  dataAction: any[] = [];
  pre_lists = [];
  sub_workshops = [];
  sub_card_type = new ItemData();
  sub_card_state = new ItemData();

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
        this.q.sort.order = e.sort.value;        this.getData();
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
    }
  }

  hideOrExpand() {
    this.expandForm = !this.expandForm;
  }

  Create() {
    // this.modal.create(PartPartcardlistEditComponent, { record: [] }, { size: 'xl' }).subscribe(res => {});
  }

  Delete() {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要删除的零件！');
      return false;
    } else {
      this.loading = true;

      this.http
        .post('/part/PartCardDelete', this.selectedRows)
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
