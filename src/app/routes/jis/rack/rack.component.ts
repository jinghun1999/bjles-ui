import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { tap } from 'rxjs/operators';
import { UploadFile } from 'ng-zorro-antd/upload';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { CommonApiService, CommonFunctionService } from '@core';
import { JisRackEditComponent } from './edit/edit.component';

@Component({
  selector: 'app-jis-rack',
  templateUrl: './rack.component.html',
})
export class JisRackComponent implements OnInit {
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
    route: [],
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
    {
      title: '',
      buttons: [
        {
          text: '编辑',
          type: 'modal',
          modal: {
            size: 'xl',
            component: JisRackEditComponent,
          },
          click: 'reload',
        },
      ],
    },
    { title: '工厂', index: 'plant', sort: true },
    { title: '车间', index: 'workshop', sort: true },
    { title: '料架代码', index: 'rack', sort: true },
    { title: '排序类型', index: 'rack_name', sort: true },
    { title: '状态', index: 'status_text', sort: true },
    { title: '供应商代码', index: 'supplier', sort: true },
    { title: '供应商名称', index: 'supplier_name', sort: true },

    { title: '排序卡号', index: 'sort_card', sort: true },
    { title: '包装类型', index: 'pack_type', sort: true },
    { title: '配送路线', index: 'route', sort: true },
    { title: '上线工位', index: 'online_uloc', sort: true },
    { title: 'Dock卸货区', index: 'dock', sort: true },

    { title: '车辆累积数量', index: 'backlog_vechile_qty', sort: true },
    { title: '累积时间(分)', index: 'backlog_time', sort: true },
    { title: '交货时间(分)', index: 'deliver_time', sort: true },
    { title: '顺序', index: 'seq_text', sort: true },
    { title: '卸货时间(分)', index: 'unloading_time', sort: true },
    { title: '零件累积数量', index: 'backlog_part_qty', sort: true },
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
    this.capi.getActions('JISManagement/RackList.aspx').subscribe((res: any) => {
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
      .post('/jis/postRackPager', this.q)
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
        this.q.sort.order = e.sort.value;        this.getData();
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
      .post('/jis/postRackPager', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.st.export(res.data.rows, {
              callback: this.cfun.callbackOfExport,
              filename: 'rack.xlsx',
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
    this.model.create(JisRackEditComponent, { record: { add: true } }, { size: 'xl' }).subscribe(res => {
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
          this.http.post('/jis/postDeleteRack', this.selectedRows).subscribe((res: any) => {
            if (res.successful) {
              this.msg.success('删除成功');
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
    this.xlsx.import(file).then(res1 => {
      this.fileList = [];
      this.http
        .post('/jis/ImportData', res1)
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
    });
  }
}
