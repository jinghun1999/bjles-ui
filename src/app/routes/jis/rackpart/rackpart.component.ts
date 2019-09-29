import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { tap } from 'rxjs/operators';
import { UploadFile } from 'ng-zorro-antd/upload';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';
import { JisRackpartEditComponent } from './edit/edit.component';

@Component({
  selector: 'app-jis-rackpart',
  templateUrl: './rackpart.component.html',
})
export class JisRackpartComponent implements OnInit {
  constructor(
    private http: _HttpClient,
    public msg: NzMessageService,
    // private cdr: ChangeDetectorRef,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
    private model: ModalHelper,
    private modelSrv: NzModalService,
    private xlsx: XlsxService,
  ) {}
  today = new Date().toLocaleDateString();
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    plant: '',
    workshop: [],
    supplier: [],
    rack: [],
    part_no: '',
    part_name: '',
  };
  size = 'small';
  data: any[] = [];
  actions: any[] = [];
  dataPrints: any[] = [];
  pre_lists = [];

  sub_workshop = [];
  sub_supplier = new ItemData();
  sub_route = new ItemData();
  sub_rack = new ItemData();

  // sub_rack_state = new ItemData();
  // sub_rack_seq = new ItemData();
  codes = {
    c1: [],
    c2: [],
  };

  fileList = [];

  loading = false;
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox', exported: false },
    { title: '工厂', index: 'plant', sort: true },
    { title: '车间', index: 'workshop', sort: true },
    { title: '供应商代码', index: 'supplier', sort: true },
    { title: '供应商名称', index: 'supplier_name', sort: true },
    { title: '料架代码', index: 'rack', sort: true },
    { title: '排序类型', index: 'rack_name', sort: true },
    { title: '零件号', index: 'jit_part_no', sort: true },
    { title: '零件名称', index: 'part_name', sort: true },
    { title: '累计消耗个数', index: 'total_amount', sort: true },
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

    // toolBar
    this.capi.getActions('JISManagement/JITPartMapList.aspx').subscribe((res: any) => {
      this.actions = res;
      this.loading = false;
    });

    this.capi.getCodes('rack_state,jis_rack_seq').subscribe((rs1: any) => {
      this.codes = rs1;
    });
  }

  getData() {
    this.loading = true;
    const tmp_workshops = this.sub_workshop.map(p => p.value);

    if (this.q.workshop === '' || this.q.workshop === undefined || this.q.workshop.length === 0) {
      this.q.workshop = tmp_workshops;
    }

    this.http
      .post('/jis/postRackpartPager', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.data = res.data.rows;
            this.st.total = res.data.total;
            // this.cdr.detectChanges();
          } else {
            this.msg.error(res.message);
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );
    if (tmp_workshops === this.q.workshop) this.q.workshop = [];
  }

  stChange(e: STChange) {
    switch (e.type) {
      case 'checkbox':
        this.selectedRows = e.checkbox!;
        // this.cdr.detectChanges();
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
      case 'Create':
        this.add();
        break;
      case 'Delete':
        this.delete();
        break;
      case 'Search':
        this.q.page.pi = 1;
        this.getData();
        this.expandForm = false;
        break;
      case 'Export':
        this.export();
        break;
      case 'HideOrExpand':
        this.hideOrExpand();
        break;
      case 'Import':
        // 导入
        this.handleUpload();
        break;
    }
  }

  reset() {
    // wait form reset updated finished
    setTimeout(() => {});
    // setTimeout(() => this.getData());
  }

  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshop = l.children;
    this.q.workshop = '';
  }

  getListItems(value: any, type: string): void {
    // tslint:disable-next-line: no-eval
    const t = eval('this.sub_' + type);
    let supplier = null;
    const wk = this.q.workshop.toString();
    if (type === 'rack') {
      supplier = this.q.supplier.toString();
    }
    if (!value || (wk === t.last_workshop && type !== 'rack')) {
      return;
    }
    if (this.q.workshop.length > 0) {
      this.loading = true;
      this.capi.getListItems(type, this.q.plant, wk, supplier).subscribe((res: any) => {
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

  getCodeDetails(value: any, type: string) {
    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);
    if (value && tmp_data.data.length === 0) {
      this.capi.getCodeDetailInfo(type, '').subscribe((res: any) => {
        tmp_data.data = res;
      });
    }
  }

  hideOrExpand() {
    this.expandForm = !this.expandForm;
  }

  export() {
    if (this.st.total === 0) {
      this.msg.error('请先查询出数据再导出');
      return;
    }

    this.q.page.export = true;
    this.http
      .post('/jis/postRackpartPager', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.st.export(res.data.rows, {
              callback: this.cfun.callbackOfExport,
              filename: 'rack-part.xlsx',
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

  add() {
    this.model.create(JisRackpartEditComponent, { record: { add: true } }, { size: 'xl' }).subscribe(res => {
      this.getData();
    });
  }

  delete() {
    if (this.selectedRows.length === 0) {
      this.msg.error('请先选择要操作的数据');
      return false;
    } else {
      this.modelSrv.confirm({
        nzTitle: '删除提示',
        nzContent: '删除后不可恢复，确认删除吗？',
        nzOkType: 'danger',
        nzOnOk: () => {
          this.http.post('/jis/postDeleteRackpart', this.selectedRows).subscribe((res: any) => {
            if (res.successful) {
              this.selectedRows = [];
              this.msg.success(res.data);
              this.getData();
            }
          });
        },
      });
    }
  }

  beforeUpload = (file: UploadFile): boolean => {
    this.fileList = [];
    this.fileList = this.fileList.concat(file);
    return false;
  };

  handleUpload(): void {
    if (!this.fileList.length) {
      this.msg.warning('请先选择导入文件');
      return;
    }
    const file = this.fileList[0];
    this.loading = true;
    this.xlsx.import(file).then(res1 => {
      this.fileList = [];
      this.http
        .post('/jis/postImportRackPart', res1)
        .pipe(tap(() => (this.loading = false)))
        .subscribe(res => {
          this.loading = false;
          if (res.successful) {
            if (res.data.errDT) {
              this.cfun.downErrorExcel(res.data.column, res.data.errDT, 'rackpart_import_error.xlsx');
            } else {
              this.msg.info(res.data.msg);
              this.st.reload();
            }
          } else {
            this.msg.error(res.message);
          }
        });
    });
  }
}
