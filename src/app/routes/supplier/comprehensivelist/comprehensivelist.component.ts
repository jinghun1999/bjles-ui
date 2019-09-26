import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { SupplierComprehensivelistEditComponent } from './edit/edit.component';
import { CacheService } from '@delon/cache';

@Component({
  selector: 'app-supplier-comprehensivelist',
  templateUrl: './comprehensivelist.component.html',
})
export class SupplierComprehensivelistComponent implements OnInit {
  actionPath = 'SupplierManagement/ComprehensiveInfoList.aspx';
  searchPath = '/supplier/GetComprehensivePager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: ['ID'], type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '编辑',
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: SupplierComprehensivelistEditComponent,
          },
        },
      ],
    },
    { title: '工厂', index: 'plant', sort: true },
    { title: '车间', index: 'workshop', sort: { key: 'Workshop' } },
    { title: '零件卡号', index: 'cardno', sort: true },
    { title: '零件号', index: 'partno', sort: true },
    { title: '零件中文名称', index: 'partcname', sort: true },
    { title: '车型', index: 'CarModel', sort: true },
    { title: '车型具体配置', index: 'VehicleConfig', sort: true },
    { title: '工位用量', index: 'Usage', sort: true },
    { title: '工位地址', index: 'Uloc', sort: true },
    { title: '线旁最小存量', index: 'MinPiece', sort: true },
    { title: '线旁最大存量', index: 'MaxPiece', sort: true },
    { title: '线旁堆高', index: 'HeapHeight', sort: true },
    { title: '线旁占列', index: 'Column', sort: true },
    { title: '线旁包装类型', index: 'storepacking', sort: true },
    { title: '线旁包装数量', index: 'packingqty', sort: true },

    { title: '线旁包装长(mm)-非排序件', index: 'x', sort: true },
    { title: '线旁包装宽(mm)-非排序件', index: 'y', sort: true },
    { title: '线旁包装高(mm)-非排序件', index: 'z', sort: true },
    { title: '线旁包装类型-排序/填充', index: 'Px', sort: true },
    { title: '线旁包装数-排序/填充', index: 'Py', sort: true },
    { title: '线旁包装尺寸-排序/填充', index: 'pz', sort: true },
    { title: '标签规格', index: 'lable_type_name', sort: { key: 'LabelType' } },
    { title: '料架代码', index: 'rack', sort: true },
    { title: '排序类型', index: 'jisrackseq', sort: true },
    { title: '厂内配送线路代码', index: 'route', sort: true },
    { title: '厂内响应时间(min)', index: 'onlinetime', sort: true },
    { title: '零件专业科室', index: 'PartsDepartment', sort: true },
    { title: '拉动类型', index: 'part_type_name', sort: { key: 'parttype' } },
    { title: '库位地址', index: 'Dloc', sort: true },
    { title: '仓库最小库存（来源仓库的最小存量）', index: 'Cminstorage', sort: true },
    { title: '仓库最大库存（来源仓库的最大存量）', index: 'Cmaxstorage', sort: true },
    { title: '仓库堆高（来源仓库的）', index: 'CHeapHeight', sort: true },
    { title: '仓库占列（来源仓库的）', index: 'CColumn', sort: true },

    { title: 'Dock编号（来源仓库）', index: 'Cdock', sort: true },
    { title: '仓库包装类型（来源仓库）', index: 'Cstorepacking', sort: true },
    { title: '仓库包装数量（来源仓库）', index: 'Cpackingqty', sort: true },
    { title: '仓库包装长(mm)（来源仓库）', index: 'CX', sort: true },
    { title: '仓库包装宽(mm)（来源仓库）', index: 'CY', sort: true },
    { title: '仓库包装高(mm)（来源仓库）', index: 'CZ', sort: true },
    { title: '供应商代码', index: 'ShipSupplierID', sort: true },
    { title: '供应商名称', index: 'Csuppliername', sort: true },

    { title: '物流公司', index: 'LogisticsCompany', sort: true },
    { title: '供应商送货频次	', index: 'Supplierfrequency', sort: true },
    { title: '供应商配比(供应商到仓库）', index: 'CRatio', sort: true },
    { title: '计划员', index: 'CFollowUpID', sort: true },
    { title: '供应商包装类型', index: 'Supplierpacking', sort: true },
    { title: '供应商包装数量', index: 'Supplierqty', sort: true },
    { title: '供应商包装长(mm)', index: 'Supplierx', sort: true },
    { title: '供应商包装宽(mm)', index: 'Suppliery', sort: true },
    { title: '供应商包装高(mm)', index: 'Supplierz', sort: true },
    { title: '包装容积率', index: 'Supplierratio', sort: true },
    { title: '是否超重', index: 'overweight_name', sort: { key: 'IsOverweight' } },
    { title: '是否一次性包装', index: 'packaging_name', sort: { key: 'IsPackaging' } },
    { title: '是否翻包', index: 'flipBag_name', sort: { key: 'IsFlipBag' } },
    { title: '是否是直供件', index: 'direct_name', sort: { key: 'IsDirect' } },
    { title: '外部拉动方式', index: 'ExternalPull', sort: true },
    { title: '车型在产情况', index: 'CarModelType', sort: true },
    { title: '备注', index: 'Remark', sort: true },
    { title: '卡片状态', index: 'cardstate_name', sort: { key: 'cardstate' } },
    { title: '数据可见性', index: 'dataVisible_name', sort: { key: 'DataVisible' } },
    { title: '同步时间', index: 'SynchronizeDate', sort: true },
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
    jisrackseq: [],
    supplier: [],
    Cstorepacking: [],
  };
  data: any[] = [];
  dataAction: any[] = [];
  pre_lists = [];
  sub_workshops = [];
  sub_supplier_code = new ItemData();
  sub_rack = new ItemData();

  sub_RepackLabelPrintType = new ItemData();
  sub_StorePackings = new ItemData();
  sub_Data_Visible = new ItemData();

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    public msg: NzMessageService,
    private cdr: ChangeDetectorRef,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
    private xlsx: XlsxService,
    public cache: CacheService,
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
    this.initStorePackings();
    this.loading = false;
  }

  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshops = l.children;
    this.q.workshop = '';
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

  initStorePackings() {
    this.http
      .get('/part/GetStorePackings')
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.sub_StorePackings.data = res.data;
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );
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
        //  this.q.sort = e.sort.column._sort;

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
        this.Delete();
        break;
      case 'Import':
        this.import();
        break;
      case 'Reset':
        this.Reset();
        break;
    }
  }
  Reset(): void {
    this.loading = true;
    this.http
      .post('/supplier/ComprehensiveReset')
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.msg.success(res.data);
            this.st.reload();
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );
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
        .post('/supplier/ComprehensiveImport', res1)
        .pipe(tap(() => (this.loading = false)))
        .subscribe(
          res => {
            if (res.successful) {
              if (!res.data.result) {
                this.cfun.downErrorExcel(res.data.column, res.data.errDT, 'supplyDate_error.xlsx');
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

  Delete(): void {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要删除的计划！');
      return;
    } else {
      this.loading = true;

      this.http
        .post('/supplier/ComprehensiveSave', this.selectedRows)
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
    this.modal
      .create(SupplierComprehensivelistEditComponent, { record: { add: true } }, { size: 'xl' })
      .subscribe(res => {
        if (res) this.st.reload();
      });
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

            // this.st.export(res.data.rows, {
            //   callback: this.cfun.callbackOfExport,
            //   filename: 'result.xlsx',
            //   sheetname: 'sheet1',
            // });
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
          this.q.page.export = false;
        },
        (err: any) => this.msg.error('系统异常'),
      );
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
