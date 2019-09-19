import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { SupplierWorkschedulelistEditComponent } from './edit/edit.component';
import { format } from 'date-fns';

@Component({
  selector: 'app-supplier-workschedulelist',
  templateUrl: './workschedulelist.component.html',
})
export class SupplierWorkschedulelistComponent implements OnInit {
  actionPath = 'SystemManagement/WorkScheduleList.aspx';
  searchPath = '/supplier/GetWorkSchedulePager';
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: ['work_schedule_sn'], type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '编辑',
          iif: (item, btn, column) => {
            return !(new Date(item.end_time) < new Date());
          },
          type: 'modal',
          click: 'reload',
          modal: {
            size: 'xl',
            component: SupplierWorkschedulelistEditComponent,
          },
        },
      ],
    },
    { title: '工厂', index: 'plant', sort: true },
    { title: '车间', index: 'workshop', sort: true },
    { title: '工作时间类型', index: 'work_schedule_type_name', sort: true },
    { title: '工作日', index: 'work_date', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
    { title: '班次', index: 'shift_name', sort: true },
    { title: '开始时间', index: 'start_time', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
    { title: '结束时间', index: 'end_time', sort: true, type: 'date', dateFormat: `YYYY-MM-DD HH:mm` },
  ];
  selectedRows: STData[] = [];
  pages: STPage = new PagerConfig();
  expandForm = true;
  loading: boolean;

  size = 'small';
  today = new Date().toLocaleDateString();
  currentStartDate = new Date(this.today + ' 00:00:00');
  currentEndDate = new Date(this.today + ' 23:59:59');
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    plant: '',
    workshop: [],
    start_end_time: [this.currentStartDate, this.currentEndDate],
  };
  data: any[] = [];
  dataAction: any[] = [];
  pre_lists = [];
  sub_workshops = [];
  sub_Shift = new ItemData();
  sub_Work_schedule_type = new ItemData();

  isVisible = false;
  update = [this.currentStartDate, this.currentEndDate.setFullYear(this.currentEndDate.getFullYear() + 1)];

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
      case 'Save':
        // 批量更新
        this.batchUpdate();
        break;
    }
  }
  batchUpdate() {
    if (this.selectedRows.length === 0) {
      this.msg.error('请选择要批量更新的记录');
      return false;
    }
    this.isVisible = true;
  }
  handleOk(): void {
    if (this.update.length === 2) {
      if (format(this.update[0], 'YYYY-MM-DD') === format(this.update[1], 'YYYY-MM-DD')) {
        this.update = this.cfun.getSelectDate(this.update);
        const pager: any = {
          pager: this.selectedRows,
          update: this.update,
        };
        this.http
          .post('/supplier/WorkScheduleBatchUpdate', pager)
          .pipe(tap(() => (this.loading = false)))
          .subscribe(
            res => {
              if (res.successful) {
                this.msg.success(res.data);
                this.isVisible = false;
              } else {
                this.msg.error(res.message);
                this.loading = false;
              }
            },
            (err: any) => this.msg.error('系统异常'),
          );
      } else {
        this.msg.error('开始时间和结束时间必须是同一天!');
      }
    } else {
      this.msg.error('请选择批量更新日期!');
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  hideOrExpand() {
    this.expandForm = !this.expandForm;
  }

  Create() {
    this.modal
      .create(SupplierWorkschedulelistEditComponent, { record: { add: true } }, { size: 'xl' })
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
    if (this.q.start_end_time !== undefined && this.q.start_end_time.length !== 2) {
      this.msg.error('开始结束时间错误!');
    } else this.q.start_end_time = this.cfun.getSelectDate(this.q.start_end_time);

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
