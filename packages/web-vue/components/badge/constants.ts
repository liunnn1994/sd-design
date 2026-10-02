export const COLORS = [
  'red',
  'orangered',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'sdblue',
  'purple',
  'pinkpurple',
  'magenta',
  'gray',
] as const;

export type ColorType = (typeof COLORS)[number];

export const BADGE_STATUSES = ['normal', 'processing', 'success', 'warning', 'danger'] as const;
export type BadgeStatus = (typeof BADGE_STATUSES)[number];
