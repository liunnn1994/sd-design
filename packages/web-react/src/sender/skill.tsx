import {
  createSenderSkillTag,
  isSenderSkillCloseDisabled,
  resolveSenderSkillTooltip,
} from '@sdata/web-core/sender/controls';

import type { SenderSkill, SenderSlots } from './types.js';

import { usePrefix } from '../config-provider/index.js';
import IconClose from '../icon/icon-close.js';
import { useI18n } from '../locale/index.js';
import { Tooltip } from '../tooltip/index.js';

export function SenderSkillTag({
  skill,
  disabled,
  readonly,
  slots,
  remove,
}: {
  skill: SenderSkill;
  disabled?: boolean | undefined;
  readonly?: boolean;
  slots?: SenderSlots | undefined;
  remove(event: Event): void;
}) {
  const prefix = usePrefix('sender');
  const { t } = useI18n();
  const foundation = createSenderSkillTag(remove);
  const tag = (
    <span className={`${prefix}-skill-tag`} tabIndex={skill.tooltip ? 0 : undefined}>
      <span className={`${prefix}-skill-tag-text`}>
        {slots?.['skill-title'] ? slots['skill-title']({ skill }) : (skill.title ?? skill.value)}
      </span>
      {skill.closable && (
        <span
          className={[
            `${prefix}-skill-tag-close`,
            isSenderSkillCloseDisabled({ skill, disabled, readonly }) &&
              `${prefix}-skill-tag-close-disabled`,
          ]
            .filter(Boolean)
            .join(' ')}
          role="button"
          tabIndex={0}
          aria-label={t('sender.removeSkill')}
          onClick={(event) => {
            event.stopPropagation();
            foundation.remove(event.nativeEvent);
          }}
          onKeyDown={(event) => {
            foundation.keydown(event.nativeEvent);
            if (event.nativeEvent.cancelBubble) event.stopPropagation();
          }}
        >
          {slots?.['skill-close-icon'] ? (
            slots['skill-close-icon']({ skill })
          ) : typeof skill.closable === 'object' && skill.closable.closeIcon ? (
            skill.closable.closeIcon
          ) : (
            <IconClose />
          )}
        </span>
      )}
    </span>
  );
  return skill.tooltip ? <Tooltip {...resolveSenderSkillTooltip(skill)}>{tag}</Tooltip> : tag;
}
