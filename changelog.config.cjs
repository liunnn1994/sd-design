module.exports = {
  list: [
    'build',
    'chore',
    'ci',
    'docs',
    'feat',
    'fix',
    'perf',
    'refactor',
    'revert',
    'style',
    'test',
    'wip',
    'release',
  ],
  types: {
    build: {
      description: '修改项目构建系统，例如修改依赖库、外部接口或者升级 Node 版本等',
      emoji: '🏗️',
      value: 'build',
    },
    chore: {
      description: '杂活，例如构建流程或辅助工具变更',
      emoji: '🧹',
      value: 'chore',
    },
    ci: {
      description: '与 CI 有关的更改',
      emoji: '🤖',
      value: 'ci',
    },
    docs: {
      description: '仅更改文档',
      emoji: '✏️',
      value: 'docs',
    },
    feat: {
      description: '新功能',
      emoji: '🆕',
      value: 'feat',
    },
    fix: {
      description: 'Bug 修复',
      emoji: '🐛',
      value: 'fix',
    },
    perf: {
      description: '改进性能的代码变更',
      emoji: '⚡️',
      value: 'perf',
    },
    refactor: {
      description: '重构生产代码，例如重命名变量',
      emoji: '💡',
      value: 'refactor',
    },
    release: {
      description: '创建版本提交',
      emoji: '🔢',
      value: 'release',
    },
    style: {
      description: '格式化、缺少分号等；无生产代码变更',
      emoji: '{};',
      value: 'style',
    },
    test: {
      description: '添加缺少的测试',
      emoji: '🧪',
      value: 'test',
    },
    wip: {
      description: 'Work in progress',
      emoji: '👷',
      value: 'wip',
    },
    revert: {
      description: '撤回之前的 commit',
      emoji: '🔙',
      value: 'revert',
    },
  },
  messages: {
    type: '选择您要提交的更改类型：',
    customScope: '选择此组件影响的范围：',
    subject: '请用简短的语句描述这一变化：\n',
    body: '对更改进行更详细的描述：\n ',
    breaking: '列出破坏性变更：\n',
    issues: '此提交关闭的 issues,例如 #123：',
    confirmCommit: '此提交影响的软件包\n',
  },
};
