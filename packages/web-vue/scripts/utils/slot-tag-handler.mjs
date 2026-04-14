import * as bt from '@babel/types';
import { Documentation, getDocblock, getDoclets, getProperties } from 'vue-docgen-api';

export function slotTagHandler(documentation, path) {
  if (bt.isObjectExpression(path.node)) {
    const setupPath = getProperties(path, 'setup');

    if (!setupPath.length) {
      return Promise.resolve();
    }

    let commentIndex = 0;
    let docBlock = getDocblock(setupPath[0], { commentIndex });

    while (docBlock) {
      if (!docBlock.length) {
        return Promise.resolve();
      }

      const jsDoc = getDoclets(docBlock);

      if (jsDoc.tags) {
        const slotTag = jsDoc.tags.find((tag) => tag.title === 'slot');

        if (slotTag) {
          const name = typeof slotTag.content === 'string' ? slotTag.content : 'default';
          const slotDescriptor = documentation.getSlotDescriptor(name);
          slotDescriptor.description = jsDoc.description;

          const bindingsTag = jsDoc.tags.filter((tag) => tag.title === 'binding');
          if (bindingsTag.length) {
            slotDescriptor.bindings = bindingsTag;
          }

          const customTags = jsDoc.tags.filter(
            (tag) => tag.title !== 'binding' && tag.title !== 'slot',
          );
          if (customTags.length) {
            slotDescriptor.tags = customTags.reduce((accumulator, item) => {
              accumulator[item.title] = item;
              return accumulator;
            }, {});
          }
        }
      }

      docBlock = getDocblock(setupPath[0], { commentIndex: ++commentIndex });
    }
  }

  return Promise.resolve();
}

export { Documentation };
