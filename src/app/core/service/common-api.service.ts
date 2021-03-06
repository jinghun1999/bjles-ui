import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CacheService } from '@delon/cache';
import { PageInfo, SortInfo } from 'src/app/model';

@Injectable({
  providedIn: 'root',
})
export class CommonApiService {
  constructor(private http: HttpClient, public cache: CacheService) { }

  getPlant() {
    return new Observable(observe => {
      const cache_name = 'GetPlants';
      const cache_data = this.cache.getNone(cache_name);
      if (cache_data === undefined || cache_data === null || cache_data === '' || cache_data === []) {
        this.http.get('/System/GetPlants').subscribe((res: any) => {
          this.cache.set(cache_name, res.data, { type: 's', expire: 500 });
          observe.next(res.data);
          // 如果有错误，通过 error() 方法将错误返回
          // observe.error(res.message);
        });
      } else {
        observe.next(cache_data);
      }
    });
  }
  getPlantOfDiff(plant: string, type: string, due: string) {
    return new Observable(observe => {
      const cache_name = `GetPlantsOfDiffplant=${plant}&type=${type}&due=${due}`;
      const cache_data = this.cache.getNone(cache_name);
      if (cache_data === undefined || cache_data === null || cache_data === '' || cache_data === []) {
        this.http.get(`/System/GetPlantsOfDiff?plant=${plant}&type=${type}&due=${due}`).subscribe((res: any) => {
          this.cache.set(cache_name, res.data, { type: 's', expire: 500 });
          observe.next(res.data);
          // 如果有错误，通过 error() 方法将错误返回
          // observe.error(res.message);
        });
      } else {
        observe.next(cache_data);
      }
    });
  }
  getCodes(codes: string) {
    return new Observable(observe => {
      this.http.get('/system/getCodeEnums?codes=' + codes).subscribe((res: any) => {
        observe.next(res.data);
      });
    });
  }

  getCodeDetailInfo(e: any, order: any, p_type: any = 'string') {
    return new Observable(observe => {
      const key = e + p_type;
      const cache_data = this.cache.getNone(key);
      if (cache_data === undefined || cache_data === null || cache_data === '' || cache_data === []) {
        this.http
          .get('/system/getCodeDetail?codeName=' + e + '&pType=' + p_type + '&orderName=' + order)
          .subscribe((res: any) => {
            this.cache.set(key, res.data, { type: 's', expire: 500 });
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
      this.http.get('/system/getActions?actionPath=' + actionPath).subscribe((res: any) => {
        observe.next(res.data);
        // 如果有错误，通过 error() 方法将错误返回
        // observe.error(res.message);
      });
    });
  }

  GetMenusOfTree() {
    return new Observable(observe => {
      this.http.get('/system/GetMenusOfTree').subscribe((res: any) => {
        observe.next(res.data);
        // 如果有错误，通过 error() 方法将错误返回
        // observe.error(res.message);
      });
    });
  }

  getListItems(type: string, plant: string, workshop: string, supplier: string = null) {
    let url = '';
    switch (type) {
      case 'route_code':
      case 'route':
        url = '/area/getRoute';
        break;
      case 'dock_code':
      case 'dock':
        url = '/area/getDock';
        break;
      case 'supplier_code':
      case 'supplier':
        url = '/supplier/getSuppliers';
        break;
      case 'supplier_inner':
        url = '/supplier/getSuppliers_inner';
        break;
      case 'supplier_print':
        url = '/supplier/GetSuppliersByPrint';
        break;
      case 'rack':
        url = '/jis/getRacks';
        break;
      case 'mode_id':
        url = '/supplier/GetWTModeName';
        break;
      case 'printer_name':
        url = '/print/GetPrinter';
        break;
    }
    let params = `?plant=${plant}&workshop=${workshop}`;
    if ((type === 'rack' || type === 'printer_name') && supplier) {
      params += `&supplier=${supplier}`;
    }
    if (!url.length) {
      return;
    }
    return new Observable(observe => {
      this.http.get(url + params).subscribe((res: any) => {
        observe.next(res.data);
      });
    });
  }
}
