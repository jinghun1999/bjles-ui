import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STComponent } from '@delon/abc';
import { SFSchema } from '@delon/form';

import { NzMessageService, NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-loc-plant',
  templateUrl: './plant.component.html',
})
export class LocPlantComponent implements OnInit {
  url = `/user`;
  loading = false;
  searchSchema: SFSchema = {
    properties: {
      no: {
        type: 'string',
        title: '编号'
      }
    }
  };
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '编号', index: 'no' },
    { title: '调用次数', type: 'number', index: 'callNo' },
    { title: '头像', type: 'img', width: '50px', index: 'avatar' },
    { title: '时间', type: 'date', index: 'updatedAt' },
    {
      title: '',
      buttons: [
        // { text: '查看', click: (item: any) => `/form/${item.id}` },
        // { text: '编辑', type: 'static', component: FormEditComponent, click: 'reload' },
      ]
    }
  ];

  constructor(private http: _HttpClient,
    public msg: NzMessageService,
    private modalSrv: NzModalService, ) { }

  ngOnInit() { }

  add(tpl: TemplateRef<{}>) {
    this.modalSrv.create({
      nzTitle: '新建规则',
      nzContent: tpl,
      nzOnOk: () => {
        this.loading = true;
        // this.http.post('/loc/', { description: this.description }).subscribe(() => this.getData());
      },
    });
  }

}
