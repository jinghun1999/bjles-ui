import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange } from '@delon/abc';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { tap } from 'rxjs/operators';
import { CacheService } from '@delon/cache';
import { CommonApiService, CommonFunctionService } from '@core';
@Component({
  selector: 'app-dd-kanbanscanlist',
  templateUrl: './kanbanscanlist.component.html',
})
export class DdKanbanscanlistComponent implements OnInit {

  actionPath = 'DDManagement/DDScanKanBan.aspx';
  kbScan12 = '/dd/GetkbScan12';
  kbScan10 = '/dd/GetkbScan10';
  key_plant = 'kb_plant';
  key_workshop = 'kb_workshop';

  q: any = {
    plant: '',
    workshop: '',
  };
  size = 'small';

  data: any[] = [];
  dataSum: any[] = [];
  dataError: any[] = [];
  dataRepeat: any[] = [];


  dataAction: any[] = [];
  dataAction_s: any[] = [];
  dataAction_Sum = [
    { action_name: 'UpdateTime', action_name_cn: '确定' },
    { action_name: 'ReturnViewSum', action_name_cn: '返回' }
  ];

  pre_lists = [];
  sub_workshops = [];


  loading = false;
  @ViewChild('st_Scan', { static: false })
  st_Scan: STComponent;
  @ViewChild('st_Sum', { static: false })
  st_Sum: STComponent;

  columns: STColumn[] = [
    { title: '', index: 'Scan_CardCode', type: 'checkbox', exported: false },
    {
      title: '卡号', index: 'card_code', sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.card_code, b.card_code);
        },
      },
    },
    {
      title: '零件号', index: 'part_code', sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.part_code, b.part_code);
        },
      },
    },
    {
      title: '零件中文名称', index: 'part_name', sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.part_name, b.part_name);
        },
      },
    },
    {
      title: '配送路线代码', index: 'route_code', sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.route_code, b.route_code);
        },
      },
    },
    {
      title: 'Dock编号', index: 'dock_code', sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.dock_code, b.dock_code);
        },
      },
    },
    {
      title: '工位编号', index: 'uloc', sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.uloc, b.uloc);
        },
      },
    },
    {
      title: '接口数据输入时间', index: 'create_time', type: 'date',
      dateFormat: `YYYY-MM-DD HH:mm`, sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.create_time, b.create_time);
        },
      },
    },
  ];

  columns_sum: STColumn[] = [
    {
      title: '供应商代码', index: 'supplier_code', sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.supplier_code, b.supplier_code);
        },
      },
    },
    {
      title: '供应商名称', index: 'supplier_name', sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.supplier_name, b.supplier_name);
        },
      },
    },
    {
      title: '配送路线代码', index: 'route_code', sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.route_code, b.route_code);
        },
      },
    },
    {
      title: 'Dock编号', index: 'dock_code', sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.dock_code, b.dock_code);
        },
      },
    },
    {
      title: '需求箱数', index: 'pack_count', sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.pack_count, b.pack_count);
        },
      },
    },
    {
      title: '预期到货时间', index: 'expected_arrival_time', sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.expected_arrival_time, b.expected_arrival_time);
        },
      }, type: 'date',
    },
  ];

  selectedRows: STData[] = [];
  expandForm = true;

  expand_Scan = true;
  expand_Sum = false;

  constructor(
    private http: _HttpClient,
    private srv: CacheService,
    private msg: NzMessageService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
    private cache: CacheService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.q.plant = this.cache.getNone(this.key_plant);
    this.q.workshop = this.cache.getNone(this.key_workshop);


    this.capi.getPlantOfDiff('', '', '0').subscribe(
      (res: any) => {
        this.pre_lists = res;
        if (this.pre_lists.length > 0) {
          this.sub_workshops = this.pre_lists[0].children;
          if (this.q.plant === null)
            this.q.plant = this.pre_lists[0].value;
          this.plantChange(this.q.plant);
        }
      },
      (err: any) => this.msg.error('获取不到工厂车间信息！！'),
    );

    // toolBar
    this.capi.getActions(this.actionPath).subscribe((res: any) => {
      this.dataAction = res;
      this.dataAction_s = res;
    });

    this.loading = false;
    this.setFocus();
  }
  setCache() {
    const plant = this.cache.getNone(this.key_plant);
    const workshop = this.cache.getNone(this.key_workshop);
    if (plant !== this.q.plant)
      this.cache.set(this.key_plant, this.q.plant);
    if (workshop !== this.q.workshop)
      this.cache.set(this.key_workshop, this.q.workshop);
  }
  EndScan() {
    if (this.data.length <= 0) {
      this.msg.error('请先扫描数据！');
      return;
    }
    this.expand_Scan = false;
    this.expand_Sum = true;

    this.dataAction = this.dataAction_Sum;
    this.GetKanBanScanExpectArrivalTimeList();
  }

  ReturnViewSum() {
    this.expand_Scan = true;
    this.expand_Sum = false;

    this.dataAction = this.dataAction_s;
    this.setFocus();
  }
  UpdateTime() {
    this.loading = true;
    this.http
      .post('/dd/SubmitScanGroupKanBan', this.data)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.msg.success(res.data);
            this.initData();
          } else {
            this.msg.error(res.message);
          }
          this.loading = false;
          this.setFocus();
        },
        (err: any) => this.msg.error('系统异常'),
      );
  }
  initData() {
    this.expand_Scan = true;
    this.expand_Sum = false;

    this.dataRepeat.splice(0, this.dataError.length);
    this.dataError.splice(0, this.dataError.length);
    this.data.splice(0, this.data.length);
    this.dataSum.splice(0, this.dataSum.length);

    this.dataAction = this.dataAction_s;

    this.st_Scan.reload();
    this.st_Sum.reload();
  }

  Delete() {
    if (this.selectedRows.length === 0)
      this.msg.error("请选择要删除的记录!");
    this.selectedRows.forEach(p => {
      // this.data = this.data.filter(p1 => p1.Scan_CardCode !== p.Scan_CardCode);
      this.st_Scan.removeRow(p);
    });
    // this.st_Scan.reload();
    this.data = this.st_Scan._data;
    this.setFocus();
  }
  isExist(e: any): boolean {
    const isExist = this.data.find(p1 => p1.Scan_CardCode === e);
    let res = false;
    if (isExist !== undefined && isExist !== null) {
      this.msg.error("同一批次扫描的看板卡不允许重复");
      this.dataRepeat.push(e);
      res = true;
    }
    return res;
  }


  Scan(url: any) {

    if (url === this.kbScan12) {
      if (this.isExist(this.q.KBCode12))
        return;
    }

    this.loading = true;
    this.http
      .post(url, this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            if (res.data.result) {
              this.addData(res.data.rows);
            }
            else {
              this.msg.error(res.data.message);
              res.data.rows.forEach(p => {
                this.dataError.push({ ScanNo: p })
              });
            }
            this.st_Scan.reload();
            // this.cdr.detectChanges();
          } else {
            this.msg.error(res.message);
          }
          if (url === this.kbScan10)
            this.q.KBCode10 = '';
          else
            this.q.KBCode12 = '';
          this.loading = false;
        },
        (err: any) => this.msg.error('系统异常'),
      );
  }
  addData(e: any[]): boolean {
    const res = false;
    e.forEach(p => {
      if (!this.isExist(p.Scan_CardCode)) {
        this.data.push(p);
        this.setCache();
      }

    });
    this.setFocus();
    return res;
  }

  stChange(e: STChange) {
    switch (e.type) {
      case 'checkbox':
        this.selectedRows = e.checkbox!;
        this.cdr.detectChanges();
        break;
    }
  }

  toolBarOnClick(e: any) {
    // tslint:disable-next-line:no-debugger
    // debugger;
    switch (e.action_name) {
      case 'Search':
        this.search();
        // this.expandForm = false;
        break;
      case 'EndScan':
        this.EndScan();
        break;
      case 'Scan':
        this.Scan(this.kbScan12);
        break;
      case 'UpdateTime':
        this.UpdateTime();
        break;
      case 'ReturnViewSum':
        this.ReturnViewSum();
        break;
      case 'Delete':
        this.Delete();
        break;

    }
  }


  search() {
    // this.getData();
  }

  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshops = l.children;
    if (this.q.workshop === undefined || this.q.workshop.length === 0)
      this.q.workshop = this.sub_workshops[0].value;
  }

  kb12_keyup(e: any) {
    if (e.keyCode === 13 && this.isValid(12)) {
      this.Scan(this.kbScan12);
    }
  }
  kb10_keyup(e: any) {
    if (e.keyCode === 13 && this.isValid(10)) {
      this.Scan(this.kbScan10);
    }
  }

  isValid(e: any): boolean {
    let msg = '';
    if (this.q.plant === undefined || this.q.plant.length === 0)
      msg = "工厂";
    if (this.q.workshop === undefined || this.q.workshop.length === 0)
      msg += (msg === '' ? '' : ',') + "车间";
    if (msg !== '') msg = "请选择" + msg;
    if ((e === 10 && this.q.KBCode10.length !== e) || (e === 12 && this.q.KBCode12.length !== e))
      msg += (msg === '' ? '' : ',') + `请输入${e}位看板卡号`;

    if (msg !== '') {
      this.msg.error(msg);
      return false;
    }
    else
      return true;

  }

  GetKanBanScanExpectArrivalTimeList() {
    this.loading = true;
    this.http
      .post('/dd/GetKanBanScanExpectArrivalTimeList', this.data)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.dataSum = res.data.sums;
            this.data = res.data.mains;
          } else {
            this.msg.error(res.message);
          }
          this.loading = false;
        },
        (err: any) => this.msg.error('系统异常'),
      );
  }
  setFocus() {
    document.getElementById('kb12').focus();
  }
}
