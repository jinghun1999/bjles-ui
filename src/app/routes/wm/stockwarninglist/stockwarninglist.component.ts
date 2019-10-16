import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService, ExpHttpService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-wm-stockwarninglist',
  templateUrl: './stockwarninglist.component.html',
})
export class WmStockwarninglistComponent implements OnInit {
  actionPath = 'WMManagement/PartStockEarlyWarningQueryList.aspx';
  searchPath = '/wm/GetStockWarningPager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '工厂', index: 'plant', sort: true },
    { title: '车间', index: 'workshop', sort: true },
    { title: '库位', index: 'dloc', sort: true },
    { title: '零件号', index: 'part_no', sort: true },
    { title: '零件名称', index: 'part_cname', sort: true },

    { title: '标准包装数', index: 'packing_qty', sort: true },
    { title: '最大库存(箱)', index: 'max_storage', sort: true },
    { title: '最小库存(箱)', index: 'min_storage', sort: true },
    { title: '未出库箱数', index: 'oncarrier_storage', sort: true },
    { title: '未出库件数', index: 'oncarrier', sort: true },
    { title: '库存(箱)', index: 'current_storage', sort: true },
    { title: '库存(件)', index: 'current_parts', sort: true },
    { title: '当前散件数', index: 'current_fragpart_count', sort: true },

    { title: '在途物料单编号', index: 'runsheet_code', sort: true },
    { title: '预期到货时间', index: 'expected_arrival_time', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
    { title: '在途箱数', index: 'ActualSendPackQty', sort: true },

    { title: '供应商', index: 'SupplierName', sort: true },
    { title: '计划员', index: 'FollowUpID', sort: true },
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
    supplier: [],
  };
  data: any[] = [];
  dataAction: any[] = [];
  pre_lists = [];
  sub_workshops = [];
  sub_supplier = new ItemData();

  checkOptions = [
    { label: '大于最小库存,且当前数量减去未出库件数低于最小库存', value: '1', checked: false },
    { label: '低于最小库存', value: '2', checked: false },
    { label: '正常', value: '3', checked: false },
  ];

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

    this.capi.getPlantOfDiff('', '1', '0').subscribe(
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
      // case 'Active':
      //   this.Confirm();
      //   break;
      // case 'Print':
      //   this.print();
      //   break;
      // case 'WMUnblock':
      //   this.Unblock();
      //   break;
      case 'Import':
        this.import();
        break;
    }
  }

  import(): void {
    // const file1 = document.getElementById('import') as HTMLInputElement;
    // if (file1.files.length === 0) {
    //   this.msg.error('请选择需要导入的数据文件！');
    //   return;
    // }
    // const file = file1.files[0];
    // this.loading = true;
    // this.xlsx.import(file).then(res1 => {
    //   // EXCEL文件之中文字段改为英文字段
    //   // for (let j = 0, len = res1.sheet1[0].length; j < len; j++) {
    //   //   res1.sheet1[0][j] = this.columns.find(p => p.title === res1.sheet1[0][j]).index;
    //   // }
    //   this.http
    //     .post('/wm/StockWarningImport', res1)
    //     .pipe(tap(() => (this.loading = false)))
    //     .subscribe(
    //       res => {
    //         if (res.successful) {
    //           if (!res.data.result) {
    //             // this.cfun.downErrorExcel(res.data.column, res.data.errDT, 'supplyDate_error.xlsx');
    //           }
    //           this.msg.success(res.data.msg);
    //           this.st.reload();
    //         } else {
    //           this.msg.error(res.message);
    //           this.loading = false;
    //         }
    //       },
    //       (err: any) => this.msg.error('系统异常'),
    //     );
    // });
  }

  print() {
    // if (this.selectedRows.length === 0) {
    //   this.msg.error('请选择要打印的记录');
    //   return false;
    // } else {
    //   this.loading = true;
    //   this.http
    //     .post('/wm/StockWarningPrint', this.selectedRows)
    //     .pipe(tap(() => (this.loading = false)))
    //     .subscribe(
    //       res => {
    //         if (res.successful) {
    //           this.dataPrints = res.data.data;
    //           this.msg.success(res.data.msg);
    //           this.dataPrints.forEach(p => {
    //             window.open(p.print_file, '_blank');
    //           });
    //         } else {
    //           this.msg.error(res.message);
    //         }
    //       },
    //       (err: any) => this.msg.error('系统异常'),
    //     );
    // }
    // this.st.clearCheck();
  }

  Download() {
    // this.httpService.downLoadFile('/assets/tpl/StockWarning_import.xlsx', 'StockWarningTPL');
  }

  Delete(): void {
    // if (this.selectedRows.length === 0) {
    //   this.msg.error('请选择需要删除的记录！');
    //   return;
    // } else {
    //   this.loading = true;
    //   this.http
    //     .post('/wm/StockWarningDelete', this.selectedRows)
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

  Create() {
    // this.modal.create(WmStockWarninglistEditComponent, { record: { add: true } }, { size: 'xl' }).subscribe(res => {
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
    this.q.Status = this.checkOptions
      .filter(p => p.checked)
      .map(p => p.value)
      .toString();
  }
  clrearWhere() {
    const tmp_workshops = this.sub_workshops.map(p => p.value);
    if (tmp_workshops.toString() === this.q.workshop.toString()) this.q.workshop = [];
  }
}
