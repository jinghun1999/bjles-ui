import { format } from 'date-fns';

export class Common {
  static callbackOfExport(e: any) {
    // ST 导出数据时，格式化一下列表头。;
    for (let j = 65, len = 65 + 26; j < len; j++) {
      // tslint:disable-next-line: no-eval
      const tmpTitle = eval('e.Sheets.sheet1.' + String.fromCharCode(j) + '1');
      if (tmpTitle === undefined) break;
      tmpTitle.v = tmpTitle.v.text;
    }
  }

  static getSelectDate(e: any) {
    if (e !== undefined && e !== '' && e.length > 0) {
      for (let j = 0, len = e.length; j < len; j++) {
        e[j] = format(e[j], 'YYYY-MM-DD HH:mm:ss');
      }
    }
    return e;
  }
}
