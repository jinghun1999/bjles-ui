import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { CommonApiService, CommonFunctionService, ENUMSheetType, ExpHttpService } from '@core';
import { STData, STComponent, STColumn, STChange, XlsxService } from '@delon/abc';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-wm-diffwriteoff-edit',
  templateUrl: './edit.component.html',
})
export class WmDiffwriteoffEditComponent implements OnInit {
  record: any;
  actionPath = 'Warehouse/DiffStockCancelEdit.aspx';

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
    SupplierId: '',
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
      title: '供应商名称',
      index: 'supplier_name',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.supplier_name, b.supplier_name);
        },
      },
    },
    {
      title: '库存数量',
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
    // { title: '散件数', index: 'current_fragpart_count', sort: true },
    // { title: '总件数', index: 'current_parts', sort: true },
  ];

  size = 'small';
  pre_lists = [];
  sub_workshops = [];

  dataAction: any[] = [];

  loading = false;
  title = '';

  constructor(
    private modal: NzModalRef,
    private msg: NzMessageService,
    public http: _HttpClient,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
    private cdr: ChangeDetectorRef,
    private xlsx: XlsxService,
    private httpService: ExpHttpService,
  ) {}

  ngOnInit(): void {
    // tslint:disable-next-line: prefer-conditional-expression
    if (this.record.add === true) {
      this.title = '添加';
    } else {
      this.title = '编辑';
      this.record.add = false;
    }

    this.capi.getPlantOfDiff('', '1', '1').subscribe(
      (res: any) => {
        this.pre_lists = res;
        if (this.pre_lists.length > 0) {
          this.sub_workshops = this.pre_lists[0].children;
          if (this.record.add === true && (this.record.PlantId === null || this.record.PlantId === undefined))
            this.record.PlantId = this.pre_lists[0].value;
          this.plantChange(this.record.PlantId);
        }
      },
      (err: any) => this.msg.error('获取不到工厂车间信息！！'),
    );

    // toolBar
    this.capi.getActions(this.actionPath).subscribe((res: any) => {
      this.dataAction = res;
      this.dataAction = this.dataAction.filter(p => p.action_name !== 'Delete');
    });

    this.initCodeDetail();
  }
  toolBarOnClick(e: any) {
    switch (e.action_name) {
      case 'Save':
        this.save();
        break;
      case 'Download':
        this.Download();
        break;
      case 'Import':
        this.import();
        break;
    }
  }
  Download() {
    this.httpService.downLoadFile('/assets/tpl/diffStockCancel_import.xlsx', 'DiffWirteoffTPL');
  }

  save() {
    this.loading = true;
    // this.record.workday = this.cfun.getDate(this.record.workday);
    const removes = this.data_s.filter(p => p.Id > 0 && p.direction === 'left');

    this.http.post('/wm/DiffWirteoffSave', { main: this.record, detail: this.data_t, removes }).subscribe(
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
  import(): void {
    const workshop = this.record.SourceWorkshop;

    if (workshop.length === 0) {
      this.msg.error('请选择仓库！');
      return;
    }
    const file1 = document.getElementById('import') as HTMLInputElement;
    if (file1.files.length === 0) {
      this.msg.error('请选择需要导入的数据文件！');
      return;
    }
    const file = file1.files[0];
    this.loading = true;
    this.xlsx.import(file).then(res1 => {
      // EXCEL文件之中文字段改为英文字段
      // for (let j = 0, len = res1.sheet1[0].length; j < len; j++) {
      //   res1.sheet1[0][j] = this.columns.find(p => p.title === res1.sheet1[0][j]).index;
      // }
      this.http
        .post('/wm/DiffWirteoffImport', { main: this.record, val: res1 })
        .pipe(tap(() => (this.loading = false)))
        .subscribe(
          res => {
            if (res.successful) {
              if (!res.data.result) {
                // this.cfun.downErrorExcel(res.data.column, res.data.errDT, 'supplyDate_error.xlsx');
              }
              this.msg.success(res.data.msg);
              // if (this.record.add) this.record.add=false;
              // this.GetSupplierPartsOfCYHX();
              this.modal.close(true);
            } else {
              this.msg.error(res.message);
              this.loading = false;
            }
          },
          (err: any) => this.msg.error('系统异常'),
        );
    });
  }

  close() {
    this.modal.destroy();
  }
  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshops = l.children;

    if (!this.record.add) this.GetSupplierPartsOfCYHX();
  }

  workshopChange(value: string): void {
    this.GetSupplierPartsOfCYHX();
  }
  GetSupplierPartsOfCYHX() {
    const plant = this.record.PlantId;
    const sourceWH = this.record.SourceWorkshop;
    const Id = this.record.Id;
    // 供应商零件信息
    this.http.get(`/wm/GetSupplierPartsOfCYHX?plant=${plant}&sourceWH=${sourceWH}&Id=${Id}`).subscribe(
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
        this.capi.getListItems(type, this.record.PlantId, this.record.TargetWH.toString()).subscribe(
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

  add(e: any): void {
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
        item.Remark = p.Remark;
      }
    });
  }
  PackQtyChange(value: any, item: any) {
    // tslint:disable-next-line: radix
    const c = parseInt(value);
    // tslint:disable-next-line: radix
    const s = parseInt(item.packing_qty);

    item.RequiredFragpartQty = 0;
    item.RequiredPartQty = s * c;
  }
  PartQtyChange(value: any, item: any) {
    // tslint:disable-next-line: radix
    let f = parseInt(value);
    // tslint:disable-next-line: radix
    let c = parseInt(item.RequiredPackQty);
    // tslint:disable-next-line: radix
    const s = parseInt(item.packing_qty);

    // if (f === '') return;
    if (isNaN(c)) {
      c = 1;
    } else if (isNaN(f)) {
      f = 0;
    }
    if (f < 0) {
      f = f * -1;
      c = Math.ceil(f / s);
      c = c * -1;
    } else c = Math.ceil(f / s);
    item.RequiredFragpartQty = value % s;
    item.RequiredPackQty = c;
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
