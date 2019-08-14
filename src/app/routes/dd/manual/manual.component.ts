import { Component, OnInit, ViewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent } from '@delon/abc';
import { SFSchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-dd-manual',
  templateUrl: './manual.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DdManualComponent implements OnInit, OnDestroy {
  editIndex = -1;
  editObj = {};
  pre_lists = [];
  sub_workshops = [];
  form_query: FormGroup;
  form: FormGroup;
  size = 'small';

  data = [];

  fetch_res = {
    partstocks: [],
    supplier: [],
    material_category_name: '',
  };
  selected_card = {
    card_no: '',
    card_type_name: '',
    store_packing: 0,
  };

  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  mapOfCheckedId: { [key: string]: boolean } = {};

  constructor(private fb: FormBuilder,
              private http: _HttpClient,
              private message: NzMessageService) {}

  ngOnInit() {
    this.form_query = this.fb.group({
      plant: [null, [Validators.required]],
      workshop: [null, [Validators.required]],
      part_no: [null, [Validators.required]],
    });
    this.form = this.fb.group({
      card: [null, [Validators.required]],
      supplier: [null, [Validators.required]],

      material_category:[null, [Validators.required]],
      material_category_name: [null, [Validators.required]],
      card_type_name: [null, [Validators.required]],

      boxes: [null, [Validators.required]],
      parts: [null, [Validators.required]],
    });

    this.http.get('/system/getplants').subscribe((res: any)=>{
      if(res.successful){
        this.pre_lists = res.data;
        this.sub_workshops = res.data[0].children;

        this.form_query.get('plant')!.setValue(res.data[0].value);
        this.form_query.get('workshop')!.setValue(this.sub_workshops[0].value);
      }else{
        alert('系统异常')
      }
    });

    this.boxes.valueChanges.subscribe((val)=>{
      this.parts.setValue(val * this.selected_card.store_packing);
    });
    // this.parts.valueChanges.subscribe((val)=>{
    //   this.boxes.setValue(val / this.selected_card.store_packing);
    // });
  }
  ngOnDestroy() {

  }

  plantChange(value: string): void {
    const l = this.pre_lists.find(p=>p.value === value);
    // this.form.get('workshop')!.setValue(l.children);
    this.sub_workshops = l.children;
    this.workshop.setValue(l.children[0].value);
  }
  cardChange(value: string): void {
    const l = this.fetch_res.partstocks.find(p=>p.card_no === value);
    this.selected_card = l;
  }

  search($event){
    this.http.get('/system/getManualPull', {plant: this.plant.value, workshop: this.workshop.value, part_no: this.part_no.value})
      .subscribe((res: any)=>{
        if(res.successful){
          this.fetch_res = res.data;
          this.selected_card = res.data.partstocks[0];

          this.form.get('card')!.setValue(this.selected_card.card_no);
          this.form.get('supplier')!.setValue(this.fetch_res.supplier[0]);

          this.form.get('material_category_name')!.setValue(this.fetch_res.material_category_name);
        }else{
          this.message.error(res.message);
        }
      }, (err: any)=>{alert('error.')});
    return false;
  }

  //#region get form fields
  get part_no() { return this.form_query.controls.part_no; }
  get plant() { return this.form_query.controls.plant; }
  get workshop() { return this.form_query.controls.workshop; }

  get boxes(){ return this.form.controls.boxes;}
  get parts(){ return this.form.controls.parts;}


  add() {
  }

  del(index: number) {
    // this.data.removeAt(index);
  }


  save(index: number) {
    this.data.at(index).markAsDirty();
    if (this.data.at(index).invalid) return;
    this.editIndex = -1;
  }

  cancel(index: number) {
    if (!this.data.at(index).value.key) {
      this.del(index);
    } else {
      this.data.at(index).patchValue(this.editObj);
    }
    this.editIndex = -1;
  }

  _submitForm() {
    Object.keys(this.form.controls).forEach(key => {
      this.form.controls[key].markAsDirty();
      this.form.controls[key].updateValueAndValidity();
    });
    if (this.form.invalid) return;
  }

  checkAll(): void {}
  refreshStatus(): void{}
}
