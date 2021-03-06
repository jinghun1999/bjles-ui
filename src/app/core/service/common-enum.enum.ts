export enum EnumPrivilegeCode {
  SupplierPurchasingInnerOnly = '1',
  SupplierPurchasingOuterOnly = '2',
  PartManageIsDirectOnly = '3',
  PartManagePullTypeOnly = '4',
  PartManagePackingQtyOnly = '5',
}

export enum ENUMSheetType {
  ASN = 0,
  DD = 1,
  JIS = 2,
  TH = 3,
  PDHX = 4,
  YK = 5,
  DB = 6,
  ZJ = 7,
  CYHX = 8,
}

export enum ENUMWMInventoryStatus {
  Draft = 0,
  Published = 1,
  Inventorying = 2,
  Inventoryed = 3,
  Completed = 4,
  ConfirmedDiff = 5,
  Closed = 9,
}
