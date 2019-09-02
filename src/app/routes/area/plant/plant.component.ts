import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STPage, STChange, STData } from '@delon/abc';
import { SFSchema } from '@delon/form';
import { ExportService } from "@core";
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { tap } from 'rxjs/operators';
// import { HttpHeaders } from '@angular/common/http';
import { AreaPlantEditComponent } from './edit/edit.component';

@Component({
  selector: 'app-area-plant',
  templateUrl: './plant.component.html',
})
export class AreaPlantComponent implements OnInit {
  constructor(private http: _HttpClient,
    public msg: NzMessageService,
    private modalSrv: NzModalService,
    private model: ModalHelper,
    private exportService: ExportService) { }
  actionPath = 'AreaManagement/PlantList.aspx';
  loading = false;
  plant: any = {};
  data: [] = [];
  dataAction = [];
  selectedRows: STData[] = [];
  q: any = {
    pi: 1,
    ps: 10,
    plant_code: '',
    plant_name: '',
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
    { title: '', index: 'runsheet_id', type: 'checkbox' },
    {
      title: '',
      buttons: [
        {
          text: '修改',
          icon: 'edit',
          type: 'modal',
          modal: {
            component: AreaPlantEditComponent,
          },
          click: (_record, modal) => {

          }
        },
      ]
    },
    { title: '工厂编号', index: 'plant_code' },
    { title: '工厂名称', index: 'plant_name' },
  ];

  ngOnInit() {
    this.http.get('/System/GetActions?actionPath=' + this.actionPath).subscribe(res => {
      this.dataAction = res.data;
    });
  }
  getData() {
    this.loading = true;
    this.http.get('/area/getPlantPager', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(res => {
        this.data = res.data.rows;
        this.st.total = res.data.total;
        // this.cdr.detectChanges();
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
        this.q.pi = e.pi;
        this.getData();
        // this.msg.success('已经选择了另一个页码' + e.pi.toString());
        break;
      case 'ps':
        this.q.ps = e.ps;
        this.getData();
        break;
      case 'sort':
        this.q.sort = e.sort.column;

        break;
    }
  }

  toolBarOnClick(e: any) {
    switch (e.action_name) {
      case 'Export':
        this.export();
        break;
      case 'Delete':
        // 手工关单
        this.delete();
        break;
      case 'Search':
        this.getData();
        break;
    }
  }

  export() {
    /*this.http.get('/area/getPlantExport', null, { responseType: 'blob' }).subscribe((res: any) => {
      const file = new File([res], "mm.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const objUrl = URL.createObjectURL(file);
      window.open(objUrl);
      URL.revokeObjectURL(objUrl);
    });*/
    // this.exportService.export('/area/getPlantExport', this.q, 'plant-list');
    if (this.st.total === 0) {
      this.msg.error('请输入条件，查询出数据方可导出数据！')
      return false;
    }

    this.q.export = true;
    this.http
      .get('/dd/getPlantPager', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(res => {
        if (res.successful) {
          this.st.export(res.data.rows, { callback: this.d_callback, filename: 'result.xlsx', sheetname: 'sheet1' });
        } else {
          this.msg.error(res.message);
          this.loading = false;
        }
      }, (err: any) => this.msg.error('系统异常'));

    this.q.export = false;
  }
  d_callback(e: any) {
    // debugger;
    for (let j = 65, len = 65 + 26; j < len; j++) {
      // tslint:disable-next-line: no-eval
      const tmpTitle = eval("e.Sheets.sheet1." + String.fromCharCode(j) + "1");
      if (tmpTitle === undefined)
        break;
      tmpTitle.v = tmpTitle.v.text;
    }
  }


  add(tpl: TemplateRef<{}>) {
    this.model.create(AreaPlantEditComponent, { plant_code: null, plant_name: null }, { size: 'md' }).subscribe((res) => {
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
