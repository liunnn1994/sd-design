import dayjs from 'dayjs';

export function getStatisticInitialValue(props: {
  animation: boolean;
  valueFrom?: number;
  value?: number | Date;
}) {
  return props.animation && props.valueFrom !== undefined ? props.valueFrom : props.value;
}

export function getStatisticNumberFormat(precision: number, showGroupSeparator: boolean) {
  return {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
    useGrouping: showGroupSeparator,
  };
}

export const formatStatisticDate = (value: number | Date | undefined, format: string) =>
  format ? dayjs(value).format(format) : value;

export function createStatistic(adapter: {
  readonly props: { animation: boolean; start: boolean; valueFrom?: number; value?: number | Date };
  display: number | Date | undefined;
  afterRender(): Promise<unknown>;
}) {
  return {
    async mount() {
      if (adapter.props.animation && adapter.props.start && adapter.props.valueFrom !== undefined) {
        await adapter.afterRender();
        adapter.display = adapter.props.value;
      }
    },
    syncStart(value: boolean) {
      if (value) adapter.display = adapter.props.value;
    },
    syncValue(value: number | Date | undefined) {
      adapter.display = value;
    },
  };
}
