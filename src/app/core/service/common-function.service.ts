import { Injectable } from '@angular/core';
import { format } from 'date-fns';
import { XlsxService, STComponent, STColumn, STData, STChange } from '@delon/abc';
import { NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CommonFunctionService {
  constructor(
    private xlsx: XlsxService,
    private http: _HttpClient,
    private msg: NzMessageService

  ) { }

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
        e[j] = format(e[j], 'YYYY/MM/DD HH:mm:ss');
      }
    }
    return e;
  }
  getDate(e: any) {
    if (e !== undefined && e !== '') {
      e = format(e, 'YYYY-MM-DD HH:mm:ss');
    }
    return e;
  }

  getDateFormat(e: any, _format: any) {
    if (e !== undefined && e !== '') {
      if (_format !== undefined && _format !== '' && _format !== null)
        e = format(e, _format);
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

  // 前端排序用
  sortCompare(value_a: any, value_b: any) {
    if (value_a > value_b) return 1;
    else if (value_a < value_b) return -1;
    else return 0;
  }

  exportExcel(q: any, searchPath: string, columns: STColumn[], t: any): void {
    q.page.export = true;
    t.loading = true;
    this.http
      .post(searchPath, q)
      .pipe(tap(() => (t.loading = false)))
      .subscribe(
        res => {
          if (res.successful) {
            const currentColumn: STColumn[] = columns.filter(
              p => (p.exported === undefined || p.exported) && p.buttons === undefined,
            );
            const data = [currentColumn.map(i => i.title)];
            res.data.rows.forEach(i => data.push(currentColumn.map(c => i[c.index as string])));

            this.xlsx.export({
              sheets: [
                {
                  data,
                  name: 'sheet1',
                },
              ],
            });

          } else {
            this.msg.error(res.message);
          }
          t.loading = false;
        },
        (err: any) => this.msg.error('系统异常'),
      );
    q.page.export = false;
  }

  getParentElement(el: any, tagName: string): any {
    // while (el !== undefined && el.tagName != tagName) {
    //   el = el.parentElement;
    // }
    return el;
  }

  setCheckedClass(el: any, obj: boolean) {
    // while (el.tagName != 'TR') {
    //   el = el.parentElement;
    // }
    el = this.getParentElement(el, 'TR');
    // console.log(el);
    const c = ' checked';
    if (obj) {
      if (el.className.indexOf(c) === -1)
        el.className += c;
    }
    else
      el.className = el.className.replace(/ checked/g, '');

  }

  stChange(e: STChange, selectedRows: any) {
    const type: any = e.type as any;
    let el: any = e as any;

    switch (type) {
      case 'click':
        // 点击 行
        e.click.item.checked = !e.click.item.checked;
        el = el.click.e.srcElement as any;
        this.setCheckedClass(el, e.click.item.checked);
        if (selectedRows !== undefined) {
          const i = selectedRows.indexOf(e.click.item);
          if (i > -1)
            selectedRows.splice(i, 1);
          else
            selectedRows.push(e.click.item);
        }
        break;
      case 'change':
        el = el.srcElement;
        const eTR = this.getParentElement(el, 'TR');

        if (eTR.rowIndex === 0) {
          // 点击所有 checkbox框
          const eTable = this.getParentElement(el, 'TABLE');
          const eTbody = eTable.children[2];
          for (let j = 0, len = eTbody.children.length; j < len; j++) {

            const t = eTbody.children[j];
            if (t.style.display === 'none')
              continue;
            this.setCheckedClass(t, el.checked);
          }
        }
        else
          // 点击单个 checkbox框
          this.setCheckedClass(eTR, el.checked);
        break;
    }
  }
}
