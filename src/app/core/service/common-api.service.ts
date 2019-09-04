import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonApiService {

  constructor(private http: HttpClient, ) { }

  getPlant() {
    return new Observable((observe) => {
      this.http.get('/system/getPlant')
        .subscribe((res: any) => {
          observe.next(res.data);
          // 如果有错误，通过 error() 方法将错误返回
          // observe.error(res.message);
        });
    });
  }
}
