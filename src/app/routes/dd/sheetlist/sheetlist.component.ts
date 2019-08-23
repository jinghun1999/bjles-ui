import { Component, OnInit, ViewChild, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange } from '@delon/abc';
import { SFSchema } from '@delon/form';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { tap } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dd-sheetlist',
  templateUrl: './sheetlist.component.html',
})
export class DdSheetlistComponent implements OnInit {
  q: any = {
    pi: 1,
    ps: 10,
    plant:'',
    workshop:'',
    sorter: '',
  };
  form_query: FormGroup;
  size = 'small';
  data: any[] = [];
  dataCDRunSheetType: any[] = [];
  dataCDSheetStatus: any[] = [];
  pre_lists = [];
  sub_workshops = [];
  loading = false;
  @ViewChild('st', { static: true })
  st: STComponent;
  columns: STColumn[] = [
    { title: '', index: 'runsheet_id', type: 'checkbox' },
    { title: '工厂', index: 'plant' },
    { title: '车间', index: 'workshop' },
    {
      title: '单号',
      index: 'runsheet_code',
    },
    {
      title: '发布时间',
      index: 'publish_time',
    },
    {
      title: '操作',
      buttons: [
        {
          text: '配置',
          click: (item: any) => this.msg.success(`配置${item.no}`),
        },
        {
          text: '订阅警报',
          click: (item: any) => this.msg.success(`订阅警报${item.no}`),
        },
      ],
    },
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
        title: '编号'
      }
    }
  };
  description: any;


  constructor(
    private http: _HttpClient,
    public msg: NzMessageService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {

    this.http.get('/system/getplants').subscribe((res: any)=>{
      this.loading = false;
      if(res.successful){
        this.pre_lists = res.data;
        this.sub_workshops = res.data[0].children;
         this.q.plant.setValue(res.data[0].value);
         this.q.workshop.setValue(this.sub_workshops[0].value);
      }else{
        this.msg.error(res.message);
        this.loading = false;
      }
    }, (err: any) => this.msg.error('系统异常'));

    this.http.get('/Area/GetCodeDetail?codeName=dd_plansheet_type&orderName=').subscribe(res => {
      this.dataCDRunSheetType = res.data;
    });
    this.http.get('/Area/GetCodeDetail?codeName=dd_plansheet_status&orderName=').subscribe(res => {
      this.dataCDSheetStatus = res.data;
    });

  }

  getData() {
    this.loading = true;
    // this.q.statusList = this.status.filter(w => w.checked).map(item => item.index);
    // if (this.q.status !== null && this.q.status > -1) {
    //   this.q.statusList.push(this.q.status);
    // }
    // tslint:disable-next-line:prefer-conditional-expression
    if (this.q.workshop==='' || this.q.workshop===undefined)
    {
      this.q.workshop='';
      // for(let j = 0,len = this.sub_workshops.length; j < len; j++){
        // this.q.workshop+=value+",";
        // this.q.workshop+=this.sub_workshops[j].value+",";
      // }
      this.sub_workshops.forEach(p=>{
        this.q.workshop+=p.value+",";
      });
    }
    else
      this.q.workshop=this.q.workshop.toString();

    this.http
      .get('/dd/GetRunsheetPager', this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(res => {
        this.data = res.data.rows;
        this.st.total = res.data.total;
        this.cdr.detectChanges();
      });
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
        this.q.pi = e.pi;
        this.getData();
        this.msg.success('已经选择了另一个页码' + e.pi.toString());
        break;
      case 'ps':
        this.q.ps = e.ps;
        this.getData();
        break;
    }
  }

  remove() {
    this.http.delete('/rule', { nos: this.selectedRows.map(i => i.no).join(',') }).subscribe(() => {
      this.getData();
      this.st.clearCheck();
    });
  }

  approval() {
    this.msg.success(`审批了 ${this.selectedRows.length} 笔`);
  }

  add(tpl: TemplateRef<{}>) {
    this.modalSrv.create({
      nzTitle: '新建规则',
      nzContent: tpl,
      nzOnOk: () => {
        this.loading = true;
        this.http.post('/rule', { description: this.description }).subscribe(() => this.getData());
      },
    });
  }

  reset() {
    // wait form reset updated finished
    setTimeout(() => this.getData());
  }

  6(value: string): void {
    const l = this.pre_lists.find(p=>p.value === value);
    this.sub_workshops = l.children;
    this.q.workshop.setValue(l.children[0].value);
  }

}
