import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CacheService } from '@delon/cache';

@Injectable({
  providedIn: 'root',
})
export class CommonApiService {
  constructor(private http: HttpClient, public cache: CacheService) {}

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
      const cache_data = this.cache.getNone(e);
      if (cache_data === undefined || cache_data === null || cache_data === '' || cache_data === []) {
        this.http.get('/Area/GetCodeDetail?codeName=' + e + '&orderName=' + order).subscribe((res: any) => {
          this.cache.set(e, res.data);
          observe.next(res.data);
          // 如果有错误，通过 error() 方法将错误返回
          // observe.error(res.message);
        });
      } else {
        observe.next(cache_data);
      }
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

  getListItems(type: any, plant: any, workshop: any) {
    return new Observable(observe => {
      let url = '';
      switch (type) {
        case 'sub_routes':
          url = '/Area/GetRoute?plant=' + plant + '&workshop=' + workshop;
          break;
        case 'sub_docks':
          url = '/Area/GetDock?plant=' + plant + '&workshop=' + workshop;
          break;
        case 'sub_suppliers':
          url = '/Supplier/GetSuppliers?plant=' + plant + '&workshop=' + workshop;
          break;
      }

      this.http.get(url).subscribe((res: any) => {
        observe.next(res.data);
        // 如果有错误，通过 error() 方法将错误返回
        // observe.error(res.message);
      });
    });
  }
}
