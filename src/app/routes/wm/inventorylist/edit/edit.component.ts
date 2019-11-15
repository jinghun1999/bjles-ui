import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData } from 'src/app/model';
import { CommonApiService, CommonFunctionService, ENUMSheetType } from '@core';
import { STData, STComponent, STColumn, STChange } from '@delon/abc';

@Component({
  selector: 'app-wm-inventorylist-edit',
  templateUrl: './edit.component.html',
})
export class WmInventorylistEditComponent implements OnInit {
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
    SupplierId: '',
    Dloc: '',
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
      index: 'SupplierName',
      sort: {
        compare: (a: any, b: any) => {
          return this.cfun.sortCompare(a.SupplierName, b.SupplierName);
        },
      },
    },
    {
      title: '库位地址',
      index: 'Dloc',
      sort: {
        compare: (a: any, b: any) => a.Dloc - b.Dloc,
      },
    },
  ];

  size = 'small';
  pre_lists = [];
  sub_workshops = [];

  sub_wm_inventory_mode = new ItemData();
  sub_wm_inventory_type = new ItemData();
  sub_InventoryUser = new ItemData();
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
      this.record.InventoryUser = this.record.InventoryUser + '';
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

    this.http.get(`/system/GetUserListBind`).subscribe(
      (res: any) => {
        if (res.successful) {
          this.sub_InventoryUser.data = res.data;
        } else this.msg.error(res.message);

        this.loading = false;
      },
      (err: any) => this.msg.error('获取盘点人失败!'),
    );
  }

  save() {
    let result = true;
    this.data_t.forEach(p => {
      // tslint:disable-next-line: prefer-conditional-expression
      if (p.InventoryPartQty > 0) result = false;
      else result = true;
    });
    if (this.data_t.length === 0) {
      this.msg.error('请选择盘点零件!');
      return;
    }
    if (this.record.add) {
      if (this.record.Warehouse === undefined || this.record.Warehouse.length === 0) {
        this.msg.error('请选择车间!');
        return;
      }
      if (this.record.InventoryType === undefined || this.record.InventoryType.length === 0) {
        this.msg.error('请选择盘点类型!');
        return;
      }
      if (this.record.InventoryMode === undefined || this.record.InventoryMode.length === 0) {
        this.msg.error('请选择盘点模式!');
        return;
      }
      if (this.record.InventoryUser === undefined || this.record.InventoryUser.length === 0) {
        this.msg.error('请选择盘点人!');
        return;
      }
    }

    this.loading = true;
    // this.record.workday = this.cfun.getDate(this.record.workday);
    const removes = this.data_s.filter(p => p.Id > 0 && p.direction === 'left');

    this.http.post('/wm/InventorySave', { main: this.record, detail: this.data_t, removes }).subscribe(
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

    this.GetSupplierPartsOfInventory();
  }

  workshopChange(value: string): void {
    this.GetSupplierPartsOfInventory();
  }
  GetSupplierPartsOfInventory() {
    const plant = this.record.PlantID;
    const workshop = this.record.Warehouse;
    const Id = this.record.Id;
    if (workshop === undefined || workshop.length === 0) {
      return;
    }

    // 供应商零件信息
    this.http.get(`/wm/GetSupplierPartsOfInventory?plant=${plant}&workshop=${workshop}&Id=${Id}`).subscribe(
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
    this.capi.getCodeDetailInfo('wm_inventory_type', '', 'string').subscribe((res: any) => {
      this.sub_wm_inventory_type.data = res;
    });
    this.capi.getCodeDetailInfo('wm_inventory_mode', '', 'string').subscribe((res: any) => {
      this.sub_wm_inventory_mode.data = res;
    });
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
      (this.q_s.SupplierId === undefined || this.q_s.SupplierId === '') &&
      (this.q_s.Dloc === undefined || this.q_s.Dloc.length === 0)
    ) {
      this.filter();
      return;
    }
    this.data_s_filter = this.data_s.filter(
      p =>
        (this.q_s.PartNumber !== undefined &&
          this.q_s.PartNumber.length > 0 &&
          p.PartNumber.indexOf(this.q_s.PartNumber) > -1) ||
        (this.q_s.SupplierId !== undefined &&
          this.q_s.SupplierId.length > 0 &&
          p.SupplierId.indexOf(this.q_s.SupplierId) > -1) ||
        (this.q_s.Dloc !== undefined && this.q_s.Dloc.length > 0 && p.Dloc.indexOf(this.q_s.Dloc) > -1),
    );
    this.cdr.detectChanges();
  }

  add1(e: any): void {
    this.initData();
    this.selectedRows_s.forEach(p => {
      const item = this.data_s.find(pp => pp.idx === p.idx);
      item.direction = 'right';
    });
    this.filter();
    // this.selectedRows_s = [];
    this.st.clearCheck();
  }
  addAllParts(e:any): void {
    if (e) {
      this.data_s
        .filter(p => p.direction === 'left')
        .forEach(p => {
          p.direction = 'right';
        });
    }
    this.filter();
  }
  remove(e: any): void {
    this.initData();
    this.data_t
      .filter(item => this.mapOfCheckedId[item.idx])
      .forEach(p => {
        const item = this.data_s.find(pp => pp.idx === p.idx);
        item.direction = 'left';
        this.mapOfCheckedId[item.idx] = false;
      });
    this.filter();
    if (this.data_s_filter.length > 0) this.record.IsAllParts = false;
    this.refreshStatus();

    // this.st.clearCheck();
  }
  initData() {
    // this.data_t.forEach(p => {
    //   const item = this.data_s.find(pp => pp.idx === p.idx);
    //   if (item !== undefined) {
    //     // tslint:disable-next-line: prefer-conditional-expression
    //     if (p.InventoryPartQty === 0) item.InventoryPartQty = '';
    //     else item.InventoryPartQty = p.InventoryPartQty;
    //   }
    // });
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
