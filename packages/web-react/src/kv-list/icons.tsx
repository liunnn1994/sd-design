import IconDelete from '../icon/icon-delete.js';
import IconDragDotVertical from '../icon/icon-drag-dot-vertical.js';
import IconEdit from '../icon/icon-edit.js';
import IconList from '../icon/icon-list.js';
import IconPlus from '../icon/icon-plus.js';

const icons = {
  'delete': IconDelete,
  'edit': IconEdit,
  'list': IconList,
  'plus': IconPlus,
  'drag-dot-vertical': IconDragDotVertical,
};
export function KvListIcon({ name }: { name: keyof typeof icons }) {
  const Component = icons[name];
  return <Component aria-hidden="true" />;
}
