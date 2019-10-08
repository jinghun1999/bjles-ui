import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService, ExpHttpService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-interface-importexport',
  templateUrl: './importexport.component.html',
})
export class InterfaceImportexportComponent implements OnInit {
  actionPath = 'LESInterface/LESImportExport.aspx';
  searchPath = '/interface/GetSelectData';

  expandForm = true;
  loading: boolean;

  today = new Date().toLocaleDateString();
  size = 'small';
  q: any = {
    tableName: '',
    start_end_time: [new Date(this.today + ' 00:00:00'), new Date(this.today + ' 23:59:59')],
  };

  data_import: any;
  dataAction: any[] = [];

  sub_tables = new ItemData();

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

    this.http
      .get(this.searchPath)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.sub_tables.data = res.data;
          } else {
            this.msg.error(res.message);
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );

    // toolBar
    this.capi.getActions(this.actionPath).subscribe((res: any) => {
      this.dataAction = res;
      this.loading = false;
    });
  }

  toolBarOnClick(e: any) {
    // tslint:disable-next-line:no-debugger
    // debugger;
    switch (e.action_name) {
      case 'Export':
        this.export();
        break;
      case 'HideOrExpand':
        this.hideOrExpand();
        break;
      case 'Import':
        this.import();
        break;
    }
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
      this.q.importData = res1;
      this.http
        .post('/interface/ImportCSV', this.q)
        .pipe(tap(() => (this.loading = false)))
        .subscribe(
          res => {
            if (res.successful) {
              // if (!res.data.result) {
              //   this.cfun.downErrorExcel(res.data.column, res.data.errDT, 'purchasing_error.xlsx');
              // }
              this.msg.success(res.data);
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
    if (this.q.tableName === '' || this.q.tableName === undefined || this.q.tableName === null) {
      this.msg.error('请选择导出项数据!');
      return;
    }

    this.http
      .post('/interface/ExportCSV', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            if (res.data.result) {
              this.cfun.downErrorExcel(res.data.column, res.data.DT, this.q.tableName + '.xlsx');
            }
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );

    this.q.page.export = false;
  }
}
