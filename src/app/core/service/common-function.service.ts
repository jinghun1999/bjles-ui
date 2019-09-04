import { Injectable } from '@angular/core';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class CommonFunctionService {
  constructor() {}

  callbackOfExport(e: any) {
    // ST 导出数据时，格式化一下列表头。;
    let tmpTitle: any;
    const tmpSheetName = 'e.Sheets.sheet1.';
    let firstName: any;
    for (let i = 64; i < 65 + 26; i++) {
      // tslint:disable-next-line: prefer-conditional-expression
      if (i === 64) {
        firstName = '';
      } else {
        firstName = String.fromCharCode(i);
      }
      for (let j = 65, len = 65 + 26; j < len; j++) {
        // tslint:disable-next-line: no-eval
        tmpTitle = eval(tmpSheetName + firstName + String.fromCharCode(j) + '1');
        if (tmpTitle === undefined) break;
        tmpTitle.v = tmpTitle.v.text;
      }
      if (tmpTitle === undefined) break;
    }
  }

  getSelectDate(e: any) {
    if (e !== undefined && e !== '' && e.length > 0) {
      for (let j = 0, len = e.length; j < len; j++) {
        e[j] = format(e[j], 'YYYY-MM-DD HH:mm:ss');
      }
    }
    return e;
  }
}
