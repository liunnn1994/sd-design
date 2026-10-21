export interface KvListItem {
  key: string;
  value: string;
}

export interface KvListWorkingItem extends KvListItem {
  id: number;
}
