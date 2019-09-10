import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { CommonApiService, CommonFunctionService } from '@core';
import { XlsxService, STComponent, STColumn, STData } from '@delon/abc';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-part-partlist-view',
  templateUrl: './view.component.html',
})
export class PartPartlistViewComponent implements OnInit {
  searchPath = '/Part/GetNoUsePartPage';
  record: any = {};
  i: any;
  loading: boolean;
  data: any[] = [];
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    {
      title: '',
      width: 60,
      buttons: [
        {
          text: '删除',
          type: 'del',
          click: (item: any) => this.delete(item.Plant, item.Workshop, item.Part_no),
        },
      ],
    },
    { width: 120, title: '零件号', index: 'Part_no', sort: true },
    { width: 80, title: '工厂', index: 'Plant', sort: true },
    { width: 80, title: '车间', index: 'Workshop', sort: true },
    { width: 120, title: '零件活动状态', index: 'part_state_name', sort: true },
    { width: 120, title: '拉动类型', index: 'part_type_name', sort: true },
    { width: 180, title: '零件中文名称', index: 'Part_cname', sort: true },
    { width: 180, title: '零件英文名称', index: 'Part_cname', sort: true },
  ];
  size = 'small';

  constructor(
    public http: _HttpClient,
    private modal: NzModalRef,
    public msg: NzMessageService,
    private cdr: ChangeDetectorRef,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
    private xlsx: XlsxService,
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  close() {
    this.modal.destroy();
  }

  delete(plant: any, workshop: any, part_no: any) {
    this.loading = true;

    this.http
      .get('/part/NoUsePartDelete?plant=' + plant + '&workshop=' + workshop + '&part_no=' + part_no)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.msg.success(res.data);
            this.st.reload();
            // this.cdr.detectChanges();
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );
  }

  getData() {
    this.loading = true;

    this.http
      .get(this.searchPath)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.data = res.data;
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
