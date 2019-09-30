import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange } from '@delon/abc';
import { CommonFunctionService, CommonApiService } from '@core';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { from } from 'rxjs';
import { Form } from '@angular/forms';

@Component({
  selector: 'app-system-codelist-detail',
  templateUrl: './detail.component.html',
})
export class SystemCodelistDetailComponent implements OnInit {
  record: any = {};
  record_add: any = { add: true };

  actionPath = 'SystemManagement/CodeDetailList.aspx';
  searchPath = '/system/GetCodeDetailPager';
  @ViewChild('st', { static: false }) st: STComponent;
  @ViewChild('f', { static: false }) f: Form;

  columns: STColumn[] = [
    { title: '', index: ['code_name', 'code_value'], type: 'checkbox', exported: false },
    { title: '代码值', index: 'code_value', sort: true },
    { title: '代码名称', index: 'code_name', sort: true },
    { title: '中文描述', render: 'cn_desc' },
    { title: '英文描述', render: 'en_desc' },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig();
  expandForm = true;
  loading: boolean;
  isVisible = false;

  size = 'small';
  data: any[] = [];
  dataAction: any[] = [];
  sub_isdefault = new ItemData();

  constructor(
    private http: _HttpClient,
    private modal1: NzModalRef,
    public msg: NzMessageService,
    private cdr: ChangeDetectorRef,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
  ) {}

  ngOnInit() {
    this.loading = true;

    // toolBar
    this.capi.getActions(this.actionPath).subscribe((res: any) => {
      if (this.record.add === true) res = res.filter(p => p.action_name === 'Save');
      this.dataAction = res;
    });

    this.loading = false;
    this.record.page = new PageInfo();
    this.record.sort = new SortInfo();

    this.search();
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
      case 'Create':
        this.Create();
        break;
      case 'Delete':
        this.Delete();
        break;
      case 'Save':
        this.save();
        break;
    }
  }

  save() {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要保存的记录！');
      return;
    }

    this.loading = true;
    this.http.post('/system/CodeDetailSave', this.selectedRows).subscribe(
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

  Delete(): void {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择需要删除的记录！');
      return;
    } else {
      this.loading = true;

      this.http
        .post('/System/CodeDetailDelete', this.selectedRows)
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
    this.isVisible = true;
  }

  handleOk(): void {
    this.record_add.code_name = this.record.code_name;
    this.http
      .post('/system/CodeDetailSave', [this.record_add])
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.msg.success(res.data);
            this.isVisible = false;
            this.st.reload();
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );
  }

  handleCancel(): void {
    this.isVisible = false;
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
