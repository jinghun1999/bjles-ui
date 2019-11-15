import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent, STData, STPage, STChange, XlsxService } from '@delon/abc';
import { CommonFunctionService, CommonApiService, ExpHttpService } from '@core';
import { NzMessageService } from 'ng-zorro-antd';
import { PageInfo, SortInfo, ItemData, PagerConfig } from 'src/app/model';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-wm-inventorylist-import',
  templateUrl: './import.component.html',
})
export class WmInventorylistImportComponent implements OnInit {
  actionPath = 'Warehouse/StoreInventoryExport.aspx';
  searchPath = '/wm/GetCanSelectPartList';

  expandForm = true;
  loading: boolean;

  size = 'small';
  q: any = {
    plant: '',
    workshop: '',
  };

  dataAction: any[] = [];
  pre_lists = [];
  sub_workshops = [];

  sub_wm_inventory_mode = new ItemData();
  sub_wm_inventory_type = new ItemData();

  dataPrints: any[] = [];

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    public msg: NzMessageService,
    private cdr: ChangeDetectorRef,
    private capi: CommonApiService,
    private cfun: CommonFunctionService,
    private xlsx: XlsxService,
    private httpService: ExpHttpService,
  ) { }

  ngOnInit() {
    this.loading = true;

    this.capi.getPlantOfDiff('', '', '0').subscribe(
      (res: any) => {
        this.pre_lists = res;
        if (this.pre_lists.length > 0) {
          this.sub_workshops = this.pre_lists[0].children;
          this.q.plant = this.pre_lists[0].value;
          this.plantChange(this.q.plant);
        }
      },
      (err: any) => this.msg.error('获取不到工厂车间信息！！'),
    );

    // toolBar
    this.capi.getActions(this.actionPath).subscribe((res: any) => {
      this.dataAction = res;
    });

    this.loading = false;
  }

  getCodeDetails(value: any, type: any) {
    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);
    if (value) {
      // tslint:disable-next-line: no-eval
      if (tmp_data.data.length === 0)
        this.capi.getCodeDetailInfo(type, '').subscribe((res: any) => {
          tmp_data.data = res;
        });
    }
  }

  getListItems(value: any, type: any): void {
    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);

    if (value && this.q.workshop.toString() !== tmp_data.last_workshop) {
      if (this.q.workshop.length > 0) {
        this.loading = true;
        this.capi.getListItems(type, this.q.plant, this.q.workshop.toString()).subscribe(
          (res: any) => {
            tmp_data.data = res;
          },
          (err: any) => this.msg.error('获取数据失败!'),
        );
        this.loading = false;
        tmp_data.last_workshop = this.q.workshop.toString();
      } else {
        tmp_data.data = [];
        tmp_data.last_workshop = '';
      }
      // tslint:disable-next-line: no-eval
      eval('this.q.' + type + ' =  [];');
    }
  }

  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshops = l.children;
    this.q.workshop = '';
  }

  toolBarOnClick(e: any) {
    switch (e.action_name) {
      case 'Export':
        this.export();
        break;
      case 'HideOrExpand':
        this.hideOrExpand();
        break;
      case 'Download':
        this.Download();
        break;
      case 'Import':
        this.import();
        break;
    }
  }

  import(): void {
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
        .post('/wm/InventoryImport', res1)
        .pipe(tap(() => (this.loading = false)))
        .subscribe(
          res => {
            if (res.successful) {
              if (!res.data.result) {
                // this.cfun.downErrorExcel(res.data.column, res.data.errDT, 'supplyDate_error.xlsx');
              }
              this.msg.success(res.data.msg);
            } else {
              this.msg.error(res.message);
              this.loading = false;
            }
          },
          (err: any) => this.msg.error('系统异常'),
        );
    });
  }



  Download() {
    // this.httpService.downLoadFile('/assets/tpl/Inventory_import.xlsx', 'InventoryTPL');
  }


  hideOrExpand() {
    this.expandForm = !this.expandForm;
  }


  export(): void {
    if (this.q.wh === undefined || this.q.wh.length === 0) {
      this.msg.error('请选择车间!');
      return;
    }
    if (this.q.InventoryType === undefined || this.q.InventoryType.length === 0) {
      this.msg.error('请选择盘点类型!');
      return;
    }
    if (this.q.InventoryMode === undefined || this.q.InventoryMode.length === 0) {
      this.msg.error('请选择盘点模式!');
      return;
    }

    this.http
      .post(this.searchPath, this.q)
      .pipe(tap(() => (this.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            this.cfun.downErrorExcel(res.data.column, res.data.dt, 'InventoryBatch.xlsx');
          } else {
            this.msg.error(res.message);
            this.loading = false;
          }
        },
        (err: any) => this.msg.error('系统异常'),
      );

  }


}
