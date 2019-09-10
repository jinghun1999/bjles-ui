import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange } from '@delon/abc';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { PageInfo, SortInfo } from 'src/app/model';
import { tap } from 'rxjs/operators';
import { CommonApiService } from '@core';
import { AreaLocationEditComponent } from './edit/edit.component';

@Component({
  selector: 'app-area-location',
  templateUrl: './location.component.html',
})
export class AreaLocationComponent implements OnInit {
  constructor(private http: _HttpClient,
    public msg: NzMessageService,
    private modalSrv: NzModalService,
    private model: ModalHelper,
    private capi: CommonApiService, ) { }
  loading = false;
  plant = [];
  data: [] = [];
  actions = [];
  selectedRows: STData[] = [];
  showSearch = true;
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    plant: '',
    workshop: '',
  }
  pages: STPage = {
    total: '', // 分页显示多少条数据，字符串型
    show: true, // 显示分页
    front: false, // 关闭前端分页，true是前端分页，false后端控制分页
    showSize: true,
    pageSizes: [10, 30, 50, 100],
  };

  @ViewChild('st', { static: true }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: 'route', type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '修改',
          icon: 'edit',
          type: 'modal',
          modal: {
            component: AreaLocationEditComponent,
          },
          click: (_record, modal) => {
            if (modal) {
              this.getData();
            }
          }
        },
      ],
      exported: false
    },
    { title: '工厂', index: 'plant', sort: true },
    { title: '车间', index: 'workshop', sort: true },
    { title: '位置编号', index: 'loc', sort: true },
    { title: '位置类型', index: 'loc_type_text', sort: true },
  ];

  ngOnInit() {
    this.capi.getPlant().subscribe((res: any) => { this.plant = res; });
    this.capi.getActions('AreaManagement/LocationList.aspx').subscribe((res: any) => { this.actions = res });
  }
  getData() {
    this.loading = true;
    this.http.post('/area/postLocationPager', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe((res: any) => {
        this.data = res.data.rows;
        this.st.total = res.data.total;
      });
  }
  stChange(e: STChange) {
    switch (e.type) {
      case 'checkbox':
        this.selectedRows = e.checkbox!;
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
      case 'Create':
        this.add();
        break;
      case 'Export':
        this.export();
        break;
      case 'Delete':
        this.delete();
        break;
      case 'Search':
        this.getData();
        break;
      case 'HideOrExpand':
        this.showSearch = !this.showSearch;
        break;
    }
  }

  export() {
    if (this.st.total === 0) {
      this.msg.error('请查询后再导出')
      return false;
    }

    this.q.page.export = true;
    this.http
      .post('/area/postLocationPager', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(res => {
        if (res.successful) {
          this.st.export(res.data.rows, { callback: this.d_callback, filename: 'workshop.xlsx', sheetname: 'sheet1' });
        } else {
          this.msg.error(res.message);
          this.loading = false;
        }
      }, (err: any) => this.msg.error('系统异常'));
    this.q.page.export = false;
  }
  d_callback(e: any) {
    for (let j = 65, len = 65 + 26; j < len; j++) {
      // tslint:disable-next-line: no-eval
      const tmpTitle = eval("e.Sheets.sheet1." + String.fromCharCode(j) + "1");
      if (tmpTitle === undefined)
        break;
      tmpTitle.v = tmpTitle.v.text;
    }
  }

  add() {
    this.model.create(AreaLocationEditComponent, { plant: null, workshop: null }, { size: 'md' }).subscribe((res) => {
      this.getData();
    });
  }

  delete() {
    if (this.selectedRows.length === 0) {
      this.msg.error('请先选择要操作的数据');
      return false;
    } else {
      this.modalSrv.confirm({
        nzTitle: '删除提示', nzContent: '删除后不可恢复，确认删除吗？', nzOkType: 'danger',
        nzOnOk: () => {
          this.http.post('/area/deleteLocation', this.selectedRows).subscribe((res: any) => {
            if (res.successful) {
              this.msg.success('删除成功');
              this.getData();
            }
          });
        },
      });
    }
  }
}
