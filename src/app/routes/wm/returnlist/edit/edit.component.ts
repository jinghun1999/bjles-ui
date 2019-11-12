import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData } from 'src/app/model';
import { CommonApiService, CommonFunctionService, ENUMSheetType } from '@core';
import { STData, STComponent, STColumn, STChange } from '@delon/abc';

@Component({
  selector: 'app-wm-returnlist-edit',
  templateUrl: './edit.component.html',
})
export class WmReturnlistEditComponent implements OnInit {
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
    PartNumber: '',
    PartName: '',
  };

  // @ViewChild('st', { static: true }) st: STComponent;
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
      title: '封存条',
      index: 'SealingStripCode',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.SealingStripCode, b.SealingStripCode);
        },
      },
    },

    {
      title: '零件号',
      index: 'PartNumber',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.PartNumber, b.PartNumber);
        },
      },
    },
    {
      title: '零件名称',
      index: 'PartName',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.PartName, b.PartName);
        },
      },
    },
    {
      title: '标准包装数',
      index: 'PackStdQty',
      sort: {
        compare: (a: any, b: any) => a.PackStdQty - b.PackStdQty,
      },
    },
    {
      title: '封存数量',
      index: 'PartQty',
      sort: {
        compare: (a: any, b: any) => a.PartQty - b.PartQty,
      },
    },
    {
      title: '退货情况',
      index: 'ReturnStatus_name',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.ReturnStatus_name, b.ReturnStatus_name);
        },
      },
    },
  ];

  size = 'small';
  pre_lists = [];
  sub_workshops = [];
  sub_supplier = new ItemData();

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
    if (this.record.add !== true) this.getListItems(true, 'supplier');
  }

  save() {
    let result = true;
    this.data_t.forEach(p => {
      // tslint:disable-next-line: prefer-conditional-expression
      if (p.ReturnPartQty > 0) result = false;
      else result = true;
    });
    if (result) {
      this.msg.error('退货件数不能为零!');
      return;
    }

    this.loading = true;
    // this.record.workday = this.cfun.getDate(this.record.workday);
    const removes = this.data_s.filter(p => p.Id > 0 && p.direction === 'left');

    this.http.post('/wm/ReturnSave', { main: this.record, detail: this.data_t, removes }).subscribe(
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

    this.GetSupplierPartsOfReturn();
  }

  workshopChange(value: string): void {
    this.getListItems(true, 'supplier');
  }
  supplierChange(value: string) {
    this.GetSupplierPartsOfReturn();
  }
  GetSupplierPartsOfReturn() {
    const plant = this.record.PlantID;
    const supplier = this.record.SupplierID;
    const workshop = this.record.Warehouse;
    const Id = this.record.Id;
    if (supplier === undefined || supplier.length === 0 || workshop === undefined || workshop.length === 0) {
      return;
    }

    // 供应商零件信息
    this.http
      .get(`/wm/GetSupplierPartsOfReturn?plant=${plant}&supplier=${supplier}&workshop=${workshop}&Id=${Id}`)
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

    if (value && this.record.Warehouse.toString() !== tmp_data.last_workshop) {
      if (this.record.Warehouse.length > 0) {
        this.loading = true;
        this.capi.getListItems(type, this.record.PlantID, this.record.Warehouse.toString()).subscribe(
          (res: any) => {
            tmp_data.data = res;
          },
          (err: any) => this.msg.error('获取数据失败!'),
        );
        this.loading = false;
        tmp_data.last_workshop = this.record.Warehouse.toString();
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

      // case 'sort':
      //   this.q_s.sort.field = e.sort.column._sort.key;
      //   this.q_s.sort.order = e.sort.value;
      //   // this.getData();
      //   break;
    }
  }
  search_s(e: any): void {
    if (
      (this.q_s.PartNumber === undefined || this.q_s.PartNumber === '') &&
      (this.q_s.PartName === undefined || this.q_s.PartName === '')
    )
      return;
    this.data_s_filter = this.data_s.filter(
      p =>
        (this.q_s.PartNumber !== undefined &&
          this.q_s.PartNumber !== null &&
          p.PartNumber.indexOf(this.q_s.PartNumber) > -1) ||
        (this.q_s.PartName !== undefined && this.q_s.PartName !== null && p.PartName.indexOf(this.q_s.PartName) > -1),
    );
    this.cdr.detectChanges();
  }

  add1(e: any): void {
    this.initData();
    this.selectedRows_s.forEach(p => {
      const item = this.data_s.find(
        pp => pp.plant === p.plant && pp.PartNumber === p.PartNumber && pp.PartName === p.PartName,
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
          pp => pp.plant === p.plant && pp.PartNumber === p.PartNumber && pp.PartName === p.PartName,
        );
        item.direction = 'left';
      });
    this.filter();
    // this.st.clearCheck();
  }
  initData() {
    // this.data_t.forEach(p => {
    //   const item = this.data_s.find(pp => pp.idx === p.idx);
    //   if (item !== undefined) {
    //     // tslint:disable-next-line: prefer-conditional-expression
    //     if (p.ReturnPartQty === 0) item.ReturnPartQty = '';
    //     else item.ReturnPartQty = p.ReturnPartQty;
    //   }
    // });
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
