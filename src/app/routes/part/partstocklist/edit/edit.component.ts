import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { ItemData } from 'src/app/model';
import { CommonApiService } from '@core';
import { STColumn, STComponent } from '@delon/abc';

@Component({
  selector: 'app-part-partstocklist-edit',
  templateUrl: './edit.component.html',
})
export class PartPartstocklistEditComponent implements OnInit {
  record: any = {};

  size = 'small';
  pre_lists = [];
  sub_workshops = [];
  sub_dock = new ItemData();
  data = [];
  @ViewChild('st', { static: false }) st: STComponent;
  columns: STColumn[] = [
    { title: '编号', index: 'Id', sort: true },
    { title: '零件号', index: 'PartNo', sort: true },
    { title: '零件名称', index: 'part_cname', sort: true },
    { title: '供应商', index: 'SupplierId', sort: true },
    { title: '工厂', index: 'Plant', sort: true },
    { title: '车间', index: 'Workshop', sort: true },

    { title: '库位编号', index: 'Dloc', sort: true },
    { title: '当前箱数', index: 'CurrentStorage', sort: true },
    { title: '当前件数', index: 'CurrentParts', sort: true },
    { title: '翻包前地址', index: 'PreRploc', sort: true },
  ];

  pc_all = true;

  loading = false;

  constructor(
    private modal: NzModalRef,
    private msg: NzMessageService,
    public http: _HttpClient,
    private capi: CommonApiService,
  ) {}

  ngOnInit(): void {
    this.capi.getPlant().subscribe(
      (res: any) => {
        this.pre_lists = res;
        if (this.pre_lists.length > 0) {
          this.sub_workshops = this.pre_lists[0].children;
          // this.record.plant = this.pre_lists[0].value;
          this.plantChange(this.record.plant);
        }
      },
      (err: any) => this.msg.error('获取不到工厂车间信息！！'),
    );

    this.initCodeDetail();
    this.getListItems(true, 'dock');
    this.GetPartStockSupplierPageList();
  }
  GetPartStockSupplierPageList() {
    this.loading = true;
    this.http.post('/part/GetPartStockSupplierPageList', this.record).subscribe(
      (res: any) => {
        if (res.successful) {
          this.data = res.data;
          this.loading = false;
        } else {
          this.msg.error(res.message);
          this.loading = false;
        }
      },
      (err: any) => this.msg.error('保存失败!'),
    );
  }

  save() {
    this.loading = true;
    this.http.post('/part/PartStockSaveData', this.record).subscribe(
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
    // this.record.workshop = '';
  }

  initCodeDetail() {
    // this.capi.getCodeDetailInfo('card_type', '', 'int').subscribe((res: any) => {
    //   this.sub_card_type.data = res;
    // });
    // this.capi.getCodeDetailInfo('card_state', '', 'int').subscribe((res: any) => {
    //   this.sub_card_state.data = res;
    // });
  }

  getListItems(value: any, type: any): void {
    // tslint:disable-next-line: no-eval
    const tmp_data = eval('this.sub_' + type);

    if (value && this.record.workshop.toString() !== tmp_data.last_workshop) {
      if (this.record.workshop.length > 0) {
        this.loading = true;
        this.capi.getListItems(type, this.record.plant, this.record.workshop.toString()).subscribe(
          (res: any) => {
            tmp_data.data = res;
          },
          (err: any) => this.msg.error('获取数据失败!'),
        );
        this.loading = false;
        tmp_data.last_workshop = this.record.workshop.toString();
      } else {
        tmp_data.data = [];
        tmp_data.last_workshop = '';
      }
    }
  }
}
