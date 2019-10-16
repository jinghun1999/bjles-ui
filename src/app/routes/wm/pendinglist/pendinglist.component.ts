import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService, ExpHttpService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { WmPendinglistEditComponent } from './edit/edit.component';
import { WmPendinglistViewComponent } from './view/view.component';
import { WmPendinglistUnblockComponent } from './unblock/unblock.component';

@Component({
  selector: 'app-wm-pendinglist',
  templateUrl: './pendinglist.component.html',
})
export class WmPendinglistComponent implements OnInit {
  actionPath = 'Warehouse/SuspiciousPartList.aspx';
  searchPath = '/wm/GetPendingPager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: ['Id'], type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '编辑',
          iif: item => !item.IsConfirmed,
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: WmPendinglistEditComponent,
          },
        },
        {
          text: '查看',
          iif: item => item.IsConfirmed,
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: WmPendinglistViewComponent,
          },
        },
      ],
    },
    { title: '封存条', index: 'SealingStripCode', sort: true },
    { title: '工厂', index: 'PlantID', sort: true },
    { title: '车间', index: 'Warehouse', sort: true },
    { title: '零件号', index: 'PartNumber', sort: true },
    { title: '零件名称', index: 'PartName', sort: true },
    { title: '供应商', index: 'SupplierID', sort: true },
    { title: '供应商名称', index: 'SupplierName', sort: true },
    { title: '原封存箱数', index: 'PackQty', sort: true },
    { title: '原封存件数', index: 'LockPartQty', sort: true },
    { title: '剩余封存件数', index: 'PartQty', sort: true },
    { title: '问题分类', index: 'IssuesClass_name', sort: true },
    { title: '是否确认', index: 'IsConfirmed_name', sort: { key: 'IsConfirmed' } },
    { title: '解封情况', index: 'UnlockStatus_name', sort: true },
    { title: '退货情况', index: 'ReturnStatus_name', sort: true },
    { title: '创单人', index: 'CreateUser_name', sort: true },
    { title: '创建时间', index: 'CreateTime', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig();
  expandForm = true;
  loading: boolean;

  size = 'small';
  today = new Date().toLocaleDateString();
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    plant: '',
    workshop: [],
    supplier: [],
    route: [],
    CreateTime: [new Date(this.today + ' 00:00:00'), new Date(this.today + ' 23:59:59')],
  };
  data: any[] = [];
  dataAction: any[] = [];
  pre_lists = [];
  sub_workshops = [];
  sub_supplier = new ItemData();
  sub_wm_suspicious_issuesclass = new ItemData();
  sub_wm_ISConfirmed = new ItemData();
  sub_wm_suspicious_unlock_status = new ItemData();
  sub_wm_suspicious_return_status = new ItemData();
  dataPrints: any[] = [];

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    public msg: NzMessageService,
    private cdr: ChangeDetectorRef,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
    private xlsx: XlsxService,
    private httpService: ExpHttpService,
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
      case 'Delete':
        // 批量更新
        this.Delete();
        break;
      case 'Download':
        this.Download();
        break;
      case 'Active':
        this.Confirm();
        break;
      case 'Print':
        this.print();
        break;
      case 'WMUnblock':
        this.Unblock();
        break;
      case 'Import':
        this.import();
        break;
    }
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
        .post('/wm/PendingImport', res1)
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

  Unblock() {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要解封的封存条！');
      return;
    }
    const IDS = this.selectedRows.map(p => p.Id).toString();

    this.modal.create(WmPendinglistUnblockComponent, { record: { IDS } }, { size: 'xl' }).subscribe(res => {
      if (res) this.st.reload();
    });
  }

  Confirm(): void {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要确认的封存条！');
      return;
    } else {
      this.loading = true;

      this.http
        .post('/wm/PendingConfirm', this.selectedRows)
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

  print() {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择要打印的记录');
      return false;
    } else {
      this.loading = true;
      this.http
        .post('/wm/PendingPrint', this.selectedRows)
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

  Download() {
    this.httpService.downLoadFile('/assets/tpl/pending_import.xlsx', 'pendingTPL');
  }

  Delete(): void {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要删除的记录！');
      return;
    } else {
      this.loading = true;

      this.http
        .post('/wm/PendingDelete', this.selectedRows)
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
    this.modal.create(WmPendinglistEditComponent, { record: { add: true } }, { size: 'xl' }).subscribe(res => {
      if (res) this.st.reload();
    });
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
    if (this.q.CreateTime !== undefined && this.q.CreateTime.length === 2)
    this.q.CreateTime = this.cfun.getSelectDate(this.q.CreateTime);
}
  clrearWhere() {
    const tmp_workshops = this.sub_workshops.map(p => p.value);
    if (tmp_workshops.toString() === this.q.workshop.toString()) this.q.workshop = [];
  }}
