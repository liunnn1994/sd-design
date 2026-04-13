import { defineComponent, inject, PropType } from 'vue';

import { getPrefixCls } from '../_utils/global-config';
import IconCheck from '../icon/icon-check';
import IconPause from '../icon/icon-pause';
import IconPlayArrowFill from '../icon/icon-play-arrow-fill';
import IconUpload from '../icon/icon-upload';
import { useI18n } from '../locale';
import Progress from '../progress';
import Tooltip from '../tooltip';
import { uploadInjectionKey } from './context';
import { FileItem, ListType } from './interfaces';
import { getProgressStatus } from './utils';

export default defineComponent({
  name: 'UploadProgress',
  props: {
    file: {
      type: Object as PropType<FileItem>,
      required: true,
    },
    listType: {
      type: String as PropType<ListType>,
      required: true,
    },
  },
  setup(props) {
    const prefixCls = getPrefixCls('upload-progress');
    const { t } = useI18n();

    const uploadCtx = inject(uploadInjectionKey, undefined);

    const renderIcon = () => {
      if (props.file.status === 'error') {
        return (
          <span
            class={[uploadCtx?.iconCls, `${uploadCtx?.iconCls}-upload`]}
            onClick={() => uploadCtx?.onUpload(props.file)}
          >
            {(uploadCtx?.showRetryButton &&
              (uploadCtx?.slots['retry-icon']?.() ?? uploadCtx?.customIcon?.retryIcon?.())) ||
            props.listType === 'picture-card' ? (
              <IconUpload />
            ) : (
              t('upload.retry')
            )}
          </span>
        );
      }
      if (props.file.status === 'done') {
        return (
          <span class={[uploadCtx?.iconCls, `${uploadCtx?.iconCls}-success`]}>
            {uploadCtx?.slots['success-icon']?.() ?? uploadCtx?.customIcon?.successIcon?.() ?? (
              <IconCheck />
            )}
          </span>
        );
      }
      if (props.file.status === 'init') {
        return (
          <Tooltip content={t('upload.start')}>
            <span
              class={[uploadCtx?.iconCls, `${uploadCtx?.iconCls}-start`]}
              onClick={() => uploadCtx?.onUpload(props.file)}
            >
              {uploadCtx?.slots['start-icon']?.() ?? uploadCtx?.customIcon?.startIcon?.() ?? (
                <IconPlayArrowFill />
              )}
            </span>
          </Tooltip>
        );
      }
      return (
        uploadCtx?.showCancelButton && (
          <Tooltip content={t('upload.cancel')}>
            <span
              class={[uploadCtx?.iconCls, `${uploadCtx?.iconCls}-cancel`]}
              onClick={() => uploadCtx?.onAbort(props.file)}
            >
              {uploadCtx?.slots['cancel-icon']?.() ?? uploadCtx?.customIcon?.cancelIcon?.() ?? (
                <IconPause />
              )}
            </span>
          </Tooltip>
        )
      );
    };

    const renderProgress = () => {
      if (['init', 'uploading'].includes(props.file.status ?? '')) {
        const status = getProgressStatus(props.file.status);

        return (
          <Progress
            type="circle"
            size="mini"
            showText={false}
            status={status}
            percent={props.file.percent}
          />
        );
      }

      return null;
    };

    return () => (
      <span class={prefixCls}>
        {renderProgress()}
        {renderIcon()}
      </span>
    );
  },
});
