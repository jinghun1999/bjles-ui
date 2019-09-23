import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService } from '@core';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { SupplierWtmodellistDetaileditComponent } from '../detailedit/detailedit.component';
import { Form } from '@angular/forms';

@Component({
  selector: 'app-supplier-wtmodellist-edit',
  templateUrl: './edit.component.html',
})
export class SupplierWtmodellistEditComponent implements OnInit {
  record: any = {};

  actionPath = 'SupplierManagement/WTModeEdit.aspx';
  searchPath = '/supplier/GetWTDetailPager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: ['modedetail_id'], type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '修改',
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: SupplierWtmodellistDetaileditComponent,
          },
        },
      ],
    },
    { title: '工厂', index: 'plant', sort: true },
    { title: '车间', index: 'workshop', sort: true },
    { title: '供应商代码', index: 'supplier', sort: true },
    { title: '供应商名称', index: 'supplier_name', sort: true },
    { title: '配送线路代码', index: 'route', sort: true },
    { title: '拉动类型', index: 'part_type_name', sort: true },
    { title: '窗口时间', index: 'window_time', sort: true },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig();
  expandForm = true;
  loading: boolean;

  size = 'small';
  data: any[] = [];
  dataAction: any[] = [];
  pre_lists = [];
  sub_workshops = [];
  sub_isdefault = new ItemData();
  sub_route = new ItemData();
  sub_supplier = new ItemData();
  isReadonly = true;

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private modal1: NzModalRef,
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
          this.initQ();
        }
      },
      (err: any) => this.msg.error('获取不到工厂车间信息！！'),
    );

    // toolBar
    this.capi.getActions(this.actionPath).subscribe((res: any) => {
      if (this.record.add === true) res = res.filter(p => p.action_name === 'Save');
      this.dataAction = res;
    });
    this.initCodeDetail();
    this.getListItems(true, 'route');
    this.getListItems(true, 'supplier');
    this.loading = false;
    this.record.page = new PageInfo();
    this.record.sort = new SortInfo();
  }

  initQ() {
    if (this.record.add === true) {
      this.record.plant = this.pre_lists[0].value;
      this.isReadonly = false;
    }
    this.plantChange(this.record.plant);
  }

  getListItems(value: any, type: any): void {
    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);

    if (value && this.record.workshop !== tmp_data.last_workshop) {
      if (this.record.workshop !== undefined && this.record.workshop.length > 0) {
        this.loading = true;
        this.capi.getListItems(type, this.record.plant, this.record.workshop).subscribe(
          (res: any) => {
            tmp_data.data = res;
          },
          (err: any) => this.msg.error('获取数据失败!'),
        );
        this.loading = false;
        tmp_data.last_workshop = this.record.workshop;
      } else {
        tmp_data.data = [];
        tmp_data.last_workshop = '';
      }

      // tslint:disable-next-line: no-eval
      eval('this.record.' + type + ' =  undefined;');
    }
  }
  initCodeDetail() {
    this.capi.getCodeDetailInfo('isdefault', '', 'int').subscribe((res: any) => {
      this.sub_isdefault.data = res;
    });
  }

  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshops = l.children;
    if (this.record.add === true) this.record.workshop = '';
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
        this.record.page.pi = e.pi;
        this.getData();
        break;
      case 'ps':
        this.record.page.ps = e.ps;
        this.getData();
        break;
      case 'sort':
        this.record.sort.field = e.sort.column.indexKey;
        this.record.sort.order = e.sort.value;
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
      case 'HideOrExpand':
        this.hideOrExpand();
        break;
      case 'AddDetail':
        this.Create();
        break;
      case 'Delete':
        this.Delete();
        break;
      case 'Import':
        this.import();
        break;
      case 'Export':
        this.export();
        break;
      case 'Save':
        this.save();
        break;
    }
  }
  save() {
    this.loading = true;
    this.http.post('/supplier/WTSave', this.record).subscribe(
      (res: any) => {
        if (res.successful) {
          this.msg.success(res.data);
          this.loading = false;
          this.modal1.close(true);
        } else {
          this.msg.error(res.message);
          this.loading = false;
        }
      },
      (err: any) => this.msg.error('保存失败!'),
    );
  }

  export() {
    if (this.st.total === 0) {
      this.msg.error('请输入条件，查询出数据方可导出数据！');
      return false;
    }
    const item_c: STColumn = { title: 'mode_name', index: 'mode_name' };
    const currentColumn: STColumn[] = this.columns.filter(
      p => (p.exported === undefined || p.exported) && p.buttons === undefined,
    );
    currentColumn.push(item_c);

    this.record.page.export = true;
    this.http
      .post(this.searchPath, this.record)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
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
            //   _c: currentColumn,
            //   callback: this.cfun.callbackOfExport,
            //   filename: 'result.xlsx',
            //   sheetname: 'sheet1',
            // });
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
          this.record.page.export = false;
        },
        (err: any) => this.msg.error('系统异常'),
      );
  }

  import() {
    if (this.record.add === true) {
      this.msg.error('请在新增模式下不能导入子项,请先保存！');
      return false;
    }
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
      const param: any = {
        plant: this.record.plant,
        workshop: this.record.workshop,
        mode_id: this.record.mode_id,
        sheet: res1,
        column: this.columns
          .filter(p => (p.exported === undefined || p.exported) && p.buttons === undefined)
          .map(p => ({ ItemText: p.title, ItemValue: p.index })),
      };
      this.http
        .post('/supplier/WTImport', param)
        .pipe(tap(() => (this.loading = false)))
        .subscribe(
          res => {
            if (res.successful) {
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
      this.msg.error('请选择需要删除的记录！');
      return;
    } else {
      this.loading = true;

      this.http
        .post('/supplier/WTDetailDelete', this.selectedRows)
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
      .create(
        SupplierWtmodellistDetaileditComponent,
        { record: { add: true, plant: this.record.plant, workshop: this.record.workshop } },
        { size: 'xl' },
      )
      .subscribe(res => {
        if (res) this.st.reload();
      });
  }

  search() {
    this.getData();
  }

  getData() {
    this.loading = true;

    this.http
      .post(this.searchPath, this.record)
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
  }
}
