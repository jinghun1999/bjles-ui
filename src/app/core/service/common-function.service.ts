import { Injectable } from '@angular/core';
import { format } from 'date-fns';
import { XlsxService } from '@delon/abc';

@Injectable({
  providedIn: 'root',
})
export class CommonFunctionService {
  constructor(private xlsx: XlsxService) {}

  callbackOfExport(e: any) {
    // 更新到8.3.2后不需要 这个功能 了
    // // ST 导出数据时，格式化一下列表头。;
    // let tmpTitle: any;
    // const tmpSheetName = 'e.Sheets.sheet1.';
    // let firstName: any;
    // for (let i = 64; i < 65 + 26; i++) {
    //   // tslint:disable-next-line: prefer-conditional-expression
    //   if (i === 64) {
    //     firstName = '';
    //   } else {
    //     firstName = String.fromCharCode(i);
    //   }
    //   for (let j = 65, len = 65 + 26; j < len; j++) {
    //     // tslint:disable-next-line: no-eval
    //     tmpTitle = eval(tmpSheetName + firstName + String.fromCharCode(j) + '1');
    //     if (tmpTitle === undefined) break;
    //     tmpTitle.v = tmpTitle.v.text;
    //   }
    //   if (tmpTitle === undefined) break;
    // }
  }

  getSelectDate(e: any) {
    if (e !== undefined && e !== '' && e.length > 0) {
      for (let j = 0, len = e.length; j < len; j++) {
        e[j] = format(e[j], 'YYYY-MM-DD HH:mm:ss');
      }
    }
    return e;
  }

  // column:是返回的表头列 '工厂,车间,零件号'
  // d是API返回的DataTable
  // f是导出的文件名
  downErrorExcel(column: any, d: any, f: any) {
    const title = column.split(',');
    const data = [title];
    d.forEach(i => data.push(title.map(c => i[c])));
    this.xlsx.export({
      filename: f,
      sheets: [
        {
          data,
          name: 'sheet1',
        },
      ],
    });
    // return data;
  }
}
