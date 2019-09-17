import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STPage, STChange, STData } from '@delon/abc';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { tap } from 'rxjs/operators';
import { AreaPlantEditComponent } from './edit/edit.component';
import { PageInfo, SortInfo, PagerConfig } from 'src/app/model';
import { CommonApiService } from '@core';

@Component({
  selector: 'app-area-plant',
  templateUrl: './plant.component.html',
})
export class AreaPlantComponent implements OnInit {
  constructor(
    private http: _HttpClient,
    public msg: NzMessageService,
    private modalSrv: NzModalService,
    private model: ModalHelper,
    private capi: CommonApiService,
  ) { }
  loading = false;
  plant: any = {};
  data: [] = [];
  actions = [];
  selectedRows: STData[] = [];
  showSearch = true;
  q: any = {
    page: new PageInfo(),
    sort: new SortInfo(),
    plant_code: '',
    plant_name: '',
  };
  pages: STPage = new PagerConfig();
  @ViewChild('st', { static: true }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: 'plant_code', type: 'checkbox', exported: false },
    {
      title: '操作',
      buttons: [
        {
          text: '修改',
          icon: 'edit',
          type: 'modal',
          modal: {
            component: AreaPlantEditComponent,
          },
          click: 'reload',
        },
      ],
      exported: false,
    },
    { title: '工厂编号', index: 'plant_code', sort: true },
    { title: '工厂名称', index: 'plant_name', sort: true },
  ];

  ngOnInit() {
    this.capi.getActions('AreaManagement/PlantList.aspx').subscribe((res: any) => {
      this.actions = res;
    });
  }
  getData() {
    this.loading = true;
    this.http
      .post('/area/postPlantPager', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(res => {
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
      this.msg.error('请查询后再导出');
      return false;
    }

    this.q.page.export = true;
    this.http
      .post('/area/postPlantPager', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.st.export(res.data.rows, { callback: this.d_callback, filename: 'plant.xlsx', sheetname: 'sheet1' });
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );

    this.q.page.export = false;
  }

  d_callback(e: any) { }

  add() {
    this.model.create(AreaPlantEditComponent, { record: { add: true } }, { size: 'md' }).subscribe(res => {
      this.getData();
    });
  }

  delete() {
    if (this.selectedRows.length === 0) {
      this.msg.error('请先选择要操作的数据');
      return false;
    } else {
      this.modalSrv.confirm({
        nzTitle: '删除提示',
        nzContent: '删除后不可恢复，确认删除吗？',
        nzOkType: 'danger',
        nzOnOk: () => {
          this.http.post('/area/deletePlant', this.selectedRows).subscribe((res: any) => {
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
