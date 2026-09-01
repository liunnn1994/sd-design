import type { RegexVisNode, RegexVisTranslate } from './types';

export type RegexVisGraphNode = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  lines: string[];
  description: string;
  variant: 'assertion' | 'character' | 'choice' | 'group';
  node: RegexVisNode;
};

export type RegexVisGraphLabel = {
  id: string;
  x: number;
  y: number;
  text: string;
  variant: 'empty' | 'name';
};

export type RegexVisGraphQuantifier = {
  id: string;
  x: number;
  y: number;
  text: string;
  greedy: boolean;
};

export type RegexVisGraphPath = {
  id: string;
  d: string;
};

export type RegexVisDiagram = {
  width: number;
  height: number;
  nodes: RegexVisGraphNode[];
  labels: RegexVisGraphLabel[];
  quantifiers: RegexVisGraphQuantifier[];
  paths: RegexVisGraphPath[];
  startY: number;
};

type Block = Omit<RegexVisDiagram, 'startY'> & { centerY: number };

const NODE_HEIGHT = 28;
const NODE_GAP = 25;
const BRANCH_GAP = 20;
const MIN_BLOCK_WIDTH = 48;
const NODE_PADDING_X = 20;
const QUANTIFIER_HEIGHT = 24;
const QUANTIFIER_ICON_WIDTH = 16;
const QUANTIFIER_GAP = 4;
const NODE_LINE_HEIGHT = 20;
const NODE_PADDING_Y = 4;
const NAME_HEIGHT = 20;

let shapeId = 0;

const nextShapeId = (prefix: string) => `${prefix}-${shapeId++}`;

const truncate = (value: string, length = 24) => {
  const characters = [...value];
  return characters.length > length ? `${characters.slice(0, length - 1).join('')}…` : value;
};

const quote = (value: string) => `"${truncate(value)}"`;

// 节点标签宽度估算：CJK 等全角字符按 ~1.75 倍 ASCII 宽度计，保证节点矩形能容纳标签
const estimateLabelWidth = (label: string) =>
  [...label].reduce((width, char) => width + (char.charCodeAt(0) > 0xff ? 14 : 8), 0);

const getQuantifier = (node: RegexVisNode) => ('quantifier' in node ? node.quantifier : null);

const formatQuantifier = (node: RegexVisNode) => {
  const quantifier = getQuantifier(node);
  if (!quantifier) return undefined;

  const { min, max } = quantifier;
  return min === max ? `${min}` : `${min} - ${max === Infinity ? '∞' : max}`;
};

const characterClassLabelKeys: Record<string, string> = {
  '.': 'regexVis.anyCharacter',
  '\\d': 'regexVis.anyDigit',
  '\\D': 'regexVis.nonDigit',
  '\\w': 'regexVis.anyAlphanumeric',
  '\\W': 'regexVis.nonAlphanumeric',
  '\\s': 'regexVis.whiteSpace',
  '\\S': 'regexVis.nonWhiteSpace',
  '\\t': 'regexVis.horizontalTab',
  '\\r': 'regexVis.carriageReturn',
  '\\n': 'regexVis.linefeed',
  '\\v': 'regexVis.verticalTab',
  '\\f': 'regexVis.formFeed',
  '[\\b]': 'regexVis.backspace',
  '\\0': 'regexVis.nul',
};

const formatRanges = (node: Extract<RegexVisNode, { type: 'character'; kind: 'ranges' }>) => {
  return node.raw;
};

const formatRangeEndpoint = (value: string, t: RegexVisTranslate) => {
  const key = characterClassLabelKeys[value];
  return key ? t(key) : value;
};

const formatRangeLines = (
  node: Extract<RegexVisNode, { type: 'character'; kind: 'ranges' }>,
  t: RegexVisTranslate,
) => {
  const singleCharacters = new Set<string>();
  const lines: string[] = [];

  node.ranges.forEach(({ from, to }) => {
    if (from.length === 1) {
      if (from === to) {
        singleCharacters.add(from);
      } else {
        lines.push(`${quote(from)} - ${quote(to)}`);
      }
      return;
    }

    const fromText = formatRangeEndpoint(from, t);
    if (from === to) {
      lines.push(fromText);
    } else {
      lines.push(`${fromText} - ${formatRangeEndpoint(to, t)}`);
    }
  });

  if (singleCharacters.size > 0) {
    lines.push(quote([...singleCharacters].join('')));
  }

  return lines;
};

const getRegexVisNodeLines = (node: RegexVisNode, t: RegexVisTranslate) =>
  node.type === 'character' && node.kind === 'ranges'
    ? formatRangeLines(node, t)
    : [getRegexVisNodeLabel(node, t)];

export const getRegexVisNodeLabel = (node: RegexVisNode, t: RegexVisTranslate): string => {
  switch (node.type) {
    case 'character':
      if (node.kind === 'ranges') return formatRanges(node);
      if (node.kind === 'class') {
        const key = characterClassLabelKeys[node.value];
        return key ? t(key) : node.value;
      }
      return quote(node.value);
    case 'backReference':
      return t('regexVis.backReference', truncate(node.ref));
    case 'boundaryAssertion':
      if (node.kind === 'beginning') return t('regexVis.stringStart');
      if (node.kind === 'end') return t('regexVis.stringEnd');
      return node.negate ? t('regexVis.notWordBoundary') : t('regexVis.wordBoundary');
    case 'group':
      if (node.kind === 'namedCapturing') return t('regexVis.namedGroup', truncate(node.name));
      return node.kind === 'capturing'
        ? t('regexVis.captureGroup', node.index)
        : t('regexVis.nonCaptureGroup');
    case 'lookAroundAssertion':
      return t(
        node.negate
          ? node.kind === 'lookahead'
            ? 'regexVis.negativeLookahead'
            : 'regexVis.negativeLookbehind'
          : node.kind === 'lookahead'
            ? 'regexVis.positiveLookahead'
            : 'regexVis.positiveLookbehind',
      );
    case 'choice':
      return t('regexVis.branch');
    case 'root':
      return t('regexVis.root');
  }
};

export const getRegexVisNodeDescription = (node: RegexVisNode, t: RegexVisTranslate) => {
  switch (node.type) {
    case 'character':
      if (node.kind === 'class') return t('regexVis.charClass', node.value);
      if (node.kind === 'ranges') return t('regexVis.charRange', formatRanges(node));
      return t('regexVis.text', node.value);
    case 'backReference':
      return t('regexVis.backReferenceDescription', node.ref);
    case 'boundaryAssertion':
    case 'group':
    case 'lookAroundAssertion':
      return getRegexVisNodeLabel(node, t);
    case 'choice':
      return t('regexVis.choiceBranches', node.branches.length);
    case 'root':
      return t('regexVis.regexDescription');
  }
};

const translateBlock = (block: Block, dx: number, dy: number): Block => ({
  width: block.width,
  height: block.height,
  centerY: block.centerY + dy,
  nodes: block.nodes.map((node) => ({ ...node, x: node.x + dx, y: node.y + dy })),
  labels: block.labels.map((label) => ({ ...label, x: label.x + dx, y: label.y + dy })),
  quantifiers: block.quantifiers.map((quantifier) => ({
    ...quantifier,
    x: quantifier.x + dx,
    y: quantifier.y + dy,
  })),
  paths: block.paths.map((path) => ({ ...path, d: translatePath(path.d, dx, dy) })),
});

const translatePath = (path: string, dx: number, dy: number) =>
  path.replace(
    /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g,
    (_, x: string, y: string) => `${Number(x) + dx},${Number(y) + dy}`,
  );

const createLeaf = (node: RegexVisNode, t: RegexVisTranslate): Block => {
  const label = getRegexVisNodeLabel(node, t);
  const lines = getRegexVisNodeLines(node, t);
  const name =
    node.type === 'character' && node.kind === 'ranges'
      ? t(node.negate ? 'regexVis.noneOf' : 'regexVis.oneOf')
      : undefined;
  const quantifierText = formatQuantifier(node);
  const quantifierWidth = quantifierText
    ? QUANTIFIER_ICON_WIDTH + QUANTIFIER_GAP + estimateLabelWidth(quantifierText)
    : 0;
  const contentWidth = Math.max(20, Math.max(...lines.map(estimateLabelWidth)) + NODE_PADDING_X);
  const contentHeight = Math.max(NODE_HEIGHT, lines.length * NODE_LINE_HEIGHT + NODE_PADDING_Y * 2);
  const nameHeight = name ? NAME_HEIGHT : 0;
  const width = Math.max(contentWidth, quantifierWidth, name ? estimateLabelWidth(name) : 0);
  const contentX = (width - contentWidth) / 2;
  const centerY = nameHeight + contentHeight / 2;
  const variant =
    node.type === 'boundaryAssertion'
      ? 'assertion'
      : node.type === 'character' || node.type === 'backReference'
        ? 'character'
        : 'group';

  return {
    width,
    height: nameHeight + contentHeight + (quantifierText ? QUANTIFIER_HEIGHT : 0),
    centerY,
    paths:
      contentX === 0
        ? []
        : [
            {
              id: nextShapeId('path'),
              d: `M0,${centerY} L${contentX},${centerY}`,
            },
            {
              id: nextShapeId('path'),
              d: `M${contentX + contentWidth},${centerY} L${width},${centerY}`,
            },
          ],
    labels: name
      ? [
          {
            id: nextShapeId('name'),
            x: width / 2,
            y: NAME_HEIGHT / 2,
            text: name,
            variant: 'name',
          },
        ]
      : [],
    quantifiers: quantifierText
      ? [
          {
            id: nextShapeId('quantifier'),
            x: (width - quantifierWidth) / 2,
            y: nameHeight + contentHeight + 2,
            text: quantifierText,
            greedy: Boolean(getQuantifier(node)?.greedy),
          },
        ]
      : [],
    nodes: [
      {
        id: node.id,
        x: contentX,
        y: nameHeight,
        width: contentWidth,
        height: contentHeight,
        label,
        lines,
        description: getRegexVisNodeDescription(node, t),
        variant,
        node,
      },
    ],
  };
};

const createEmptyBlock = (t: RegexVisTranslate): Block => ({
  width: MIN_BLOCK_WIDTH,
  height: NODE_HEIGHT,
  centerY: NODE_HEIGHT / 2,
  nodes: [],
  quantifiers: [],
  labels: [
    {
      id: nextShapeId('empty'),
      x: MIN_BLOCK_WIDTH / 2,
      y: NODE_HEIGHT / 2,
      text: t('regexVis.emptyBranch'),
      variant: 'empty',
    },
  ],
  paths: [
    {
      id: nextShapeId('path'),
      d: `M0,${NODE_HEIGHT / 2} L${MIN_BLOCK_WIDTH},${NODE_HEIGHT / 2}`,
    },
  ],
});

const createSequence = (nodes: RegexVisNode[], t: RegexVisTranslate): Block => {
  if (nodes.length === 0) return createEmptyBlock(t);

  const blocks = nodes.map((node) => createNodeBlock(node, t));
  const centerY = Math.max(...blocks.map((block) => block.centerY));
  const height = centerY + Math.max(...blocks.map((block) => block.height - block.centerY));
  const result: Block = {
    width: 0,
    height,
    centerY,
    nodes: [],
    labels: [],
    quantifiers: [],
    paths: [],
  };

  blocks.forEach((block, index) => {
    const translated = translateBlock(block, result.width, centerY - block.centerY);
    result.nodes.push(...translated.nodes);
    result.labels.push(...translated.labels);
    result.quantifiers.push(...translated.quantifiers);
    result.paths.push(...translated.paths);
    result.width += block.width;

    if (index < blocks.length - 1) {
      result.paths.push({
        id: nextShapeId('path'),
        d: `M${result.width},${centerY} L${result.width + NODE_GAP},${centerY}`,
      });
      result.width += NODE_GAP;
    }
  });

  return result;
};

const createGroup = (
  node: Extract<RegexVisNode, { type: 'group' | 'lookAroundAssertion' }>,
  t: RegexVisTranslate,
): Block => {
  const child = createSequence(node.children, t);
  const label = getRegexVisNodeLabel(node, t);
  const quantifierText = formatQuantifier(node);
  const paddingX = 24;
  const paddingTop = 36;
  const paddingBottom = 12;
  // 标签从 x=20 开始，矩形右边缘为 width-8；额外保留 12px 右侧空间。
  const contentWidth = Math.max(child.width + paddingX * 2, estimateLabelWidth(label) + 40);
  const contentHeight = child.height + paddingTop + paddingBottom;
  const quantifierWidth = quantifierText
    ? QUANTIFIER_ICON_WIDTH + QUANTIFIER_GAP + estimateLabelWidth(quantifierText)
    : 0;
  const width = Math.max(contentWidth, quantifierWidth);
  const height = contentHeight + (quantifierText ? QUANTIFIER_HEIGHT : 0);
  const centerY = paddingTop + child.centerY;
  const childX = (width - child.width) / 2;
  const translated = translateBlock(child, childX, paddingTop);

  return {
    width,
    height,
    centerY,
    nodes: [
      {
        id: node.id,
        x: 8,
        y: 1,
        width: width - 16,
        height: contentHeight - 2,
        label,
        lines: [label],
        description: getRegexVisNodeDescription(node, t),
        variant: 'group',
        node,
      },
      ...translated.nodes,
    ],
    labels: translated.labels,
    quantifiers: quantifierText
      ? [
          ...translated.quantifiers,
          {
            id: nextShapeId('quantifier'),
            x: (width - quantifierWidth) / 2,
            y: contentHeight + 2,
            text: quantifierText,
            greedy: Boolean(getQuantifier(node)?.greedy),
          },
        ]
      : translated.quantifiers,
    paths: [
      { id: nextShapeId('path'), d: `M0,${centerY} L${childX},${centerY}` },
      {
        id: nextShapeId('path'),
        d: `M${childX + child.width},${centerY} L${width},${centerY}`,
      },
      ...translated.paths,
    ],
  };
};

const createChoice = (
  node: Extract<RegexVisNode, { type: 'choice' }>,
  t: RegexVisTranslate,
): Block => {
  const branches = node.branches.map((branch) => createSequence(branch, t));
  const innerWidth = Math.max(...branches.map((branch) => branch.width));
  const paddingX = 32;
  const paddingTop = 32;
  const label = getRegexVisNodeLabel(node, t);
  const contentHeight =
    branches.reduce((height, branch) => height + branch.height, 0) +
    Math.max(0, branches.length - 1) * BRANCH_GAP;
  const height = contentHeight + paddingTop + 12;
  const width = Math.max(innerWidth + paddingX * 2, estimateLabelWidth(label) + 40);
  const centerY = height / 2;
  const nodes: RegexVisGraphNode[] = [
    {
      id: node.id,
      x: 8,
      y: 1,
      width: width - 16,
      height: height - 2,
      label,
      lines: [label],
      description: getRegexVisNodeDescription(node, t),
      variant: 'choice',
      node,
    },
  ];
  const labels: RegexVisGraphLabel[] = [];
  const quantifiers: RegexVisGraphQuantifier[] = [];
  const paths: RegexVisGraphPath[] = [];
  let currentY = paddingTop;

  branches.forEach((branch) => {
    const branchX = paddingX + (innerWidth - branch.width) / 2;
    const translated = translateBlock(branch, branchX, currentY);
    const branchY = currentY + branch.centerY;
    nodes.push(...translated.nodes);
    labels.push(...translated.labels);
    quantifiers.push(...translated.quantifiers);
    paths.push(...translated.paths);
    paths.push({
      id: nextShapeId('path'),
      d: `M0,${centerY} C${paddingX / 2},${centerY} ${paddingX / 2},${branchY} ${branchX},${branchY}`,
    });
    paths.push({
      id: nextShapeId('path'),
      d: `M${branchX + branch.width},${branchY} C${width - paddingX / 2},${branchY} ${width - paddingX / 2},${centerY} ${width},${centerY}`,
    });
    currentY += branch.height + BRANCH_GAP;
  });

  return { width, height, centerY, nodes, labels, quantifiers, paths };
};

const createNodeBlock = (node: RegexVisNode, t: RegexVisTranslate): Block => {
  if (node.type === 'choice') return createChoice(node, t);
  if (node.type === 'group' || node.type === 'lookAroundAssertion') return createGroup(node, t);
  return createLeaf(node, t);
};

export const createRegexVisDiagram = (
  nodes: RegexVisNode[],
  t: RegexVisTranslate,
): RegexVisDiagram => {
  shapeId = 0;
  const body = createSequence(nodes, t);
  const side = 36;
  const translated = translateBlock(body, side, 12);
  const startY = translated.centerY;

  return {
    width: body.width + side * 2,
    height: body.height + 24,
    startY,
    nodes: translated.nodes,
    labels: translated.labels,
    quantifiers: translated.quantifiers,
    paths: [
      { id: nextShapeId('path'), d: `M8,${startY} L${side},${startY}` },
      {
        id: nextShapeId('path'),
        d: `M${side + body.width},${startY} L${side * 2 + body.width - 8},${startY}`,
      },
      ...translated.paths,
    ],
  };
};
