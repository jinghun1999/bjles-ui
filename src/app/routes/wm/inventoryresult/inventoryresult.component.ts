import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService, ExpHttpService, ENUMWMInventoryStatus } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { WmInventoryreportViewComponent } from '../inventoryreport/view/view.component';

@Component({
  selector: 'app-wm-inventoryresult',
  templateUrl: './inventoryresult.component.html',
})
export class WmInventoryresultComponent implements OnInit {
  actionPath = 'Warehouse/StoreInventoryResultList.aspx';
  searchPath = '/wm/GetInventoryPager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: ['Id'], type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '查看',
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            params: (record: STData) => {
              record.pageStatus = '';
              return record;
            },
            component: WmInventoryreportViewComponent,
          },
        },
        {
          text: '确认差异',
          iif: record => record.Status === ENUMWMInventoryStatus.Completed,
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            params: (record: STData) => {
              record.pageStatus = 'Confirm';
              return record;
            },
            component: WmInventoryreportViewComponent,
          },
        },
        {
          text: `完成`,
          click: record => this.GetInventorySubmitResult(record.Id),
          iif: record => record.Status === ENUMWMInventoryStatus.Inventoryed,
        },

      ],
    },
    {
      title: '冲销', index: 'ReserveStatus', sort: true, type: 'badge',
      badge: {
        0: { text: '未冲销', color: 'default' },
        1: { text: '已冲销', color: 'error' },
        // 4: { text: 'Success', color: 'success' },
        // 3: { text: 'Processing', color: 'processing' },
        // 5: { text: 'Warning', color: 'warning' },
      },
    },
    { title: '盘点单号', index: 'InventoryCode', sort: true },
    { title: '工厂', index: 'PlantID', sort: true },
    { title: '车间', index: 'Warehouse', sort: true },
    { title: '盘点类型', index: 'InventoryType_name', sort: true },
    { title: '盘点模式', index: 'InventoryMode_name', sort: true },
    { title: '单据状态', index: 'status_name', sort: true },
    { title: '差异原因', index: 'DiffReason', sort: true, render: "rd_diffReason" },

    { title: '盘点人', index: 'InventoryUser_name', sort: true },
    { title: '创单人', index: 'CreateUser_name', sort: true },
    { title: '创单时间', index: 'CreateTime', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
    { title: '修改人', index: 'ModifyUser_name', sort: true },
    { title: '修改时间', index: 'ModifyTime', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig() as STPage;
  expandForm = true;
  loading: boolean;

  size = 'small';
  // today = new Date().toLocaleDateString();
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    plant: '',
    workshop: [],
    usePage: 'result',

    // CreateTime: [new Date(this.today + ' 00:00:00'), new Date(this.today + ' 23:59:59')],
  };
  data: any[] = [];
  dataAction: any[] = [];
  pre_lists = [];
  sub_workshops = [];

  sub_wm_Inventory_status = new ItemData();
  sub_wm_inventory_mode = new ItemData();
  sub_wm_inventory_type = new ItemData();

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
    this.q.workshop = [];
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
      case 'Download':
        this.Download();
        break;
      case 'Active':
        this.Confirm();
        break;
      case 'Print':
        this.print();
        break;
      case 'Import':
        this.import();
        break;
      case 'WMUnblock':
        this.Unblock();
        break;
    }
  }
  Unblock(): void {
    if (this.selectedRows.length !== 1) {
      this.msg.error('请选择一条记录再操作!');
      return;
    }
    this.selectedRows[0].pageStatus = 'Unblock';

    this.modal.create(WmInventoryreportViewComponent, { record: this.selectedRows[0] }, { size: 'xl' }).subscribe(res => {
      if (res) this.st.reload();
    });

  }
  import(): void {
    if (this.selectedRows.length !== 1) {
      this.msg.error('请选择一条记录再导入!');
      return;
    }
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
        .post('/wm/InventoryResultImport', { main: this.selectedRows[0], val: res1 })
        .pipe(tap(() => (this.loading = false)))
        .subscribe(
          res => {
            if (res.successful) {
              if (!res.data.result) {
                this.cfun.downErrorExcel(res.data.column, res.data.errDT, 'InventoryResult_error.xlsx');
                this.msg.error(res.data.msg);
              } else {
                this.msg.success(res.data.msg);
                this.st.reload();
              }
            } else {
              this.msg.error(res.message);
              this.loading = false;
            }
          },
          (err: any) => this.msg.error('系统异常'),
        );
    });
  }
  GetInventorySubmitResult(Id: any): void {
    this.http
      .get('/wm/GetInventorySubmitResult?Id=' + Id)
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

  Confirm(): void {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要确认的记录！');
      return;
    } else {
      this.loading = true;

      this.http
        .post('/wm/InventoryConfirm', this.selectedRows)
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
        .post('/wm/InventoryPrint', this.selectedRows)
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
    if (this.selectedRows.length !== 1) {
      this.msg.error('请选择一条记录再导出!');
      return;
    }
    this.http
      .post('/wm/InventoryResultDownTPL', this.selectedRows[0])
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.cfun.downErrorExcel(res.data.column, res.data.dt, 'InventoryResultTPL.xlsx');
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );

    // this.httpService.downLoadFile('/assets/tpl/InventoryResult_import.xlsx', 'InventoryResultTPL');
  }

  Delete(): void {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要删除的记录！');
      return;
    } else {
      this.loading = true;

      this.http
        .post('/wm/InventoryDelete', this.selectedRows)
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
    // if (this.q.CreateTime !== undefined && this.q.CreateTime.length === 2)
    //   this.q.CreateTime = this.cfun.getSelectDate(this.q.CreateTime);
  }
  clrearWhere() {
    const tmp_workshops = this.sub_workshops.map(p => p.value);
    if (tmp_workshops.toString() === this.q.workshop.toString()) this.q.workshop = [];
  }
}
