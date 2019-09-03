import { Component, OnInit, ViewChild, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange } from '@delon/abc';
import { SFSchema } from '@delon/form';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { tap } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { CacheService } from '@delon/cache';
import { DdDetailComponent } from '../detail/detail.component';
import { PageInfo, SortInfo } from 'src/app/model';

@Component({
  selector: 'app-dd-sheetlist',
  templateUrl: './sheetlist.component.html',
})
export class DdSheetlistComponent implements OnInit {
  actionPath = 'DDManagement/RunSheetList.aspx';
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    plant: '',
    workshop: '',
    publish_time: '',
  };
  form_query: FormGroup;
  size = 'small';
  nzmd = '8';
  nzsm = '24';
  data: any[] = [];
  dataAction: any[] = [];
  dataCDRunSheetType: any[] = [];
  dataCDSheetStatus: any[] = [];
  dataPrints: any[] = [];
  pre_lists = [];
  sub_workshops = [];
  loading = false;
  @ViewChild('st', { static: true })
  st: STComponent;
  columns: STColumn[] = [
    { title: '', index: 'runsheet_id', type: 'checkbox' },
    {
      title: '操作',
      buttons: [
        {
          text: '查看',
          type: 'modal',
          component: DdDetailComponent,
          click: (_record, modal) => { },
        },
      ],
    },
    { title: '工厂', index: 'plant', sort: true },
    { title: '车间', index: 'workshop', sort: true },
    {
      title: '单号',
      index: 'runsheet_code',
      sort: true,
    },
    {
      title: '发布时间',
      index: 'publish_time',
      sort: true,
    },
    { title: '供应商名称', index: 'supplier_name', sort: true },
  ];
  selectedRows: STData[] = [];
  expandForm = false;
  pages: STPage = {
    total: '', // 分页显示多少条数据，字符串型
    show: true, // 显示分页
    front: false, // 关闭前端分页，true是前端分页，false后端控制分页
    showSize: true,
    pageSizes: [10, 30, 50, 100],
  };
  url = `/user`;
  searchSchema: SFSchema = {
    properties: {
      no: {
        type: 'string',
        title: '编号',
      },
    },
  };
  description: any;

  constructor(
    private http: _HttpClient,
    private srv: CacheService,
    public msg: NzMessageService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.http.get('/system/getplants').subscribe(
      (res: any) => {
        this.loading = false;
        if (res.successful) {
          this.pre_lists = res.data;
          this.sub_workshops = res.data[0].children;
          // this.q.plant=res.data[0].value;
          // this.q.workshop=this.sub_workshops[0].value;
        } else {
          this.msg.error(res.message);
          this.loading = false;
        }
      },
      (err: any) => this.msg.error('系统异常'),
    );

    this.http.get('/Area/GetCodeDetail?codeName=dd_plansheet_type&orderName=').subscribe(res => {
      this.dataCDRunSheetType = res.data;
    });
    this.http.get('/Area/GetCodeDetail?codeName=dd_plansheet_status&orderName=').subscribe(res => {
      this.dataCDSheetStatus = res.data;
    });

    this.http.get('/System/GetActions?actionPath=' + this.actionPath).subscribe(res => {
      this.dataAction = res.data;
    });
  }

  getData() {
    this.loading = true;
    if (this.q.workshop === '' || this.q.workshop === undefined) {
      this.q.workshop = '';
      this.sub_workshops.forEach(p => {
        this.q.workshop += p.value + ',';
      });
    } else this.q.workshop = this.q.workshop.toString();
    if (this.q.publish_time !== '' && this.q.publish_time !== undefined && this.q.publish_time.length > 0) {
      for (let j = 0, len = this.q.publish_time.length; j < len; j++) {
        this.q.publish_time[j] = this.q.publish_time[j].toLocaleDateString();
        // this.q.publish_time[j]=this.q.publish_time[j].toLocaleString();
      }
    }

    this.http
      .post('/dd/GetRunsheetPager', this.q)
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
        break;
      case 'Export':
        this.export();
        break;
      case 'ManualClose':
        // 手工关单
        this.manualClose();
        break;
      case 'HideOrExpand':
        this.hideOrExpand();
        break;
      case 'StopRefresh':
        // 开始/暂停刷新
        break;
      case 'Print':
        this.print();
        break;
    }
  }

  reset() {
    // wait form reset updated finished
    setTimeout(() => { });
    // setTimeout(() => this.getData());
  }

  search() {
    this.getData();
  }

  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshops = l.children;
    this.q.workshop.setValue(l.children[0].value);
  }

  print() {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择要打印的记录');
      return false;
    } else {
      this.loading = true;
      this.http
        .post('/dd/RunsheetPrint', this.selectedRows)
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

  hideOrExpand() {
    this.expandForm = !this.expandForm;
  }

  manualClose() {
    let msg = '';
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要关单的记录！');
      return false;
    } else {
      this.loading = true;

      let str_runsheet_code = '';
      let str_runsheet_ids = '';
      for (let j = 0, len = this.selectedRows.length; j < len; j++) {
        if (this.selectedRows[j].runsheet_code === '6') {
          str_runsheet_code += this.selectedRows[j].runsheet_code + ',';
        } else {
          str_runsheet_ids += this.selectedRows[j].runsheet_id + ',';
        }
      }
      if (str_runsheet_code !== '') msg = '单号【' + str_runsheet_code + '】的类型不允许手工关单';

      if (str_runsheet_ids !== '')
        this.http
          .post('/dd/ManualClose', str_runsheet_ids)
          .pipe(tap(() => (this.loading = false)))
          .subscribe(
            res => {
              if (res.successful) {
                this.msg.success(res.data.msg);
              } else {
                this.msg.error(res.message);
              }
            },
            (err: any) => this.msg.error('系统异常'),
          );
    }
    this.st.clearCheck();
  }

  export() {
    if (this.st.total === 0) {
      this.msg.error('请输入条件，查询出数据方可导出数据！');
      return false;
    }

    this.q.page.export = true;
    this.http
      .get('/dd/GetRunsheetPager', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.st.export(res.data.rows, { callback: this.d_callback, filename: 'result.xlsx', sheetname: 'sheet1' });
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );

    this.q.page.export = false;
  }
  d_callback(e: any) {
    // debugger;
    for (let j = 65, len = 65 + 26; j < len; j++) {
      // tslint:disable-next-line: no-eval
      const tmpTitle = eval('e.Sheets.sheet1.' + String.fromCharCode(j) + '1');
      if (tmpTitle === undefined) break;
      tmpTitle.v = tmpTitle.v.text;
    }
  }
}
