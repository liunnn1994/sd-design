import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _AvatarGroup from './avatar-group';
import _Avatar from './avatar.vue';

const Avatar = Object.assign(_Avatar, {
  Group: _AvatarGroup,
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _Avatar.name, _Avatar);
    app.component(componentPrefix + _AvatarGroup.name, _AvatarGroup);
  },
});

export type AvatarInstance = InstanceType<typeof _Avatar>;
export type AvatarGroupInstance = InstanceType<typeof _AvatarGroup>;

export { _AvatarGroup as AvatarGroup };

export default Avatar;
