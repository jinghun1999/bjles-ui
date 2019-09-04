import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonApiService {
  constructor(private http: HttpClient) {}

  getPlant() {
    return new Observable(observe => {
      this.http.get('/System/GetPlants').subscribe((res: any) => {
        observe.next(res.data);
        // 如果有错误，通过 error() 方法将错误返回
        // observe.error(res.message);
      });
    });
  }

  getCodeDetailInfo(e: any, order: any) {
    return new Observable(observe => {
      this.http.get('/Area/GetCodeDetail?codeName=' + e + '&orderName=' + order).subscribe((res: any) => {
        observe.next(res.data);
        // 如果有错误，通过 error() 方法将错误返回
        // observe.error(res.message);
      });
    });
  }

  getActions(actionPath: any) {
    return new Observable(observe => {
      this.http.get('/System/GetActions?actionPath=' + actionPath).subscribe((res: any) => {
        observe.next(res.data);
        // 如果有错误，通过 error() 方法将错误返回
        // observe.error(res.message);
      });
    });
  }

  GetSupplier(plant: any, workshop: any) {
    return new Observable(observe => {
      this.http.get('/Supplier/GetSuppliers?plant=' + plant + '&workshop=' + workshop).subscribe((res: any) => {
        observe.next(res.data);
        // 如果有错误，通过 error() 方法将错误返回
        // observe.error(res.message);
      });
    });
  }
}
