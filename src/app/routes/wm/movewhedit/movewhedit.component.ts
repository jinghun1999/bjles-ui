import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData, PagerConfig, PageInfo, SortInfo } from 'src/app/model';
import { CommonApiService, CommonFunctionService, ENUMSheetType } from '@core';
import { STData, STPage, STComponent, STColumn, STChange } from '@delon/abc';

@Component({
  selector: 'app-wm-movewhedit',
  templateUrl: './movewhedit.component.html',
})
export class WmMovewheditComponent implements OnInit {
  record: any;
  // actionPath = 'Warehouse/wmtrantypeedit.aspx';

  selectedRows_s: STData[] = [];

  expandForm = true;
  data_s: any[] = [];
  data_s_filter: any[] = [];
  data_t: any[] = [];

  editId: string | null;
  listOfDisplayData: any[] = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  numberOfChecked = 0;

  q_s: any = {
    part_no: '',
  };

  @ViewChild('st', { static: true }) st: STComponent;
  columns_s: STColumn[] = [
    {
      title: '',
      index: ['idx'],
      type: 'checkbox',
      exported: false,
    },
    { title: '序号', type: 'no' },
    {
      title: '零件号',
      index: 'part_no',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.part_no, b.part_no);
        },
      },
    },
    {
      title: '零件名称',
      index: 'part_cname',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.part_cname, b.part_cname);
        },
      },
    },
    {
      title: '供应商',
      index: 'SupplierId',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.SupplierId, b.SupplierId);
        },
      },
    },
    {
      title: '可用箱数',
      index: 'current_storage',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.current_storage, b.current_storage);
        },
      },
    },
    {
      title: '标准包装数',
      index: 'packing_qty',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.packing_qty, b.packing_qty);
        },
      },
    },
    {
      title: '可用散件数',
      index: 'current_fragpart_count',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.current_fragpart_count, b.current_fragpart_count);
        },
      },
    },
    {
      title: '可用总件数',
      index: 'current_parts',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.current_parts, b.current_parts);
        },
      },
    },
    {
      title: '单位',
      index: 'Unit',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.Unit, b.Unit);
        },
      },
    },
    {
      title: '源库位',
      index: 'RdcDloc',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.RdcDloc, b.RdcDloc);
        },
      },
    },
    {
      title: '目的库位',
      index: 'Dloc',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.Dloc, b.Dloc);
        },
      },
    },
  ];

  size = 'small';
  pre_lists = [];
  sub_workshops = [];

  // dataAction: any[] = [];

  loading = false;
  title = '';

  constructor(
    private modal: NzModalRef,
    private msg: NzMessageService,
    public http: _HttpClient,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // tslint:disable-next-line: prefer-conditional-expression
    if (this.record.add === true) {
      this.title = '添加';
    } else {
      this.title = '编辑';
      this.record.add = false;
    }
    const type = '';
    let due = '0';
    if (this.record.diff) {
      due = '';
    }

    this.capi.getPlantOfDiff('', type, due).subscribe(
      (res: any) => {
        this.pre_lists = res;
        if (this.pre_lists.length > 0) {
          this.sub_workshops = this.pre_lists[0].children;
          if (this.record.add === true && (this.record.PlantID === null || this.record.PlantID === undefined))
            this.record.PlantID = this.pre_lists[0].value;
          this.plantChange(this.record.PlantID);
        }
      },
      (err: any) => this.msg.error('获取不到工厂车间信息！！'),
    );

    // // toolBar
    // this.capi.getActions(this.actionPath).subscribe((res: any) => {
    //   this.dataAction = res;
    // });

    this.initCodeDetail();
  }

  save() {
    this.loading = true;
    // this.record.workday = this.cfun.getDate(this.record.workday);
    const removes = this.data_s.filter(p => p.Id > 0 && p.direction === 'left');

    this.http.post('/wm/MoveWHSave', { main: this.record, detail: this.data_t, removes }).subscribe(
      (res: any) => {
        if (res.successful) {
          this.msg.success(res.data);
          this.loading = false;
          this.modal.close(true);
        } else {
          this.msg.error(res.message);
          this.loading = false;
        }
      },
      (err: any) => this.msg.error('保存失败!'),
    );
  }

  close() {
    this.modal.destroy();
  }
  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshops = l.children;

    this.GetSupplierPartsOfZJ();
  }

  workshopChange(value: string): void {
    this.GetSupplierPartsOfZJ();
  }
  GetSupplierPartsOfZJ() {
    const plant = this.record.PlantID;
    const sourceWH = this.record.SourceWH;
    const targetWH = this.record.TargetWH;
    const Id = this.record.Id;
    if (sourceWH === undefined || sourceWH.length === 0 || targetWH === undefined || targetWH.length === 0) {
      return;
    }

    // 供应商零件信息
    this.http
      .get(`/wm/GetSupplierPartsOfYK?plant=${plant}&sourceWH=${sourceWH}&targetWH=${targetWH}&Id=${Id}`)
      .subscribe(
        (res: any) => {
          if (res.successful) {
            this.data_s = res.data;
            this.filter();
            // tslint:disable-next-line: no-unused-expression
          } else this.msg.error(res.message);

          this.loading = false;
        },
        (err: any) => this.msg.error('保存失败!'),
      );
  }
  filter() {
    // this.st.filteredData(p => p.direction === 'left');
    this.data_s_filter = this.data_s.filter(p => p.direction === 'left');
    this.data_t = this.data_s.filter(p => p.direction === 'right');
    this.cdr.detectChanges();
  }

  initCodeDetail() {
    // this.capi.getCodeDetailInfo('SAPMode', '', 'int').subscribe((res: any) => {
    //   this.sub_SAPMode.data = res;
    //   if (this.record.add === true && (this.record.SapSourceMode === null || this.record.SapSourceMode === undefined))
    //     this.record.SapSourceMode = res[0].val;
    //   if (this.record.add === true && (this.record.SapTargetMode === null || this.record.SapTargetMode === undefined))
    //     this.record.SapTargetMode = res[0].val;
    // });
    // this.capi.getCodeDetailInfo('wm_tran_sheet_type', '', 'string').subscribe((res: any) => {
    //   this.sub_wm_tran_sheet_type.data = res;
    // });
  }

  getListItems(value: any, type: any): void {
    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);

    if (value && this.record.TargetWH.toString() !== tmp_data.last_workshop) {
      if (this.record.TargetWH.length > 0) {
        this.loading = true;
        this.capi.getListItems(type, this.record.PlantID, this.record.TargetWH.toString()).subscribe(
          (res: any) => {
            tmp_data.data = res;
          },
          (err: any) => this.msg.error('获取数据失败!'),
        );
        this.loading = false;
        tmp_data.last_workshop = this.record.TargetWH.toString();
      } else {
        tmp_data.data = [];
        tmp_data.last_workshop = '';
      }

      if (this.record.add === true) {
        // tslint:disable-next-line: no-eval
        eval('this.record.' + type + ' = undefined ;');
      }
    }
  }

  stChange_s(e: STChange) {
    switch (e.type) {
      case 'checkbox':
        this.selectedRows_s = e.checkbox!;

        break;
    }
  }
  search_s(e: any): void {
    if (
      (this.q_s.part_no === undefined || this.q_s.part_no === '') &&
      (this.q_s.SupplierId === undefined || this.q_s.SupplierId === '')
    ) {
      this.filter();
      return;
    }
    this.data_s_filter = this.data_s.filter(
      p =>
        (this.q_s.part_no !== undefined && this.q_s.part_no.length > 0 && p.part_no.indexOf(this.q_s.part_no) > -1) ||
        (this.q_s.SupplierId !== undefined &&
          this.q_s.SupplierId.length > 0 &&
          p.SupplierId.indexOf(this.q_s.SupplierId) > -1),
    );
    this.cdr.detectChanges();
  }

  add1(e: any): void {
    this.initData();
    this.selectedRows_s.forEach(p => {
      const item = this.data_s.find(
        pp => pp.idx === p.idx,
      );
      item.direction = 'right';
    });
    this.filter();
    // this.selectedRows_s = [];
    this.st.clearCheck();
  }
  remove(e: any): void {
    this.initData();
    this.data_t
      .filter(item => this.mapOfCheckedId[item.idx])
      .forEach(p => {
        const item = this.data_s.find(
          pp => pp.idx === p.idx,
          );
        item.direction = 'left';
      });
    this.filter();
    // this.st.clearCheck();
  }
  initData() {
    this.data_t.forEach(p => {
      const item = this.data_s.find(pp => pp.idx === p.idx);
      if (item !== undefined) {
        item.RequiredPackQty = p.RequiredPackQty;
        item.RequiredFragpartQty = p.RequiredFragpartQty;
        item.RequiredPartQty = p.RequiredPartQty;
      }
    });
  }
  PackQtyChange(value: any, item: any) {
    // tslint:disable-next-line: radix
    let c = parseInt(value);
    // tslint:disable-next-line: radix
    let f = parseInt(item.RequiredFragpartQty);
    if (isNaN(c)) {
      c = 1;
    } else if (isNaN(f)) {
      f = 0;
    }
    c = f > 0 ? c - 1 : c;
    item.RequiredPartQty = c * item.packing_qty + f;
  }
  FragPartsChange(value: any, item: any) {
    // tslint:disable-next-line: radix
    let f = parseInt(value);
    // tslint:disable-next-line: radix
    let c = parseInt(item.RequiredPackQty);
    if (isNaN(c)) {
      c = 1;
    } else if (isNaN(f)) {
      f = 0;
    }
    c = f > 0 ? c - 1 : c;
    item.RequiredPartQty = c * item.packing_qty + f;
  }

  startEdit(id: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayData
      .filter(item => !item.disabled)
      .every(item => this.mapOfCheckedId[item.idx]);
    this.isIndeterminate =
      this.listOfDisplayData.filter(item => !item.disabled).some(item => this.mapOfCheckedId[item.idx]) &&
      !this.isAllDisplayDataChecked;
    this.numberOfChecked = this.data_t.filter(item => this.mapOfCheckedId[item.idx]).length;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayData.forEach(item => (this.mapOfCheckedId[item.idx] = value));
    this.refreshStatus();
  }
  currentPageDataChange($event: any): void {
    this.listOfDisplayData = $event;
    this.refreshStatus();
  }
}
