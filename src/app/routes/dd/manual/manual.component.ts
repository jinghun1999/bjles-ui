import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
// import { STColumn, STData, STChange, STComponent } from '@delon/abc';
// import { SFSchema } from '@delon/form';
import { CacheService } from '@delon/cache';
import { NzMessageService } from 'ng-zorro-antd';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-dd-manual',
  templateUrl: './manual.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DdManualComponent implements OnInit {
  loading = true;
  _index = 0;
  pre_lists = [];
  sub_workshops = [];
  form_query: FormGroup;

  size = 'small';
  data = [];

  fetch_res: any = {
    plant: null,
    workshop: null,
    part_stocks: [],
    supplier: [],
    material_category_name: '',
    packing_qty: 0,
    expected_arrival_time_data: [],
  };

  part: any = {
    card_no: '',
    card_type_name: '',
    store_packing: 0,
    supplier: '',
    boxes: 0,
    parts: 0,
  }
  selected_card: any = {};
  remark: string = null;

  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  mapOfCheckedId: { [key: string]: boolean } = {};

  constructor(private fb: FormBuilder,
    private http: _HttpClient,
    private msg: NzMessageService,
    private srv: CacheService,
    private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.form_query = this.fb.group({
      plant: [null, [Validators.required]],
      workshop: [null, [Validators.required]],
      part_no: [null, [Validators.required]],
    });

    this.srv.get('/system/getplants').subscribe((res: any) => {
      this.loading = false;
      if (res.successful) {
        this.pre_lists = res.data;
        this.sub_workshops = res.data[0].children;

        this.form_query.get('plant')!.setValue(res.data[0].value);
        this.form_query.get('workshop')!.setValue(this.sub_workshops[0].value);
      } else {
        this.msg.error(res.message);
        this.loading = false;
      }
    }, (err: any) => this.msg.error('系统异常'));
  }

  plantChange(value: string): void {
    const l = this.pre_lists.find(p => p.value === value);
    this.sub_workshops = l.children;
    this.workshop.setValue(l.children[0].value);
  }

  cardChange(value: string): void {
    const l = this.fetch_res.part_stocks.find(p => p.card_no === value);
    console.log(l);
    this.selected_card = l;
  }

  changeBox(): void {
    this.part.parts = this.part.boxes * this.part.packing_qty;
  }

  changePart(): void {
    this.part.boxes = Math.ceil(this.part.parts / this.part.packing_qty);
  }

  search(): void {
    Object.keys(this.form_query.controls).forEach(key => {
      this.form_query.controls[key].markAsDirty();
      this.form_query.controls[key].updateValueAndValidity();
    });
    if (this.form_query.invalid) return;

    this.loading = true;
    this.http.get('/dd/getManualPull', {
      plant: this.plant.value,
      workshop: this.workshop.value,
      part_no: this.part_no.value
    })
      .subscribe((res: any) => {
        this.loading = false;
        if (res.successful) {
          this.fetch_res = res.data;
          this.selected_card = res.data.part_stocks[0];
          this.part = {
            plant: res.data.plant,
            workshop: res.data.workshop,
            part_no: res.data.part_no,
            part_name: res.data.part_name,
            supplier: res.data.supplier[0],
            packing_qty: res.data.packing_qty,
            material_category: res.data.material_category,
            material_category_name: res.data.material_category_name,
            boxes: 0,
            parts: 0,
          };

          this.cdr.detectChanges();
        } else {
          this.msg.error(res.message);
        }
      }, (err: any) => {
        this.loading = false;
        this.msg.error('系统错误，请稍后再试');
      });
  }

  get part_no() {
    return this.form_query.controls.part_no;
  }

  get plant() {
    return this.form_query.controls.plant;
  }

  get workshop() {
    return this.form_query.controls.workshop;
  }


  add() {
    if (this.data.some(p => p.plant !== this.fetch_res.plant || p.workshop !== this.fetch_res.workshop)) {
      this.msg.error('所选零件只能在同一工厂车间下！');
      return;
    }

    const i = this.data.findIndex(p => p.part_no === this.part.part_no && p.supplier === this.part.supplier)
    if (i >= 0) {
      this.data[i].parts = this.part.parts;
      this.data[i].boxes = this.part.boxes;
      this.msg.success('已修改零件需求数！');
      return;
    }
    let exp_time = null;
    const exp = this.fetch_res.expected_arrival_time_data.find(p => p.supplier === this.part.supplier && p.route === this.selected_card.route);
    if (exp !== null) {
      exp_time = exp.expected_arrival_time;
    }
    console.log(exp_time);

    this._index++;
    const item = {
      id: this._index,
      plant: this.fetch_res.plant,
      workshop: this.fetch_res.workshop,
      part_no: this.part.part_no,
      part_name: this.part.part_name,
      boxes: this.part.boxes,
      parts: this.part.parts,
      supplier: this.part.supplier,
      card_no: this.selected_card.card_no,
      card_type_name: this.selected_card.card_type_name,
      dock: this.selected_card.dock,
      dloc: this.selected_card.dloc,
      current_storage: this.selected_card.current_storage,
      packing_qty: this.fetch_res.packing_qty,

      expected_arrival_time: exp_time,
    };

    this.data.push(item);

    this.msg.success('添加零件成功！');
  }

  remove() {
    let c = 0;
    this.data.forEach(item => {
      // 如过被选中，则删除
      if (this.mapOfCheckedId[item.id]) {
        const i = this.data.findIndex(p => p.id === item.id);
        this.data.splice(i, 1);
        c++;
      }
    });
    if (!c) {
      this.msg.info('请先选择要删除的零件');
    } else {
      this.msg.success(`成功删除了${c}条记录`)
    }
  }

  commit() {
    if (!this.data.length) {
      this.msg.error('请至少拉动一个零件');
      return;
    }
    const list = [];
    this.data.forEach(p => {
      list.push({
        plant: p.plant,
        workshop: p.workshop,
        part_no: p.part_no,
        card_no: p.card_no,
        supplier: p.supplier,
        pack_count: p.boxes,
        part_count: p.parts,
        dock: p.dock,
        expected_arrival_time: p.expected_arrival_time,
      });
    });
    this.loading = true;
    this.http.post('/dd/PostManualPull', { interface_request: list, remark: this.remark }).subscribe((ok: any) => {
      if (ok.successful) {
        // 重置form表单
        this.fetch_res.part_no = null;
        this.part.part_no = null;
        this.data = [];
        this.msg.success('拉动成功');
      } else {
        this.msg.error(ok.message);
      }
      this.loading = false;
    }, (err: any) => {
      this.msg.error('系统错误');
      this.loading = false;
    });
  }

  checkAll(value: boolean): void {
    this.data.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.data.every(item => this.mapOfCheckedId[item.id]);
    this.isIndeterminate =
      this.data.some(item => this.mapOfCheckedId[item.id]) &&
      !this.isAllDisplayDataChecked;
  }
}
