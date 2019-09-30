export class PageInfo {
  pi = 1;
  ps = 10;
  export = false;
}

export class PagerConfig {
  total = ''; // 分页显示多少条数据，字符串型
  show = true; // 显示分页
  front = false; // 关闭前端分页，true是前端分页，false后端控制分页
  showSize = true;
  pageSizes = [10, 30, 50, 100];
  // position = `both`;
}

export class SortInfo {
  field = '';
  order = '';
}

export class ItemData {
  last_workshop = '';
  data = [];
}
