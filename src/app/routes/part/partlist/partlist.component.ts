import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { PartPartlistEditComponent } from './edit/edit.component';
import { CommonFunctionService, CommonApiService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-part-partlist',
  templateUrl: './partlist.component.html',
})
export class PartPartlistComponent implements OnInit {
  actionPath = 'PartManagement/PartList.aspx';
  searchPath = '/part/GetPartPager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: ['plant', 'workshop', 'part_no'], type: 'checkbox', width: 50, exported: false },
    {
      title: '操作',
      width: 60,
      buttons: [
        {
          text: '查看',
          type: 'modal',
          modal: {
            size: 'xl',
            component: PartPartlistEditComponent,
          },
        },
      ],
    },
    { width: 80, title: '工厂', index: 'plant', sort: true },
    { width: 80, title: '车间', index: 'workshop', sort: true },
    { width: 120, title: '零件号', index: 'part_no', sort: true },
    { width: 180, title: '零件名称', index: 'part_cname', sort: true },
    { width: 120, title: '拉动类型', index: 'part_type_name', sort: true },
    { width: 120, title: '零件活动状态', index: 'part_state_name', sort: true },
    { width: 120, title: '是否是直供件', index: 'is_direct_name', sort: true },
    { width: 100, title: '包装类型', index: 'store_packing', sort: true },
    { width: 100, title: '包装数量', index: 'packing_qty', sort: true },
    { width: 180, title: '车型', index: 'car_model', sort: true },
    { width: 100, title: '包装长(mm)', index: 'x', sort: true },
    { width: 100, title: '包装宽(mm)', index: 'y', sort: true },
    { width: 100, title: '包装高(mm)', index: 'z', sort: true },
    { width: 100, title: '旧零件号', index: 'oldpart_no', sort: true },
    { width: 100, title: '删除标识', index: 'part_flag', sort: true },
  ];
  selectedRows: STData[] = [];
  pages: STPage = {
    total: '', // 分页显示多少条数据，字符串型
    show: true, // 显示分页
    front: false, // 关闭前端分页，true是前端分页，false后端控制分页
    showSize: true,
    pageSizes: [10, 30, 50, 100],
  };
  scroll = { x: '2000px', y: '380px' };
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
  data_import: any;
  dataAction: any[] = [];
  pre_lists = [];
  sub_workshops = [];
  sub_part_type = new ItemData();
  sub_ver_record = new ItemData();
  sub_part_state = new ItemData();

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
        this.q.sort.field = e.sort.column.indexKey;
        this.q.sort.order = e.sort.value;
        this.getData();
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
        this.search();
        break;
    }
  }

  hideOrExpand() {
    this.expandForm = !this.expandForm;
  }

  import() {
    const file1 = document.getElementById('import') as HTMLInputElement;
    const file = file1.files[0];
    this.loading = true;
    this.xlsx.import(file).then(res1 => {
      // EXCEL文件之中文字段改为英文字段
      // for (let j = 0, len = res1.sheet1[0].length; j < len; j++) {
      //   res1.sheet1[0][j] = this.columns.find(p => p.title === res1.sheet1[0][j]).index;
      // }
      this.http
        .post('/part/ImportData', res1)
        .pipe(tap(() => (this.loading = false)))
        .subscribe(
          res => {
            this.msg.success(res.data);
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