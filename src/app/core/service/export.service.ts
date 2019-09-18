import { Injectable, Injector, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { zip, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ExpHttpService {
  constructor(private http: HttpClient) {}
  // Blob请求
  requestBlob(url: any, data?: any): Observable<any> {
    return this.http.request('get', url, { body: data, observe: 'response', responseType: 'blob' });
  }
  // Blob文件转换下载
  downFile(result, fileName, fileType?) {
    const data = result.body;
    const blob = new Blob([data], { type: fileType || data.type });
    const objectUrl = URL.createObjectURL(blob);
    this.downLoadFile(objectUrl, fileName);
  }
  downLoadFile(objectUrl: string, fileName: string) {
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none');
    a.setAttribute('href', objectUrl);
    a.setAttribute('download', fileName);
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  // downFileOfData(data: any, fileName: string) {
  //   const a = document.createElement('button');
  //   a.setAttribute('style', 'display:none');
  //   a.setAttribute('down-file','' );
  //   a.setAttribute('download', fileName);
  //   a.click();
  //   URL.revokeObjectURL(objectUrl);
  // }
}
@Injectable()
export class ExportService {
  constructor(private httpService: ExpHttpService) {}
  // 导出
  export(url: string, data: any, fileName: string, fileType?: any) {
    this.httpService.requestBlob(url, data).subscribe(result => {
      this.httpService.downFile(
        result,
        fileName,
        fileType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });
  }
}
