import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STComponent, STPage, STChange } from '@delon/abc';
import { SFSchema } from '@delon/form';
import { ExportService } from "@core";
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { tap } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-area-plant',
  templateUrl: './plant.component.html',
})
export class AreaPlantComponent implements OnInit {
  constructor(private http: _HttpClient,
    public msg: NzMessageService,
    private modalSrv: NzModalService,
    private exportService: ExportService) { }

  loading = false;
  plant: any = {};
  data: [] = [];
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

  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '工厂编号', index: 'plant_code' },
    { title: '工厂名称', index: 'plant_name' },
    {
      title: '',
      buttons: [
        // { text: '查看', click: (item: any) => `/form/${item.id}` },
        // { text: '编辑', type: 'static', component: FormEditComponent, click: 'reload' },
      ]
    }
  ];

  ngOnInit() {
    this.getData();
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
  export() {
    /*this.http.get('/area/getPlantExport', null, { responseType: 'blob' }).subscribe((res: any) => {
      const file = new File([res], "mm.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const objUrl = URL.createObjectURL(file);
      window.open(objUrl);
      URL.revokeObjectURL(objUrl);
    });*/
    this.exportService.export('/area/getPlantExport', null, 'plant-list');
  }
  stChange(e: STChange) {
    switch (e.type) {
      case 'checkbox':
        // this.selectedRows = e.checkbox!;
        // this.cdr.detectChanges();

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
  add(tpl: TemplateRef<{}>) {
    this.modalSrv.create({
      nzTitle: '新建规则',
      nzContent: tpl,
      nzOnOk: () => {
        this.loading = true;
        this.http.post('/area/postPlant', this.plant).subscribe(() => this.getData());
      },
    });
  }

}
