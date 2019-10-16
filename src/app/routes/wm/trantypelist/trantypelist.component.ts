import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService, ExpHttpService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { WmTrantypelistEditComponent } from './edit/edit.component';

@Component({
  selector: 'app-wm-trantypelist',
  templateUrl: './trantypelist.component.html',
})
export class WmTrantypelistComponent implements OnInit {
  actionPath = 'Warehouse/WMTranTypeList.aspx';
  searchPath = '/wm/GetTranTypePager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: ['Id'], type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '复制',
          // iif: item => item.Status === 0,
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: WmTrantypelistEditComponent,
            params: (record: STData) => {
              record.add = true;
              return record;
            },
          },
        },
        {
          text: '编辑',
          //  iif: item => item.Status !== 0,
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: WmTrantypelistEditComponent,
          },
        },
      ],
    },
    { title: '移动类型名称', index: 'ConfigName', sort: true },
    { title: '移动类型编码', index: 'TransactionCode', sort: true },
    { title: 'SAP移动类型编码', index: 'TransactionCodeSap', sort: true },
    { title: '工厂', index: 'PlantId', sort: true },

    { title: 'SAP源车间模式', index: 'SapSourceMode_name', sort: true },
    { title: 'SAP源车间固定值', index: 'SapSourceValue', sort: true },
    { title: 'SAP目标车间模式', index: 'SapTargetMode_name', sort: true },
    { title: 'SAP目标车间固定值', index: 'SapTargetValue', sort: true },
    { title: '源仓库', index: 'SourceWarehouse', sort: true },
    { title: '目标仓库', index: 'TargetWarehouse', sort: true },
    { title: '单据类型', index: 'BusinessType_name', sort: true },

    { title: '是否预置', index: 'IsPreset', sort: true, type: 'yn', yn: { mode: 'text' } },
    { title: '创建入库单', index: 'IsCreateInboundSheet', sort: true, type: 'yn', yn: { mode: 'text' } },
    { title: '创建出库单', index: 'IsCreateIssueSheet', sort: true, type: 'yn', yn: { mode: 'text' } },
    { title: '拆单', index: 'IsNeedSplitSheet', sort: true, type: 'yn', yn: { mode: 'text' } },
    { title: '收货确认', index: 'IsInboundConfirm', sort: true, type: 'yn', yn: { mode: 'text' } },
    { title: '发货确认(备件即出库)', index: 'IsDirectIssue', sort: true, type: 'yn', yn: { mode: 'text' } },
    {
      title: '发货确认(备件后再出库)',
      index: 'IsPrepareAndIssue',
      sort: true,
      type: 'yn',
      yn: { mode: 'text' },
    },
    { title: '波次收发', index: 'IsWaveOperate', sort: true, type: 'yn', yn: { mode: 'text' } },
    { title: '入库扫箱', index: 'IsInScanBox', sort: true, type: 'yn', yn: { mode: 'text' } },
    { title: '出库扫箱', index: 'IsOutScanBox', sort: true, type: 'yn', yn: { mode: 'text' } },
    { title: '备料扫箱', index: 'IsPreparePartsScanBox', sort: true, type: 'yn', yn: { mode: 'text' } },
    { title: '扣减源', index: 'IsDeductionSource', sort: true, type: 'yn', yn: { mode: 'text' } },
    { title: '增加目标', index: 'IsIncreaseTarget', sort: true, type: 'yn', yn: { mode: 'text' } },
    { title: '传帐', index: 'IsTransAccount', sort: true, type: 'yn', yn: { mode: 'text' } },

    { title: '上次修改时间', index: 'ModifyDate', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
    { title: '说明', index: 'Remark', sort: true },
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
    workshop_s: [],
    workshop_t: [],
  };
  data: any[] = [];
  dataAction: any[] = [];
  pre_lists = [];
  sub_workshops_s = [];
  sub_workshops_t = [];
  sub_wm_tran_sheet_type = new ItemData();

  // dataPrints: any[] = [];

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
          this.sub_workshops_s = this.pre_lists[0].children;
          this.sub_workshops_t = this.pre_lists[0].children;
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
    // const tmp_data = eval('this.sub_' + type);
    // if (value && this.q.workshop.toString() !== tmp_data.last_workshop) {
    //   if (this.q.workshop.length > 0) {
    //     this.loading = true;
    //     this.capi.getListItems(type, this.q.plant, this.q.workshop.toString()).subscribe(
    //       (res: any) => {
    //         tmp_data.data = res;
    //       },
    //       (err: any) => this.msg.error('获取数据失败!'),
    //     );
    //     this.loading = false;
    //     tmp_data.last_workshop = this.q.workshop.toString();
    //   } else {
    //     tmp_data.data = [];
    //     tmp_data.last_workshop = '';
    //   }
    //   // tslint:disable-next-line: no-eval
    //   eval('this.q.' + type + ' =  [];');
    // }
  }

  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshops_s = l.children;
    this.sub_workshops_t = l.children;
    this.q.workshop_s = '';
    this.q.workshop_t = '';
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
      const ct = [];
      for (let j = 0, len = res1.sheet1[0].length; j < len; j++) {
        ct.push({ text: res1.sheet1[0][j], val: this.columns.find(p => p.title === res1.sheet1[0][j]).index });
      }
      this.http
        .post('/wm/TranTypeImport', { text: ct, val: res1 })
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

  Confirm(): void {
    // if (this.selectedRows.length === 0) {
    //   this.msg.error('请选择需要确认的记录！');
    //   return;
    // } else {
    //   this.loading = true;
    //   this.http
    //     .post('/wm/TranTypeConfirm', this.selectedRows)
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

  print() {
    // if (this.selectedRows.length === 0) {
    //   this.msg.error('请选择要打印的记录');
    //   return false;
    // } else {
    //   this.loading = true;
    //   this.http
    //     .post('/wm/DiffWirteoffPrint', this.selectedRows)
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
    this.httpService.downLoadFile('/assets/tpl/TranType_import.xlsx', 'TranTypeTPL');
  }

  Delete(): void {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要删除的记录！');
      return;
    } else {
      this.loading = true;

      this.http
        .post('/wm/TranTypeDelete', this.selectedRows)
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
    this.modal.create(WmTrantypelistEditComponent, { record: { add: true } }, { size: 'xl' }).subscribe(res => {
      if (res) this.st.reload();
    });
  }
  initWhere() {
    const tmp_workshops_s = this.sub_workshops_s.map(p => p.value);
    const tmp_workshops_t = this.sub_workshops_t.map(p => p.value);
    if (this.q.workshop_s === '' || this.q.workshop_s === undefined || this.q.workshop_s.length === 0) {
      this.q.workshop_s = tmp_workshops_s;
    }
    if (this.q.workshop_t === '' || this.q.workshop_t === undefined || this.q.workshop_t.length === 0) {
      this.q.workshop_t = tmp_workshops_t;
    }
  }
  clrearWhere() {
    const tmp_workshops_s = this.sub_workshops_s.map(p => p.value);
    const tmp_workshops_t = this.sub_workshops_t.map(p => p.value);
    if (tmp_workshops_s.toString() === this.q.workshop_s.toString()) this.q.workshop_s = [];
    if (tmp_workshops_t.toString() === this.q.workshop_t.toString()) this.q.workshop_t = [];
  }

  export() {
    if (this.st.total === 0) {
      this.msg.error('请输入条件，查询出数据方可导出数据！');
      return false;
    }
    this.initWhere();

    this.q.page.export = true;
    this.http
      .post(this.searchPath, this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            const currentColumn: STColumn[] = this.columns.filter(
              p => (p.exported === undefined || p.exported) && p.buttons === undefined,
            );
            const data = [currentColumn.map(i => i.title)];
            res.data.rows.forEach(i => data.push(currentColumn.map(c => i[c.index as string])));
            this.xlsx.export({
              sheets: [
                {
                  data,
                  name: 'sheet1',
                },
              ],
            });
            // this.cfun.downErrorExcel(res.data.column, res.data.ExportDT, 'result.xlsx');
            // this.st.export(res.data.rows, {
            //   callback: this.cfun.callbackOfExport,
            //   filename: 'result.xlsx',
            //   sheetname: 'sheet1',
            // });
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
}
