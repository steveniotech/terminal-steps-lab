import { HOME, getNode } from './filesystem.js';

export const unit1Tasks = [
  { id: 'where-am-i', unit: 'unit1', unitTitle: '单元 1 · 我在哪里', title: '用 pwd 确认当前位置', goal: '先确认你现在位于哪个目录，再继续其他操作。', concept: '当前目录 (working directory)', initialCwd: HOME, initialFsMode: 'unit1', checklist: ['成功执行 pwd', '输出为 /home/steven'], hints: ['想法：先询问模拟终端“我现在在哪里”。', '命令结构：pwd', '完整命令：pwd —— 显示当前绝对路径。'], errors: '如果路径不对，先重置本关；不要用浏览器地址猜测终端目录。', summary: '你已经能用 pwd 建立位置感，这是排查“文件在哪里”的第一步。', check: ({ command, result }) => command === 'pwd' && result.ok && result.output === HOME },
  { id: 'list-home', unit: 'unit1', unitTitle: '单元 1 · 我在哪里', title: '用 ls 查看当前位置内容', goal: '查看 home 目录里有哪些课程相关内容，不直接猜文件名。', concept: '列出目录 (list)', initialCwd: HOME, initialFsMode: 'unit1', checklist: ['成功执行 ls', '输出包含 lessons 和 projects'], hints: ['想法：先查看当前目录的清单。', '命令结构：ls', '完整命令：ls —— 列出当前目录内容；你应能看到 lessons 和 projects。'], errors: 'ls 不会进入目录，只会列出它；先观察输出再决定下一步。', summary: '你已经能先观察目录，再决定路径，减少盲目输入。', check: ({ command, result }) => command === 'ls' && result.ok && result.output.includes('lessons') && result.output.includes('projects') },
  { id: 'enter-lessons', unit: 'unit1', unitTitle: '单元 1 · 我在哪里', title: '找到并进入 lessons', goal: '根据目录内容判断路径，进入课程资料目录。', concept: '相对路径 (relative path)', initialCwd: HOME, initialFsMode: 'unit1', checklist: ['成功执行 cd', '当前目录变为 /home/steven/lessons'], hints: ['想法：lessons 是当前目录中的目录，使用它作为 cd 的目标。', '命令结构：cd 目录路径', '完整命令：cd lessons —— 从当前目录进入 lessons。'], errors: '请先用 ls 确认名称；cd 到文件会报类型错误，拼写不对会保持原目录。', summary: '你已经能把 ls 的观察结果转成 cd 的路径操作。', check: ({ command, result }) => (command === 'cd lessons' || command === 'cd ./lessons' || command === 'cd lessons/') && result.ok && result.output === `${HOME}/lessons` },
  { id: 'return-parent', unit: 'unit1', unitTitle: '单元 1 · 我在哪里', title: '返回上级并确认位置', goal: '从 lessons 返回上级目录，并用 pwd 验证结果。', concept: '上级目录 (parent directory)', initialCwd: `${HOME}/lessons`, initialFsMode: 'unit1', checklist: ['先成功执行 cd ..', '之后成功执行 pwd', '最终位置为 /home/steven'], hints: ['想法：先使用 .. 返回上一级，再询问当前位置。', '命令结构：cd ..，然后 pwd', '完整操作：cd .. → pwd —— .. 表示当前目录的上级，pwd 用来验证。'], errors: '仅仅停留在 home 不算完成；必须记录本关中先执行 cd ..，再用 pwd 确认。', summary: '你已经能执行“移动后验证”的安全习惯，之后处理更复杂目录时也应保留这个步骤。', check: ({ state }) => state.cwd === HOME && state.successfulCommands.includes('cd ..') && state.successfulCommands.includes('pwd') }
];

export const unit2Tasks = [
  { id: 'make-course-dir', unit: 'unit2', unitTitle: '单元 2 · 建立课程工作区', title: '创建课程目录', goal: '在 projects 中建立一个名为 summer-camp 的课程目录。', concept: '创建目录 (make directory)', initialCwd: HOME, initialFsMode: 'unit2-mkdir', checklist: ['成功执行 mkdir', 'projects/summer-camp 存在且是目录'], hints: ['想法：目标位置是 projects，目录名是 summer-camp。', '命令结构：mkdir 目录路径', '完整命令：mkdir projects/summer-camp —— 创建一个新目录，不覆盖已有对象。'], errors: 'mkdir 只创建目录；目标已存在或父目录不存在时，文件系统不会改变。', summary: '你已经能为课程资料建立明确的工作区。', check: ({ state }) => getNode(state.root, `${HOME}/projects/summer-camp`)?.type === 'dir' && state.successfulCommands.some(command => command.split(/\s+/)[0] === 'mkdir') },
  { id: 'make-session-file', unit: 'unit2', unitTitle: '单元 2 · 建立课程工作区', title: '创建课程记录文件', goal: '在 robotics 目录中创建一个空的 session-record.txt 文件。', concept: '创建文件 (touch)', initialCwd: `${HOME}/lessons/robotics`, initialFsMode: 'unit2-touch', checklist: ['成功执行 touch', '目标是文件且内容为空'], hints: ['想法：你已经位于 robotics；需要一个新的空文件。', '命令结构：touch 文件名', '完整命令：touch session-record.txt —— 创建空文件；已有文件内容不会被清空。'], errors: 'touch 的目标必须是文件路径；本轮不模拟时间戳。', summary: '你已经能创建一个可供课程记录使用的空文件。', check: ({ state }) => { const node = getNode(state.root, `${HOME}/lessons/robotics/session-record.txt`); return node?.type === 'file' && node.content === '' && state.successfulCommands.some(command => command.split(/\s+/)[0] === 'touch'); } },
  { id: 'copy-template', unit: 'unit2', unitTitle: '单元 2 · 建立课程工作区', title: '复制教案模板', goal: '把 lessons 中的 course-template.md 复制到 robotics 课程目录。', concept: '复制并保留原件 (copy)', initialCwd: `${HOME}/lessons`, initialFsMode: 'unit2-copy', checklist: ['目标文件存在且内容正确', '源文件仍存在且内容没有变化'], hints: ['想法：源文件在当前 lessons，目标是已有的 robotics 目录。', '命令结构：cp 源文件 目标目录', '完整命令：cp course-template.md robotics —— 复制到 robotics，并保留源文件。'], errors: 'cp 本轮只复制单个文件且拒绝覆盖；目录复制和多个源文件尚未支持。', summary: '你已经能复制模板，同时保留一份可复用的原件。', check: ({ state }) => { const source = getNode(state.root, `${HOME}/lessons/course-template.md`); const target = getNode(state.root, `${HOME}/lessons/robotics/course-template.md`); return source?.type === 'file' && target?.type === 'file' && source.content === target.content && state.successfulCommands.some(command => command.split(/\s+/)[0] === 'cp'); } },
  { id: 'move-session-file', unit: 'unit2', unitTitle: '单元 2 · 建立课程工作区', title: '移动并重命名课程记录', goal: '把 session-record.md 移到 archive，并改名为 robotics-session-final.md。', concept: '移动或重命名 (move/rename)', initialCwd: `${HOME}/lessons/robotics`, initialFsMode: 'unit2-move', checklist: ['目标文件存在且内容保持不变', '原路径不存在', '成功执行 mv'], hints: ['想法：archive 已经存在，目标名称需要同时写在目标路径中。', '命令结构：mv 原文件 archive/新文件名', '完整命令：mv session-record.md archive/robotics-session-final.md —— 移动并重命名，原路径消失。'], errors: 'mv 本轮只处理单个文件且拒绝覆盖；失败时源文件必须保持原样。', summary: '你已经能把课程记录整理到归档目录，并在操作后确认原路径已消失。', check: ({ state }) => { const source = getNode(state.root, `${HOME}/lessons/robotics/session-record.md`); const target = getNode(state.root, `${HOME}/lessons/robotics/archive/robotics-session-final.md`); return !source && target?.type === 'file' && target.content.includes('观察') && state.successfulCommands.some(command => command.split(/\s+/)[0] === 'mv'); } }
];

export const unit3Tasks = [
  { id: 'read-course-overview', unit: 'unit3', unitTitle: '单元 3 · 阅读与搜索', title: '阅读课程说明', goal: '使用 cat 阅读课程说明，理解读取内容不会修改文件。', concept: '读取文件 (read file)', initialCwd: `${HOME}/lessons`, initialFsMode: 'unit3-cat', checklist: ['成功执行 cat', '显示课程说明原文', '文件内容没有被修改'], hints: ['想法：课程说明就在当前 lessons 目录中，先读取它。', '命令结构：cat 文件路径', '完整命令：cat course-overview.txt —— 原样显示一个文本文件。'], errors: 'cat 只能读取一个文件；目标不存在或是目录时不会改变文件系统。', summary: '你已经能直接阅读文本文件，并区分“读取”与“修改”。', check: ({ state }) => { const entry = state.output.find(item => item.cat && item.path === `${HOME}/lessons/course-overview.txt`); const node = getNode(state.root, `${HOME}/lessons/course-overview.txt`); return Boolean(entry && entry.output.includes('读取文件不会修改文件内容。') && node?.content.includes('课程说明')); } },
  { id: 'search-course-keyword', unit: 'unit3', unitTitle: '单元 3 · 阅读与搜索', title: '查找课程关键词', goal: '使用 grep 找出 keyword-notes.txt 中包含 robotics 的完整行。', concept: '字面搜索 (literal search)', initialCwd: `${HOME}/lessons`, initialFsMode: 'unit3-grep', checklist: ['成功执行 grep', '返回包含 robotics 的完整行', '同一行只输出一次'], hints: ['想法：关键词是 robotics，文件是 keyword-notes.txt。', '命令结构：grep 关键词 文件', '完整命令：grep robotics keyword-notes.txt —— 默认区分大小写并返回匹配整行。'], errors: '本轮 grep 是字面搜索子集，不是完整正则表达式；无匹配仍是有效结果。', summary: '你已经能从课程资料中定位包含关键词的整行内容。', check: ({ state }) => { const entry = state.output.find(item => item.grep && item.path === `${HOME}/lessons/keyword-notes.txt`); return Boolean(entry && entry.matchedLines.length === 2 && entry.matchedLines.every(line => line.includes('robotics'))); } },
  { id: 'compare-case-search', unit: 'unit3', unitTitle: '单元 3 · 阅读与搜索', title: '比较大小写搜索', goal: '先用默认 grep，再用 grep -i 比较大小写敏感与忽略大小写的差别。', concept: '忽略大小写 (case-insensitive)', initialCwd: `${HOME}/lessons`, initialFsMode: 'unit3-case', checklist: ['默认 grep 找到小写匹配', 'grep -i 找到三种大小写', '理解两次输出不同'], hints: ['想法：同一个关键词分别用默认模式和 -i 搜索。', '命令结构：grep 关键词 文件；grep -i 关键词 文件', '完整操作：grep python case-notes.txt → grep -i python case-notes.txt；-i 表示忽略大小写。'], errors: '只有 -i 会忽略大小写；本轮不支持其他 grep 选项或正则表达式。', summary: '你已经能根据任务需要选择区分大小写或忽略大小写的搜索。', check: ({ state }) => { const normal = state.output.find(item => item.grep && !item.ignoreCase && (item.keyword === 'python' || item.command?.match(/^grep\s+["']?python["']?(?:\s|$)/))); const insensitive = state.output.find(item => item.grep && item.ignoreCase && (item.keyword === 'python' || item.command?.match(/^grep\s+-i\s+["']?python["']?(?:\s|$)/))); return Boolean(normal?.matchedLines.length === 1 && insensitive?.matchedLines.length === 3 && insensitive.output !== normal.output); } },
  { id: 'count-log-matches', unit: 'unit3', unitTitle: '单元 3 · 阅读与搜索', title: '统计日志中的匹配行', goal: '使用有限管道统计日志中包含 ERROR 的匹配行数量。', concept: '管道 (pipe) 与匹配行计数', initialCwd: `${HOME}/lessons`, initialFsMode: 'unit3-pipeline', checklist: ['成功执行 grep ... | wc -l', '输出为 3', '统计的是匹配行，不是关键词出现次数'], hints: ['想法：先让 grep 输出包含 ERROR 的行，再把这些行交给 wc -l。', '命令结构：grep 关键词 文件 | wc -l', '完整命令：grep ERROR logs/lesson-run.log | wc -l —— 统计 grep 实际输出的匹配行。'], errors: '单独执行 wc -l 不满足本任务；本轮只支持 grep [-i] 关键词 文件 | wc -l。', summary: '你已经能把搜索和行数统计连接起来，同时知道匹配行不等于关键词出现次数。', check: ({ state }) => { const entry = state.output.find(item => item.pipeline && item.command?.includes('wc -l')); return Boolean(entry && entry.output === '3' && entry.matchedLines.length === 3); } }
];

export const unit4Tasks = [
  {
    id: 'cant-open-file',
    unit: 'unit4',
    unitTitle: '单元 4 · 排错与独立挑战',
    title: '我为什么打不开文件？',
    goal: '直接读取文件会报错；请观察当前位置、理解目录结构，并正确读取 course-overview.txt。',
    concept: '路径排错 (path troubleshooting)',
    initialCwd: HOME,
    initialFsMode: 'unit4-open',
    checklist: ['理解当前所在目录与目标文件路径差异', '成功读取 lessons/course-overview.txt 内容', '确认文本包含课程总览与准备指南'],
    hints: [
      '第一级提示（观察）：先用 pwd 确认你当前在哪个目录，再用 ls 看看当前目录下有没有这个文件。',
      '第二级提示（概念）：文件在 lessons 目录中。你可以先 cd lessons 再 cat，也可以直接用相对路径或绝对路径读取。',
      '第三级提示（示例）：直接输入 cat lessons/course-overview.txt，或者先 cd lessons 再输入 cat course-overview.txt。'
    ],
    errors: 'cat 提示“文件不存在”说明当前工作目录没有该文件；请检查路径或先进入目标目录。',
    summary: '你掌握了排查“文件找不到”的关键习惯：先确认位置（pwd）和目录内容（ls），再给出正确的相对或绝对路径。',
    check: ({ state }) => {
      const entry = state.output.find(item => item.cat && item.path === `${HOME}/lessons/course-overview.txt`);
      return Boolean(entry && entry.ok && entry.output.includes('课程总览与准备指南'));
    }
  },
  {
    id: 'fix-typo-filename',
    unit: 'unit4',
    unitTitle: '单元 4 · 排错与独立挑战',
    title: '更正拼写错误的文件名',
    goal: 'robotics 目录中有一个拼写错误的文件 session-reocrd.md，请找到并使用 mv 将其更正为 session-record.md。',
    concept: '更正文件名 (rename with mv)',
    initialCwd: `${HOME}/lessons/robotics`,
    initialFsMode: 'unit4-rename',
    checklist: ['原拼写错误文件 session-reocrd.md 不再存在', '更正后的 session-record.md 存在且内容完好', '成功执行 mv 命令且未覆盖已有文件'],
    hints: [
      '第一级提示（观察）：运行 ls 仔细查看当前目录下的文件名拼写，找到敲错字母的文件。',
      '第二级提示（概念）：在命令行中没有独立的 rename 命令，重命名文件也是使用 mv 源路径 目标路径。',
      '第三级提示（示例）：运行 mv session-reocrd.md session-record.md。'
    ],
    errors: '请仔细核对原文件名与新文件名拼写；mv 需要提供源文件和目标路径两个参数。',
    summary: '你理解了在终端中“重命名”就是使用 mv 将文件移动到同一目录下的新名字，并确认了原路径消失。',
    check: ({ state }) => {
      const oldFile = getNode(state.root, `${HOME}/lessons/robotics/session-reocrd.md`);
      const newFile = getNode(state.root, `${HOME}/lessons/robotics/session-record.md`);
      return !oldFile && newFile?.type === 'file' && newFile.content.includes('机械臂初装') && state.successfulCommands.some(cmd => cmd.split(/\s+/)[0] === 'mv');
    }
  },
  {
    id: 'grep-hardware-log',
    unit: 'unit4',
    unitTitle: '单元 4 · 排错与独立挑战',
    title: '从记录里找线索',
    goal: '硬件测试日志保存在 logs/hardware-check.log 中，请使用 grep 与管道组合统计其中包含 WARN 的告警行数。',
    concept: '日志排错与管道统计 (grep & pipeline)',
    initialCwd: `${HOME}/lessons`,
    initialFsMode: 'unit4-log',
    checklist: ['成功执行 grep ... | wc -l', '正确过滤包含 WARN 的日志行', '输出告警行数为 3'],
    hints: [
      '第一级提示（观察）：日志文件位于 logs 目录下的 hardware-check.log。',
      '第二级提示（概念）：使用 grep 筛选包含 WARN 的行，通过管道 | 传递给 wc -l 统计匹配行数。',
      '第三级提示（示例）：运行 grep WARN logs/hardware-check.log | wc -l（若进入 logs 则输入 grep WARN hardware-check.log | wc -l）。'
    ],
    errors: '本轮管道只支持 grep 关键词 文件 | wc -l；请确保关键词为 WARN 且路径正确。',
    summary: '你已经能结合使用 grep 与 wc -l 从运行日志中筛选并统计异常记录，这是日常排错的重要组合技。',
    check: ({ state }) => {
      const entry = state.output.find(item => item.pipeline && item.matchedLines && item.matchedLines.every(l => l.includes('WARN')) && item.output === '3');
      return Boolean(entry && entry.matchedLines.length === 3);
    }
  },
  {
    id: 'organize-workspace',
    unit: 'unit4',
    unitTitle: '单元 4 · 排错与独立挑战',
    title: '独立整理课程工作区',
    goal: '整理 starter 目录：创建 docs 与 records 目录，复制 template.md 到 docs 保留原件，移动 notes-draft.txt 到 records 并更名为 lesson-01.txt。',
    concept: '综合文件系统整理 (independent workflow)',
    initialCwd: `${HOME}/projects/starter`,
    initialFsMode: 'unit4-organize',
    checklist: [
      '创建 docs 和 records 两个子目录',
      'template.md 被复制到 docs/template.md，原模板依然保留',
      'notes-draft.txt 被移动为 records/lesson-01.txt，原文件不再存在',
      '原始说明文件 readme.txt 保持完好'
    ],
    hints: [
      '第一级提示（观察）：先运行 ls 查看当前 starter 目录有哪些文件，阅读 readme.txt 了解整理目标。',
      '第二级提示（概念）：用 mkdir 创建目录；用 cp 复制模板保留原件；用 mv 移动并重命名草稿记录。',
      '第三级提示（示例）：依次运行：mkdir docs → mkdir records → cp template.md docs/ → mv notes-draft.txt records/lesson-01.txt。'
    ],
    errors: '请注意：cp 必须保留原始 template.md，mv 则会让原 notes-draft.txt 移入新路径；注意检查文件路径。',
    summary: '独立挑战完成！你已经能自主分析工作区状态，综合使用 ls、mkdir、cp、mv 完成课程资料的规范化归档。',
    check: ({ state }) => {
      const starterPath = `${HOME}/projects/starter`;
      const docs = getNode(state.root, `${starterPath}/docs`);
      const records = getNode(state.root, `${starterPath}/records`);
      const origTemplate = getNode(state.root, `${starterPath}/template.md`);
      const copiedTemplate = getNode(state.root, `${starterPath}/docs/template.md`);
      const oldDraft = getNode(state.root, `${starterPath}/notes-draft.txt`);
      const movedRecord = getNode(state.root, `${starterPath}/records/lesson-01.txt`);
      const readme = getNode(state.root, `${starterPath}/readme.txt`);

      return (
        docs?.type === 'dir' &&
        records?.type === 'dir' &&
        origTemplate?.type === 'file' &&
        copiedTemplate?.type === 'file' &&
        copiedTemplate.content === origTemplate.content &&
        !oldDraft &&
        movedRecord?.type === 'file' &&
        movedRecord.content.includes('传感器工作正常') &&
        readme?.type === 'file'
      );
    }
  }
];

export const unit5Tasks = [
  {
    id: 'echo-welcome',
    unit: 'unit5',
    unitTitle: '单元 5 · 输出、日志与自动化',
    title: '让终端输出一句话',
    goal: '使用 echo 命令在终端中打印欢迎语：Welcome to STEM Lab。',
    concept: '终端输出 (echo)',
    initialCwd: HOME,
    initialFsMode: 'unit5-echo',
    checklist: ['成功执行 echo 命令', '输出内容为 Welcome to STEM Lab', '正确处理带空格的文本参数'],
    hints: [
      '第一级提示（观察）：任务目标要求在终端中显示“Welcome to STEM Lab”。',
      '第二级提示（概念）：echo 会把后面的参数打印到终端；带空格的文本推荐用双引号包裹。',
      '第三级提示（示例）：输入 echo "Welcome to STEM Lab" 并按 Enter。'
    ],
    errors: '请确保命令为 echo 且输出文本准确为 Welcome to STEM Lab；带空格的短语建议使用引号包裹。',
    summary: '你已经学会了使用 echo 向终端输出文本。这是构建交互提示、日志记录和自动化输出的基础。',
    check: ({ state }) => {
      const entry = state.output.find(item => item.echo && item.ok && item.text === 'Welcome to STEM Lab');
      return Boolean(entry);
    }
  },
  {
    id: 'redirect-start-log',
    unit: 'unit5',
    unitTitle: '单元 5 · 输出、日志与自动化',
    title: '把输出保存成日志',
    goal: '使用 > 将 "Lesson started" 写入 logs/session.log，然后使用 cat 查看日志确认内容。',
    concept: '重定向覆盖写入 (redirection >)',
    initialCwd: HOME,
    initialFsMode: 'unit5-redirect',
    checklist: [
      '使用 > 将 "Lesson started" 写入 logs/session.log',
      'logs/session.log 成功创建且包含开课记录',
      '使用 cat logs/session.log 读取并确认文件内容'
    ],
    hints: [
      '第一级提示（观察）：当前目录下已有 logs 目录；我们需要将文本重定向到 logs/session.log。',
      '第二级提示（概念）：单个大于号 > 会把左侧命令的输出写入目标文件（若不存在则创建）。写入后用 cat 确认。',
      '第三级提示（示例）：依次运行：echo "Lesson started" > logs/session.log，然后运行 cat logs/session.log。'
    ],
    errors: '请检查重定向路径是否为 logs/session.log；写入完成后需要使用 cat 读取该文件才能完成本题。',
    summary: '你掌握了输出重定向 >：它把本该输出到终端的文本引导写入到指定文件中，若文件不存在会自动创建。',
    check: ({ state }) => {
      const node = getNode(state.root, `${HOME}/logs/session.log`);
      const hasCat = state.output.some(item => item.cat && item.path === `${HOME}/logs/session.log` && item.ok);
      return Boolean(node?.type === 'file' && node.content.trim() === 'Lesson started' && hasCat);
    }
  },
  {
    id: 'append-device-log',
    unit: 'unit5',
    unitTitle: '单元 5 · 输出、日志与自动化',
    title: '追加记录，不丢失旧内容',
    goal: '日志中已有开课记录；请使用 >> 依次追加 "Device check: OK" 和 "Network connected"，保留原有记录。',
    concept: '追加写入 (redirection >>)',
    initialCwd: HOME,
    initialFsMode: 'unit5-append',
    checklist: [
      '第一行保留原有的 Lesson started',
      '使用 >> 追加第二行 Device check: OK',
      '使用 >> 追加第三行 Network connected',
      '日志文件共包含 3 行有序记录，旧内容未被覆盖'
    ],
    hints: [
      '第一级提示（观察）：你可以先 cat logs/session.log 查看现存的第一行内容。',
      '第二级提示（概念）：单个 > 会覆盖清空原内容，而双大于号 >> 会在文件末尾追加新行，保护旧日志不丢失。',
      '第三级提示（示例）：依次运行：echo "Device check: OK" >> logs/session.log，然后运行 echo "Network connected" >> logs/session.log。'
    ],
    errors: '当前日志内容不符合要求。如果“Lesson started”被覆盖丢失，请点击“重置本关”恢复初始文件，或重新按顺序写入这 3 行记录。',
    summary: '你理解了 > 与 >> 的关键区别：> 是全新覆盖（抹掉旧内容），>> 是安全追加（在末尾增加新行）。',
    check: ({ state }) => {
      const node = getNode(state.root, `${HOME}/logs/session.log`);
      if (!node || node.type !== 'file') return false;
      const lines = node.content.trim().split(/\r?\n/);
      const hasThreeLines = lines.length === 3 &&
             lines[0] === 'Lesson started' &&
             lines[1] === 'Device check: OK' &&
             lines[2] === 'Network connected';
      const usedAppend = state.successfulCommands.some(cmd => cmd.includes('>>'));
      return hasThreeLines && usedAppend;
    }
  },
  {
    id: 'run-start-script',
    unit: 'unit5',
    unitTitle: '单元 5 · 输出、日志与自动化',
    title: '运行第一份自动化清单',
    goal: '先使用 cat 阅读 scripts/start-class.txt，然后使用教学命令 run 运行它，完成开课日志初始化。',
    concept: '自动化清单 (教学专用命令: run)',
    initialCwd: HOME,
    initialFsMode: 'unit5-run',
    checklist: [
      '使用 cat scripts/start-class.txt 查看清单内容',
      '使用 run scripts/start-class.txt 顺序执行清单',
      '理解第一行 > 开辟新会话与后续 >> 追加记录的配合',
      '最终 logs/session.log 拥有预期的两行日志'
    ],
    hints: [
      '第一级提示（观察）：先运行 cat scripts/start-class.txt 看看清单里预先写好了哪些命令与注释。',
      '第二级提示（概念）：run 是本模拟器专用的教学命令（非系统通用 Shell），会忽略注释并按顺序一行行执行清单中的命令。',
      '第三级提示（示例）：先运行 cat scripts/start-class.txt，再运行 run scripts/start-class.txt。'
    ],
    errors: '请先阅读脚本文件，再使用 run scripts/start-class.txt 执行；run 是本模拟器专用教学命令，非系统通用 Shell。',
    summary: '自动化清单执行成功！这份示例清单再次运行仍能保持两行日志，是因为第一行用 > 重新写入开课记录，后续行用 >> 追加。注意：这是特定命令组合的效果，不是所有命令清单重复运行都能得到相同结果；run 是本模拟器专用教学命令。',
    check: ({ state }) => {
      const hasCatScript = state.output.some(item => item.cat && item.path === `${HOME}/scripts/start-class.txt` && item.ok);
      const hasRunScript = state.output.some(item => item.run && item.scriptPath === `${HOME}/scripts/start-class.txt` && item.ok);
      const logNode = getNode(state.root, `${HOME}/logs/session.log`);
      const validContent = logNode?.type === 'file' && logNode.content.trim() === 'Lesson started\nDevices ready';
      return Boolean(hasCatScript && hasRunScript && validContent);
    }
  }
];

export const unit6Tasks = [
  {
    id: 'command-parts',
    unit: 'unit6',
    unitTitle: '单元 6 · 读懂命令与查找帮助',
    title: '看懂命令的三个部分',
    goal: '使用带选项和参数的 grep 命令，在 "Course Notes.txt" 中忽略大小写查找包含 python 的笔记。',
    concept: '命令结构：命令名、选项与参数 (command, options & arguments)',
    initialCwd: HOME,
    initialFsMode: 'unit6-parts',
    checklist: [
      '理解一条命令通常由“命令名”、“选项”和“参数”三部分构成',
      '正确使用 -i 选项忽略大小写',
      '使用引号正确包裹含空格的文件名 "Course Notes.txt"',
      '成功匹配并输出 2 行包含 python 的笔记'
    ],
    hints: [
      '第一级提示（观察）：文件名中包含空格（"Course Notes.txt"）；搜索目标是 python，且不区分大小写。',
      '第二级提示（概念）：一条典型命令结构：命令名（grep）+ 选项（-i 忽略大小写）+ 参数（搜索关键词与文件名）。带空格的文件名必须用单引号或双引号包裹。',
      '第三级提示（示例）：输入 grep -i python "Course Notes.txt"（或使用单引号包裹文件名），然后按 Enter。'
    ],
    errors: '请检查命令结构：命令名是 grep，选项是 -i，关键词是 python，文件名 "Course Notes.txt" 需用引号包裹。',
    summary: '你掌握了终端命令的核心构成：命令名告诉终端“做什么”，选项（如 -i）调整“怎么做”，参数（如关键词和文件名）指明“对谁做”。引号能保证带空格的文件名被视作同一个参数。',
    check: ({ state }) => {
      const entry = state.output.find(item => item.grep && item.ignoreCase && item.keyword?.toLowerCase() === 'python' && item.path === `${HOME}/Course Notes.txt` && item.ok);
      return Boolean(entry && entry.matchedLines?.length === 2);
    }
  },
  {
    id: 'cd-space-path',
    unit: 'unit6',
    unitTitle: '单元 6 · 读懂命令与查找帮助',
    title: '进入名字带空格的目录',
    goal: '从 lessons 目录进入带空格的 "Summer Camp" 目录，用 pwd 确认位置，并阅读其中的 overview.txt。',
    concept: '路径中的空格与引号处理 (quoting spaces in path)',
    initialCwd: `${HOME}/lessons`,
    initialFsMode: 'unit6-spaces',
    checklist: [
      '使用引号包裹路径进入 "Summer Camp" 目录',
      '使用 pwd 确认当前已位于 /home/steven/lessons/Summer Camp',
      '使用 cat overview.txt 成功阅读夏令营活动总览'
    ],
    hints: [
      '第一级提示（观察）：当前位于 lessons 目录，运行 ls 可以看到 Summer Camp 目录（中间有空格）。若直接输入 cd Summer Camp 会报错。',
      '第二级提示（概念）：终端以空格分隔命令和参数；如果目录名本身含有空格，必须用双引号 "Summer Camp" 或单引号 \'Summer Camp\' 包裹。',
      '第三级提示（示例）：依次运行：cd "Summer Camp" ➔ pwd ➔ cat overview.txt。'
    ],
    errors: '如果目录名含空格，请用引号包裹路径（如 cd "Summer Camp"）；进入后记得用 pwd 验证位置并用 cat 读取说明。',
    summary: '当目录或文件名包含空格时，引号告诉 Shell“这是一个完整的名字，不要按空格拆分”。同时养成 cd 后用 pwd 确认位置的好习惯。',
    check: ({ state }) => {
      const atTarget = state.cwd === `${HOME}/lessons/Summer Camp`;
      const hasPwd = state.successfulCommands.includes('pwd');
      const hasCat = state.output.some(item => item.cat && item.path === `${HOME}/lessons/Summer Camp/overview.txt` && item.ok);
      return Boolean(atTarget && hasPwd && hasCat);
    }
  },
  {
    id: 'help-lookup',
    unit: 'unit6',
    unitTitle: '单元 6 · 读懂命令与查找帮助',
    title: '不会用时，先查帮助',
    goal: '先使用 help wc 查看 wc 命令的具体语法和限制，再使用 wc -l 统计 notes.txt 中的换行符行数。',
    concept: '查阅命令帮助 (help & command documentation)',
    initialCwd: HOME,
    initialFsMode: 'unit6-help',
    checklist: [
      '运行 help wc 查看 wc 命令用法与支持范围',
      '理解当前模拟器中 wc 仅支持 -l 选项',
      '运行 wc -l notes.txt 统计出 4 行记录'
    ],
    hints: [
      '第一级提示（观察）：终端中随时可以通过 help 或 help <命令名> 查看支持的语法。',
      '第二级提示（概念）：输入 help wc 查看 wc 的帮助，你会发现它指出“必须带 -l 选项”。根据说明再执行统计。',
      '第三级提示（示例）：先运行 help wc，看清说明后再运行 wc -l notes.txt。'
    ],
    errors: '请先输入 help wc 查看帮助，然后再运行 wc -l notes.txt 统计行数。',
    summary: '遇到不熟悉的命令或记不清选项时，先查 help 是专业开发者的标准工作习惯。它能准确告诉你当前环境支持哪些能力和安全限制。',
    check: ({ state }) => {
      const checkedHelp = state.output.some(item => item.help && item.commandHelp === 'wc');
      const hasWc = state.output.some(item => item.wc && item.path === `${HOME}/notes.txt` && item.output === '4');
      return Boolean(checkedHelp && hasWc);
    }
  },
  {
    id: 'fix-composite-error',
    unit: 'unit6',
    unitTitle: '单元 6 · 读懂命令与查找帮助',
    title: '读懂错误，再修正',
    goal: '初学者常误以为可以一行输入 cd lessons pwd；请分析报错原因，分步正确进入 lessons、用 pwd 确认，并用 cat 阅读 course-overview.txt。',
    concept: '分析报错并分步执行 (reading errors & stepwise execution)',
    initialCwd: HOME,
    initialFsMode: 'unit6-fix',
    checklist: [
      '理解基础命令行一次只执行一条命令（不支持单行连写多个独立命令）',
      '正确执行 cd lessons 进入课程目录',
      '执行 pwd 确认当前所在位置',
      '执行 cat course-overview.txt 读取课程说明'
    ],
    hints: [
      '第一级提示（观察）：如果输入 cd lessons pwd，cd 会因为接收到 2 个参数而报错拒绝执行。',
      '第二级提示（概念）：本阶段不使用复合连接符；遇到需要连续完成的动作，应该分成独立步骤，一行输入一条命令。',
      '第三级提示（示例）：依次分步执行：cd lessons ➔ pwd ➔ cat course-overview.txt。'
    ],
    errors: '请分步操作：先正确 cd lessons，再用 pwd 确认位置，最后用 cat course-overview.txt 读取课程说明。',
    summary: '读懂错误是终端进阶的关键：当参数过多或命令执行失败时，路径不会改变。把复杂的动作拆解为“先移动、再确认、后操作”的稳健步骤，是最高效安全的终端实践。',
    check: ({ state }) => {
      const atLessons = state.cwd === `${HOME}/lessons`;
      const hasCd = state.successfulCommands.some(cmd => cmd === 'cd lessons' || cmd === 'cd ./lessons' || cmd === 'cd ~/lessons' || cmd === 'cd /home/steven/lessons');
      const hasPwd = state.successfulCommands.includes('pwd');
      const hasCat = state.output.some(item => item.cat && item.path === `${HOME}/lessons/course-overview.txt` && item.ok);
      return Boolean(atLessons && hasCd && hasPwd && hasCat);
    }
  }
];

export const tasks = [...unit1Tasks, ...unit2Tasks, ...unit3Tasks, ...unit4Tasks, ...unit5Tasks, ...unit6Tasks];
export const units = [
  { id: 'unit1', title: '单元 1 · 我在哪里', tasks: unit1Tasks },
  { id: 'unit2', title: '单元 2 · 建立课程工作区', tasks: unit2Tasks },
  { id: 'unit3', title: '单元 3 · 阅读与搜索', tasks: unit3Tasks },
  { id: 'unit4', title: '单元 4 · 排错与独立挑战', tasks: unit4Tasks },
  { id: 'unit5', title: '单元 5 · 输出、日志与自动化', tasks: unit5Tasks },
  { id: 'unit6', title: '单元 6 · 读懂命令与查找帮助', tasks: unit6Tasks }
];

export const migrationSteps = [
  ['pwd', '确认真实 Terminal 当前目录。', '输出一个绝对路径；具体内容取决于你的 Mac 和当前会话。', '看到路径后，自己判断是否位于预期位置。'],
  ['ls', '查看当前目录内容。', '输出文件和目录名称；具体列表不预先编造。', '观察名称，并注意文件与目录的差异。'],
  ['cd ~', '进入真实用户 home 目录。', '通常不会打印内容，但提示符或后续 pwd 会反映变化。', '执行后再用 pwd 确认。'],
  ['cd ..', '返回 home 的上级目录。', '通常不会打印内容。', '执行后用 pwd 检查路径是否少了一级。'],
  ['pwd', '再次确认当前位置。', '输出新的绝对路径。', '把这次结果与上一次 pwd 对比，确认 cd .. 生效。']
];
