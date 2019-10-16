import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { SupplierSupplyschedulelistEditComponent } from './edit/edit.component';
import { CommonFunctionService, CommonApiService, ExpHttpService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-supplier-supplyschedulelist',
  templateUrl: './supplyschedulelist.component.html',
})
export class SupplierSupplyschedulelistComponent implements OnInit {
  actionPath = 'SupplierManagement/SupplierSupplyScheduleList.aspx';
  searchPath = '/supplier/GetSupplySchedulePager';
  @ViewChild('st', { static: false }) st: STComponent;

  columns: STColumn[] = [
    { title: '', index: ['SupplyScheduleID'], type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '编辑',
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: SupplierSupplyschedulelistEditComponent,
          },
        },
      ],
    },
    { title: '计划员编号', index: 'PlannerCode', sort: true },
    { title: '工厂', index: 'PlantID', sort: true },
    { title: '车间', index: 'WorkshopID', sort: true },
    { title: '供应商代码', index: 'SupplierID', sort: true },
    { title: '供应商名称', index: 'supplier_name', sort: true },
    { title: '零件号', index: 'PartNumber', sort: true },
    { title: '起始时间', index: 'StartTime', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
    { title: '结束时间', index: 'EndTime', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
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
    start_end_time: [new Date(this.today + ' 00:00:00'), new Date(this.today + ' 23:59:59')],
  };
  data: any[] = [];
  data_import: any;
  dataAction: any[] = [];
  pre_lists = [];
  sub_workshops = [];
  sub_supplier_code = new ItemData();

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
      case 'Import':
        this.import();
        break;
      case 'Download':
        this.Download();
        break;
      case 'Delete':
        this.Delete();
        break;
      case 'Create':
        this.Create();
        break;
    }
  }

  Create() {
    this.modal
      .create(SupplierSupplyschedulelistEditComponent, { record: { add: true } }, { size: 'xl' })
      .subscribe(res => {
        if (res) this.st.reload();
      });
  }

  hideOrExpand() {
    this.expandForm = !this.expandForm;
  }

  import() {
    const file1 = document.getElementById('import') as HTMLInputElement;
    if (file1.files.length === 0) {
      this.msg.error('请选择需要导入的数据文件！');
      return false;
    }
    const file = file1.files[0];
    this.loading = true;
    this.xlsx.import(file).then(res1 => {
      // EXCEL文件之中文字段改为英文字段
      // for (let j = 0, len = res1.sheet1[0].length; j < len; j++) {
      //   res1.sheet1[0][j] = this.columns.find(p => p.title === res1.sheet1[0][j]).index;
      // }
      this.http
        .post('/supplier/SupplyScheduleImport', res1)
        .pipe(tap(() => (this.loading = false)))
        .subscribe(
          res => {
            if (res.successful) {
              if (!res.data.result) {
                this.cfun.downErrorExcel(res.data.column, res.data.errDT, 'purchasing_error.xlsx');
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

  Delete(): void {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要删除的计划！');
      return;
    } else {
      this.loading = true;

      this.http
        .post('/supplier/SupplyScheduleDelete', this.selectedRows)
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

  Download() {
    const currentColumn: STColumn[] = this.columns.filter(
      p => (p.exported === undefined || p.exported) && p.buttons === undefined,
    );
    const data = [currentColumn.map(i => i.title)];
    this.xlsx.export({
      sheets: [
        {
          data,
          name: 'sheet1',
        },
      ],
    });

    // this.httpService.downLoadFile('/assets/tpl/purchasing_import.xlsx', 'purchasingTPL');
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
    this.q.start_end_time = this.cfun.getSelectDate(this.q.start_end_time);
  }
  clrearWhere() {
    const tmp_workshops = this.sub_workshops.map(p => p.value);
    if (tmp_workshops.toString() === this.q.workshop.toString()) this.q.workshop = [];
  }}
