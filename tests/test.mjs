import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { HOME, createUnit1FileSystem, createUnit2FileSystem, createUnit3FileSystem, createUnit4FileSystem, createUnit5FileSystem, createUnit6FileSystem, getNode, normalizePath, tokenize } from '../src/filesystem.js';
import { executeCommand } from '../src/engine.js';
import { tasks, units } from '../src/data.js';

const fresh = (cwd = HOME) => ({ root: createUnit1FileSystem(), cwd, successfulCommands: [] });
let s = fresh();
assert.equal(executeCommand('pwd', s).output, HOME);
assert.match(executeCommand('ls', s).output, /lessons/);
assert.match(executeCommand('ls lessons', s).output, /robotics/);
assert.equal(normalizePath('./lessons/../projects', HOME), `${HOME}/projects`);
assert.equal(normalizePath('/..', HOME), '/');
assert.equal(normalizePath('~', `${HOME}/lessons`), HOME);
assert.equal(normalizePath('~/lessons', `${HOME}/projects`), `${HOME}/lessons`);
assert.equal(executeCommand('cd', s).output, HOME);
assert.equal(executeCommand('cd lessons', s).output, `${HOME}/lessons`);
s.cwd = `${HOME}/lessons`;
assert.equal(executeCommand("cd 'Summer Camp'", s).output, `${HOME}/lessons/Summer Camp`);
assert.equal(executeCommand('cd "Summer Camp"', { ...s, cwd: `${HOME}/lessons` }).output, `${HOME}/lessons/Summer Camp`);
assert.ok(tokenize('cd "Summer Camp"').tokens.includes('Summer Camp'));
assert.ok(tokenize("cd 'Summer Camp").error);
const bad = executeCommand('cd missing', s); assert.equal(bad.ok, false); assert.equal(s.cwd, `${HOME}/lessons`);
assert.equal(executeCommand('cd course-notes.md', { ...s, cwd: HOME }).ok, false);
assert.equal(executeCommand('rm -rf x', s).ok, false);
assert.equal(executeCommand('ls a b', s).ok, false);
assert.equal(executeCommand('ls -l', s).ok, false);
const clear = executeCommand('clear', s); assert.equal(clear.ok, true); assert.equal(s.cwd, `${HOME}/lessons`);
assert.equal(getNode(s.root, `${HOME}/lessons`).type, 'dir');

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /<form id="terminal-form"/);
assert.match(html, /<input id="command-input"[^>]*autofocus/);
assert.doesNotMatch(html, /<input id="command-input"[^>]*disabled/);
assert.match(html, /placeholder="输入 pwd，然后按 Enter"/);
assert.match(html, /<div id="unit-tabs"/);
assert.match(html, /02 建立课程工作区 · 可进入/);
assert.match(html, /03 阅读与搜索 · 可进入/);
assert.match(html, /04 排错与独立挑战 · 可进入/);
assert.match(html, /05 输出、日志与自动化 · 可进入/);
assert.match(html, /06 读懂命令与查找帮助 · 可进入/);
assert.match(html, /07 查找文件与批量选择 · 规划中/);
assert.match(html, /12 Git 与 AI CLI 工作流 · 规划中/);
assert.match(html, /Cache-Control/);
assert.doesNotMatch(html, /(href|src)=["']\/(?!\/)/, '不能使用以 / 开头的绝对根路径，确保支持 GitHub Pages 项目子路径部署');
assert.doesNotMatch(html, /localhost|127\.0\.0\.1/, '页面不应包含本地开发服务器地址');
assert.match(html, /href=["']\.\/styles\.css/);
assert.match(html, /src=["']\.\/src\/app\.js/);

const appJs = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
assert.match(appJs, /STORAGE_KEY\s*=\s*['"]terminal-steps-lab:/, 'localStorage 必须使用 terminal-steps-lab 专属命名空间');
assert.doesNotMatch(appJs, /localStorage\.clear\(\)/, '不得使用 localStorage.clear() 清除整个域名的数据');

assert.equal(units.length, 6);
assert.deepEqual(units.map(u => u.id), ['unit1', 'unit2', 'unit3', 'unit4', 'unit5', 'unit6']);
assert.equal(tasks.length, 24);

const unchanged = (before, after) => assert.deepEqual(after, before);
let fsState = { root: createUnit2FileSystem('base'), cwd: HOME, successfulCommands: [] };
let before = JSON.stringify(fsState.root);
let result = executeCommand('mkdir projects/summer-camp', fsState);
assert.equal(result.ok, true); assert.equal(getNode(fsState.root, `${HOME}/projects/summer-camp`).type, 'dir');
assert.equal(executeCommand('mkdir projects/summer-camp', fsState).ok, false); unchanged(JSON.parse(JSON.stringify(fsState.root)), fsState.root);
before = JSON.stringify(fsState.root); assert.equal(executeCommand('mkdir missing/child', fsState).ok, false); assert.equal(JSON.stringify(fsState.root), before);
assert.equal(executeCommand('mkdir "course files"', fsState).ok, true); assert.equal(getNode(fsState.root, `${HOME}/course files`).type, 'dir');

fsState = { root: createUnit2FileSystem('base'), cwd: `${HOME}/lessons/robotics`, successfulCommands: [] };
assert.equal(executeCommand('touch session-record.txt', fsState).ok, true); assert.equal(getNode(fsState.root, `${HOME}/lessons/robotics/session-record.txt`).content, '');
const existingContent = getNode(fsState.root, `${HOME}/lessons/robotics/session-plan.md`).content;
assert.equal(executeCommand('touch session-plan.md', fsState).ok, true); assert.equal(getNode(fsState.root, `${HOME}/lessons/robotics/session-plan.md`).content, existingContent);
before = JSON.stringify(fsState.root); assert.equal(executeCommand('touch .', fsState).ok, false); assert.equal(JSON.stringify(fsState.root), before);
assert.equal(executeCommand('touch missing/session.txt', fsState).ok, false); assert.equal(JSON.stringify(fsState.root), before);

fsState = { root: createUnit2FileSystem('copy'), cwd: `${HOME}/lessons`, successfulCommands: [] };
const templateContent = getNode(fsState.root, `${HOME}/lessons/course-template.md`).content;
assert.equal(executeCommand('cp course-template.md robotics/copied-template.md', fsState).ok, true);
assert.equal(getNode(fsState.root, `${HOME}/lessons/robotics/copied-template.md`).content, templateContent);
assert.equal(getNode(fsState.root, `${HOME}/lessons/course-template.md`).content, templateContent);
assert.equal(executeCommand('cp course-template.md robotics', fsState).ok, true);
before = JSON.stringify(fsState.root); assert.equal(executeCommand('cp missing.md robotics/nope.md', fsState).ok, false); assert.equal(JSON.stringify(fsState.root), before);
assert.equal(executeCommand('cp robotics robotics/nope', fsState).ok, false);
assert.equal(executeCommand('cp course-template.md robotics/copied-template.md', fsState).ok, false);
assert.equal(executeCommand('cp course-template.md course-template.md', fsState).ok, false);
assert.equal(executeCommand('cp course-template.md missing/nope.md', fsState).ok, false);
assert.equal(JSON.stringify(fsState.root), before);

fsState = { root: createUnit2FileSystem('move'), cwd: `${HOME}/lessons/robotics`, successfulCommands: [] };
const recordContent = getNode(fsState.root, `${HOME}/lessons/robotics/session-record.md`).content;
assert.equal(executeCommand('mv session-record.md session-record-final.md', fsState).ok, true);
assert.equal(getNode(fsState.root, `${HOME}/lessons/robotics/session-record.md`), null);
assert.equal(getNode(fsState.root, `${HOME}/lessons/robotics/session-record-final.md`).content, recordContent);
assert.equal(executeCommand('mv session-record-final.md archive', fsState).ok, true);
assert.equal(getNode(fsState.root, `${HOME}/lessons/robotics/archive/session-record-final.md`).content, recordContent);
before = JSON.stringify(fsState.root); assert.equal(executeCommand('mv missing.md archive/nope.md', fsState).ok, false); assert.equal(JSON.stringify(fsState.root), before);
assert.equal(executeCommand('mv archive archive2', fsState).ok, false);
assert.equal(executeCommand('mv archive/session-record-final.md archive/session-record-final.md', fsState).ok, false);
assert.equal(executeCommand('mv archive/session-record-final.md archive/nope.md', fsState).ok, true);
assert.equal(executeCommand('mv archive/nope.md archive/nope.md', fsState).ok, false);

fsState = { root: createUnit3FileSystem('cat'), cwd: `${HOME}/lessons`, successfulCommands: [] };
const catContent = getNode(fsState.root, `${HOME}/lessons/course-overview.txt`).content;
let catResult = executeCommand('cat course-overview.txt', fsState);
assert.equal(catResult.ok, true); assert.equal(catResult.output, catContent); assert.equal(getNode(fsState.root, `${HOME}/lessons/course-overview.txt`).content, catContent);
assert.equal(executeCommand('cat', fsState).ok, false); assert.equal(executeCommand('cat lessons', fsState).ok, false); assert.equal(executeCommand('cat missing.txt', fsState).ok, false);
assert.equal(executeCommand('cat course-overview.txt other.txt', fsState).ok, false);
fsState = { root: createUnit3FileSystem('grep'), cwd: `${HOME}/lessons`, successfulCommands: [] };
let grepResult = executeCommand('grep robotics keyword-notes.txt', fsState);
assert.equal(grepResult.ok, true); assert.equal(grepResult.matchedLines.length, 2); assert.equal(grepResult.output, 'robotics 课程需要先确认材料。\nrobotics 课程结束后记录观察。');
assert.equal(executeCommand('grep ROBOTICS keyword-notes.txt', fsState).output, '');
assert.equal(executeCommand('grep -i ROBOTICS keyword-notes.txt', fsState).matchedLines.length, 2);
assert.equal(executeCommand('grep "robotics|python" keyword-notes.txt', fsState).output, '');
assert.equal(executeCommand('grep "" keyword-notes.txt', fsState).ok, false);
assert.equal(executeCommand('grep -n robotics keyword-notes.txt', fsState).ok, false);
assert.equal(executeCommand('grep robotics missing.txt', fsState).ok, false);
assert.equal(executeCommand('grep robotics lessons', fsState).ok, false);

fsState = { root: createUnit3FileSystem('case'), cwd: `${HOME}/lessons`, successfulCommands: [] };
assert.equal(executeCommand('grep python case-notes.txt', fsState).matchedLines.length, 1);
assert.equal(executeCommand('grep -i python case-notes.txt', fsState).matchedLines.length, 3);
assert.equal(executeCommand('grep "Python automation" case-notes.txt', fsState).matchedLines.length, 1);

const newlineRoot = createUnit3FileSystem('cat');
const newlineFolder = getNode(newlineRoot, `${HOME}/lessons`);
newlineFolder.children['empty.txt'] = { type: 'file', name: 'empty.txt', content: '' };
newlineFolder.children['one.txt'] = { type: 'file', name: 'one.txt', content: 'one' };
newlineFolder.children['two.txt'] = { type: 'file', name: 'two.txt', content: 'one\ntwo\n' };
newlineFolder.children['blank.txt'] = { type: 'file', name: 'blank.txt', content: 'one\n\nthree\n' };
newlineFolder.children['crlf.txt'] = { type: 'file', name: 'crlf.txt', content: 'one\r\ntwo\r\n' };
fsState = { root: newlineRoot, cwd: `${HOME}/lessons`, successfulCommands: [] };
assert.equal(executeCommand('wc -l empty.txt', fsState).output, '0');
assert.equal(executeCommand('wc -l one.txt', fsState).output, '0');
assert.equal(executeCommand('wc -l two.txt', fsState).output, '2');
assert.equal(executeCommand('wc -l blank.txt', fsState).output, '3');
assert.equal(executeCommand('wc -l crlf.txt', fsState).output, '2');
assert.equal(executeCommand('wc two.txt', fsState).ok, false); assert.equal(executeCommand('wc -c two.txt', fsState).ok, false); assert.equal(executeCommand('wc -l missing.txt', fsState).ok, false);

fsState = { root: createUnit3FileSystem('pipeline'), cwd: `${HOME}/lessons`, successfulCommands: [] };
let pipelineResult = executeCommand('grep ERROR logs/lesson-run.log | wc -l', fsState);
assert.equal(pipelineResult.ok, true); assert.equal(pipelineResult.output, '3'); assert.equal(pipelineResult.matchedLines.length, 3); assert.equal(pipelineResult.pipeline, true);
assert.equal(executeCommand('grep NONE logs/lesson-run.log | wc -l', fsState).output, '0');
assert.equal(executeCommand('grep missing.log logs/nope.log | wc -l', fsState).ok, false);
assert.equal(executeCommand('wc -l logs/lesson-run.log | grep ERROR', fsState).ok, false);
assert.equal(executeCommand('grep ERROR logs/lesson-run.log | wc -l | wc -l', fsState).ok, false);
assert.equal(executeCommand('grep "ERROR|INFO" logs/lesson-run.log', fsState).ok, true);

const unit2Checks = [
  { index: 4, mode: 'mkdir', cwd: HOME, commands: ['mkdir projects/summer-camp'] },
  { index: 5, mode: 'touch', cwd: `${HOME}/lessons/robotics`, commands: ['touch session-record.txt'] },
  { index: 6, mode: 'copy', cwd: `${HOME}/lessons`, commands: ['cp course-template.md robotics'] },
  { index: 7, mode: 'move', cwd: `${HOME}/lessons/robotics`, commands: ['mv session-record.md archive/robotics-session-final.md'] }
];
for (const item of unit2Checks) {
  const taskState = { root: createUnit2FileSystem(item.mode), cwd: item.cwd, successfulCommands: [] };
  for (const command of item.commands) { const commandResult = executeCommand(command, taskState); assert.equal(commandResult.ok, true); taskState.successfulCommands.push(command); if (commandResult.changed) taskState.cwd = commandResult.output; }
  assert.equal(tasks[item.index].check({ state: taskState }), true, `unit 2 task ${item.index - 3} should complete`);
}
assert.equal(tasks[7].check({ state: { root: createUnit2FileSystem('move'), cwd: `${HOME}/lessons/robotics`, successfulCommands: [] } }), false);

const unit3Checks = [
  { index: 8, mode: 'cat', cwd: `${HOME}/lessons`, commands: ['cat course-overview.txt'] },
  { index: 9, mode: 'grep', cwd: `${HOME}/lessons`, commands: ['grep robotics keyword-notes.txt'] },
  { index: 10, mode: 'case', cwd: `${HOME}/lessons`, commands: ['grep python case-notes.txt', 'grep -i python case-notes.txt'] },
  { index: 11, mode: 'pipeline', cwd: `${HOME}/lessons`, commands: ['grep ERROR logs/lesson-run.log | wc -l'] }
];
for (const item of unit3Checks) {
  const taskState = { root: createUnit3FileSystem(item.mode), cwd: item.cwd, successfulCommands: [], output: [] };
  for (const command of item.commands) { const commandResult = executeCommand(command, taskState); assert.equal(commandResult.ok, true); taskState.successfulCommands.push(command); taskState.output.push({ command, ...commandResult }); }
  assert.equal(tasks[item.index].check({ state: taskState }), true, `unit 3 task ${item.index - 7} should complete`);
}
const accidentalCount = { root: createUnit3FileSystem('pipeline'), cwd: `${HOME}/lessons`, successfulCommands: ['wc -l logs/lesson-run.log'], output: [{ command: 'wc -l logs/lesson-run.log', output: '3', ok: true }] };
assert.equal(tasks[11].check({ state: accidentalCount }), false);

let t = fresh();
assert.equal(tasks[0].check({ command: 'pwd', result: executeCommand('pwd', t), state: t }), true);
assert.equal(tasks[1].check({ command: 'ls', result: executeCommand('ls', t), state: t }), true);
const enter = executeCommand('cd lessons', t); t.cwd = enter.output; t.successfulCommands.push('cd lessons');
assert.equal(tasks[2].check({ command: 'cd lessons', result: enter, state: t }), true);
assert.equal(tasks[2].check({ command: 'cd ./lessons', result: enter, state: t }), true);
assert.equal(tasks[3].check({ command: 'pwd', result: { ok: true, output: HOME }, state: { cwd: HOME, successfulCommands: ['cd ..', 'pwd'] } }), true);
assert.equal(tasks[3].check({ command: 'pwd', result: { ok: true, output: HOME }, state: { cwd: HOME, successfulCommands: ['pwd'] } }), false);

// 单元 4 测试
// 任务 1：我为什么打不开文件？
let u4t1State = { root: createUnit4FileSystem('open'), cwd: HOME, successfulCommands: [], output: [] };
let failedCat = executeCommand('cat course-overview.txt', u4t1State);
assert.equal(failedCat.ok, false);
assert.equal(u4t1State.cwd, HOME);
assert.equal(tasks[12].check({ state: u4t1State }), false);

// 任务 1 解法 A：相对路径
let successCatRel = executeCommand('cat lessons/course-overview.txt', u4t1State);
assert.equal(successCatRel.ok, true);
u4t1State.output.push({ command: 'cat lessons/course-overview.txt', ...successCatRel });
assert.equal(tasks[12].check({ state: u4t1State }), true);

// 任务 1 解法 B：先 cd 后 cat
let u4t1Alt = { root: createUnit4FileSystem('open'), cwd: HOME, successfulCommands: [], output: [] };
let cdRes = executeCommand('cd lessons', u4t1Alt);
assert.equal(cdRes.ok, true); u4t1Alt.cwd = cdRes.output; u4t1Alt.successfulCommands.push('cd lessons');
let catRes = executeCommand('cat course-overview.txt', u4t1Alt);
assert.equal(catRes.ok, true); u4t1Alt.output.push({ command: 'cat course-overview.txt', ...catRes });
assert.equal(tasks[12].check({ state: u4t1Alt }), true);

// 任务 2：文件名写错了
let u4t2State = { root: createUnit4FileSystem('rename'), cwd: `${HOME}/lessons/robotics`, successfulCommands: [], output: [] };
assert.equal(getNode(u4t2State.root, `${HOME}/lessons/robotics/session-reocrd.md`)?.type, 'file');
assert.equal(getNode(u4t2State.root, `${HOME}/lessons/robotics/session-record.md`), null);
assert.equal(tasks[13].check({ state: u4t2State }), false);

let mvRes = executeCommand('mv session-reocrd.md session-record.md', u4t2State);
assert.equal(mvRes.ok, true);
u4t2State.successfulCommands.push('mv session-reocrd.md session-record.md');
assert.equal(tasks[13].check({ state: u4t2State }), true);
assert.equal(getNode(u4t2State.root, `${HOME}/lessons/robotics/session-reocrd.md`), null);
assert.equal(getNode(u4t2State.root, `${HOME}/lessons/robotics/session-record.md`)?.content.includes('机械臂初装'), true);

// 任务 2 防覆盖保护测试
let beforeTree = JSON.stringify(u4t2State.root);
assert.equal(executeCommand('mv session-record.md session-plan.md', u4t2State).ok, false);
assert.equal(JSON.stringify(u4t2State.root), beforeTree);

// 任务 3：从记录里找线索
let u4t3State = { root: createUnit4FileSystem('log'), cwd: `${HOME}/lessons`, successfulCommands: [], output: [] };
let wrongKeyword = executeCommand('grep ERROR logs/hardware-check.log | wc -l', u4t3State);
assert.equal(wrongKeyword.ok, true);
assert.equal(wrongKeyword.output, '0');
u4t3State.output.push({ command: 'grep ERROR logs/hardware-check.log | wc -l', ...wrongKeyword });
assert.equal(tasks[14].check({ state: u4t3State }), false);

let rightKeyword = executeCommand('grep WARN logs/hardware-check.log | wc -l', u4t3State);
assert.equal(rightKeyword.ok, true);
assert.equal(rightKeyword.output, '3');
u4t3State.output.push({ command: 'grep WARN logs/hardware-check.log | wc -l', ...rightKeyword });
assert.equal(tasks[14].check({ state: u4t3State }), true);

// 任务 3 等价解法：先 cd 进入 logs 目录
let u4t3Alt = { root: createUnit4FileSystem('log'), cwd: `${HOME}/lessons/logs`, successfulCommands: [], output: [] };
let pipeAlt = executeCommand('grep WARN hardware-check.log | wc -l', u4t3Alt);
assert.equal(pipeAlt.ok, true);
assert.equal(pipeAlt.output, '3');
u4t3Alt.output.push({ command: 'grep WARN hardware-check.log | wc -l', ...pipeAlt });
assert.equal(tasks[14].check({ state: u4t3Alt }), true);

// 任务 4：独立整理课程工作区
let u4t4State = { root: createUnit4FileSystem('organize'), cwd: `${HOME}/projects/starter`, successfulCommands: [], output: [] };
assert.equal(tasks[15].check({ state: u4t4State }), false);

// 步骤 1：创建目录
assert.equal(executeCommand('mkdir docs', u4t4State).ok, true);
assert.equal(executeCommand('mkdir records', u4t4State).ok, true);
assert.equal(tasks[15].check({ state: u4t4State }), false);

// 步骤 2：复制模板（保留原件）
assert.equal(executeCommand('cp template.md docs/', u4t4State).ok, true);
assert.equal(tasks[15].check({ state: u4t4State }), false);

// 步骤 3：移动草稿并重命名
assert.equal(executeCommand('mv notes-draft.txt records/lesson-01.txt', u4t4State).ok, true);
assert.equal(tasks[15].check({ state: u4t4State }), true);

// 确认最终文件系统状态
assert.equal(getNode(u4t4State.root, `${HOME}/projects/starter/template.md`)?.type, 'file');
assert.equal(getNode(u4t4State.root, `${HOME}/projects/starter/docs/template.md`)?.type, 'file');
assert.equal(getNode(u4t4State.root, `${HOME}/projects/starter/notes-draft.txt`), null);
assert.equal(getNode(u4t4State.root, `${HOME}/projects/starter/records/lesson-01.txt`)?.type, 'file');
assert.equal(getNode(u4t4State.root, `${HOME}/projects/starter/readme.txt`)?.type, 'file');

// 任务 4 乱序解法支持（先 records 后 docs，使用 cp template.md docs）
let u4t4Alt = { root: createUnit4FileSystem('organize'), cwd: `${HOME}/projects/starter`, successfulCommands: [], output: [] };
assert.equal(executeCommand('mkdir records', u4t4Alt).ok, true);
assert.equal(executeCommand('mv notes-draft.txt records/lesson-01.txt', u4t4Alt).ok, true);
assert.equal(executeCommand('mkdir docs', u4t4Alt).ok, true);
assert.equal(executeCommand('cp template.md docs', u4t4Alt).ok, true);
assert.equal(tasks[15].check({ state: u4t4Alt }), true);

// 单元 5 基础功能测试
// 1. echo 命令
let u5State = { root: createUnit5FileSystem('echo'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(executeCommand('echo hello', u5State).output, 'hello');
assert.equal(executeCommand('echo "Hello STEM"', u5State).output, 'Hello STEM');
assert.equal(executeCommand("echo 'Hello STEM'", u5State).output, 'Hello STEM');
assert.equal(executeCommand('echo', u5State).output, '');
assert.equal(executeCommand('echo "unclosed quote', u5State).ok, false);
assert.equal(executeCommand('echo "a > b"', u5State).output, 'a > b');
assert.equal(executeCommand("echo 'a >> b'", u5State).output, 'a >> b');

// 2. 输出重定向 > 与 >>
let redirState = { root: createUnit5FileSystem('redirect'), cwd: HOME, successfulCommands: [], output: [] };
// 新建文件
let redir1 = executeCommand('echo "Lesson started" > logs/session.log', redirState);
assert.equal(redir1.ok, true);
assert.equal(getNode(redirState.root, `${HOME}/logs/session.log`)?.content, 'Lesson started\n');

// 覆盖已有内容
let redir2 = executeCommand('echo "New header" > logs/session.log', redirState);
assert.equal(redir2.ok, true);
assert.equal(getNode(redirState.root, `${HOME}/logs/session.log`)?.content, 'New header\n');

// 追加内容
let redir3 = executeCommand('echo "Second line" >> logs/session.log', redirState);
assert.equal(redir3.ok, true);
assert.equal(getNode(redirState.root, `${HOME}/logs/session.log`)?.content, 'New header\nSecond line\n');

// 追加到不存在的文件（应自动创建）
let redir4 = executeCommand('echo "First line" >> logs/new-file.log', redirState);
assert.equal(redir4.ok, true);
assert.equal(getNode(redirState.root, `${HOME}/logs/new-file.log`)?.content, 'First line\n');

// 失败用例：父目录不存在
let beforeFail = JSON.stringify(redirState.root);
assert.equal(executeCommand('echo "fail" > missing-dir/file.log', redirState).ok, false);
assert.equal(JSON.stringify(redirState.root), beforeFail);

// 失败用例：目标是目录
assert.equal(executeCommand('echo "fail" > logs', redirState).ok, false);
assert.equal(JSON.stringify(redirState.root), beforeFail);

// 失败用例：缺少目标路径
assert.equal(executeCommand('echo "fail" >', redirState).ok, false);
assert.equal(JSON.stringify(redirState.root), beforeFail);

// 失败用例：左侧命令不支持重定向（本阶段仅支持 echo 与 cat）
assert.equal(executeCommand('ls > logs/list.txt', redirState).ok, false);
assert.equal(JSON.stringify(redirState.root), beforeFail);

// 失败用例：左侧命令执行失败时不创建/修改目标文件
assert.equal(executeCommand('cat missing.txt > logs/fail.txt', redirState).ok, false);
assert.equal(getNode(redirState.root, `${HOME}/logs/fail.txt`), null);

// cat 输出重定向
let catRedir = executeCommand('cat logs/new-file.log > logs/copy.log', redirState);
assert.equal(catRedir.ok, true);
assert.equal(getNode(redirState.root, `${HOME}/logs/copy.log`)?.content, 'First line\n');

// 3. run 命令
let scriptRoot = createUnit5FileSystem('run');
let runState = { root: scriptRoot, cwd: HOME, successfulCommands: [], output: [] };

// 缺少参数
assert.equal(executeCommand('run', runState).ok, false);
// 脚本不存在
assert.equal(executeCommand('run scripts/missing.txt', runState).ok, false);

// 正常执行 start-class.txt
let runRes = executeCommand('run scripts/start-class.txt', runState);
assert.equal(runRes.ok, true);
assert.equal(runRes.run, true);
assert.equal(getNode(runState.root, `${HOME}/logs/session.log`)?.content, 'Lesson started\nDevices ready\n');

// 重复运行验证：由于第一行用 >，第二行用 >>，内容不累积重复
let runRes2 = executeCommand('run scripts/start-class.txt', runState);
assert.equal(runRes2.ok, true);
assert.equal(getNode(runState.root, `${HOME}/logs/session.log`)?.content, 'Lesson started\nDevices ready\n');

// 中途失败：验证报错包含行号，且前序修改保留
const stevenNode = getNode(runState.root, HOME);
stevenNode.children.scripts.children['broken.txt'] = {
  type: 'file',
  name: 'broken.txt',
  content: 'echo "Step 1" > logs/broken.log\ncd missing-folder-fail\necho "Step 3" >> logs/broken.log\n'
};
let brokenRes = executeCommand('run scripts/broken.txt', runState);
assert.equal(brokenRes.ok, false);
assert.match(brokenRes.output, /第 2 行/);
// Step 1 已执行并保留
assert.equal(getNode(runState.root, `${HOME}/logs/broken.log`)?.content, 'Step 1\n');

// 禁止嵌套 run
stevenNode.children.scripts.children['nested.txt'] = {
  type: 'file',
  name: 'nested.txt',
  content: 'run scripts/start-class.txt\n'
};
let nestedRes = executeCommand('run scripts/nested.txt', runState);
assert.equal(nestedRes.ok, false);
assert.match(nestedRes.output, /禁止在脚本中嵌套执行 run/);

// 行数与大小限制测试
let longContent = Array.from({ length: 60 }, (_, i) => `echo line ${i}`).join('\n');
stevenNode.children.scripts.children['too-long.txt'] = { type: 'file', name: 'too-long.txt', content: longContent };
assert.equal(executeCommand('run scripts/too-long.txt', runState).ok, false);

// 4. 单元 5 四个任务判定测试
// 任务 1：让终端输出一句话
let u5t1State = { root: createUnit5FileSystem('echo'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(tasks[16].check({ state: u5t1State }), false);
// 错误文本
let wrongEcho = executeCommand('echo "Hello World"', u5t1State);
u5t1State.output.push({ command: 'echo "Hello World"', ...wrongEcho });
assert.equal(tasks[16].check({ state: u5t1State }), false);
// 正确文本（双引号）
let rightEcho = executeCommand('echo "Welcome to STEM Lab"', u5t1State);
u5t1State.output.push({ command: 'echo "Welcome to STEM Lab"', ...rightEcho });
assert.equal(tasks[16].check({ state: u5t1State }), true);
// 单引号等价解法
let u5t1Alt = { root: createUnit5FileSystem('echo'), cwd: HOME, successfulCommands: [], output: [] };
let singleEcho = executeCommand("echo 'Welcome to STEM Lab'", u5t1Alt);
u5t1Alt.output.push({ command: "echo 'Welcome to STEM Lab'", ...singleEcho });
assert.equal(tasks[16].check({ state: u5t1Alt }), true);

// 任务 2：把输出保存成日志
let u5t2State = { root: createUnit5FileSystem('redirect'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(tasks[17].check({ state: u5t2State }), false);
let writeLog = executeCommand('echo "Lesson started" > logs/session.log', u5t2State);
assert.equal(writeLog.ok, true);
u5t2State.output.push({ command: 'echo "Lesson started" > logs/session.log', ...writeLog });
// 未用 cat 检查前，尚未完成
assert.equal(tasks[17].check({ state: u5t2State }), false);
let catCheck = executeCommand('cat logs/session.log', u5t2State);
assert.equal(catCheck.ok, true);
u5t2State.output.push({ command: 'cat logs/session.log', ...catCheck });
assert.equal(tasks[17].check({ state: u5t2State }), true);

// 任务 3：追加记录，不丢失旧内容
// 1. 首次进入时的初始状态核对：logs/session.log 已经存在且包含开课记录
const initT3Fs = createUnit5FileSystem('append');
const initT3Log = getNode(initT3Fs, `${HOME}/logs/session.log`);
assert.equal(initT3Log?.type, 'file');
assert.equal(initT3Log?.content, 'Lesson started\n');

let u5t3State = { root: createUnit5FileSystem('append'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(tasks[18].check({ state: u5t3State }), false);

// 2. 错误操作：误用 > 覆盖丢失旧记录，判定不通过
let errState = { root: createUnit5FileSystem('append'), cwd: HOME, successfulCommands: [], output: [] };
let errCmd = executeCommand('echo "Device check: OK" > logs/session.log', errState);
errState.successfulCommands.push('echo "Device check: OK" > logs/session.log');
assert.equal(tasks[18].check({ state: errState }), false);

// 3. 证明不会永久锁死：用户在误操作后，通过合法操作重新写入第 1 行并追加后续行，仍能通过
executeCommand('echo "Lesson started" > logs/session.log', errState);
errState.successfulCommands.push('echo "Lesson started" > logs/session.log');
executeCommand('echo "Device check: OK" >> logs/session.log', errState);
errState.successfulCommands.push('echo "Device check: OK" >> logs/session.log');
executeCommand('echo "Network connected" >> logs/session.log', errState);
errState.successfulCommands.push('echo "Network connected" >> logs/session.log');
assert.equal(tasks[18].check({ state: errState }), true, '合法恢复日志内容后应能正常通过，绝不永久锁死');

// 4. 重置本关后的正常完成路径：使用 >> 连续追加两条
let resetT3State = { root: createUnit5FileSystem('append'), cwd: HOME, successfulCommands: [], output: [] };
executeCommand('echo "Device check: OK" >> logs/session.log', resetT3State);
resetT3State.successfulCommands.push('echo "Device check: OK" >> logs/session.log');
assert.equal(tasks[18].check({ state: resetT3State }), false); // 还需第二条
executeCommand('echo "Network connected" >> logs/session.log', resetT3State);
resetT3State.successfulCommands.push('echo "Network connected" >> logs/session.log');
assert.equal(tasks[18].check({ state: resetT3State }), true);
// 验证内容顺序
let finalContent = getNode(resetT3State.root, `${HOME}/logs/session.log`).content;
assert.equal(finalContent, 'Lesson started\nDevice check: OK\nNetwork connected\n');

// 任务 4：运行第一份自动化清单
let u5t4State = { root: createUnit5FileSystem('run'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(tasks[19].check({ state: u5t4State }), false);
// 步骤 1：cat 查看脚本
let catScript = executeCommand('cat scripts/start-class.txt', u5t4State);
assert.equal(catScript.ok, true);
u5t4State.output.push({ command: 'cat scripts/start-class.txt', ...catScript });
assert.equal(tasks[19].check({ state: u5t4State }), false);
// 步骤 2：run 执行脚本
let runClass = executeCommand('run scripts/start-class.txt', u5t4State);
assert.equal(runClass.ok, true);
u5t4State.output.push({ command: 'run scripts/start-class.txt', ...runClass });
assert.equal(tasks[19].check({ state: u5t4State }), true);

// 验证重复执行检查：再次运行该示例脚本，日志依然保持预期的两行
let runAgain = executeCommand('run scripts/start-class.txt', u5t4State);
assert.equal(runAgain.ok, true);
let logContentAfterRepeat = getNode(u5t4State.root, `${HOME}/logs/session.log`).content;
assert.equal(logContentAfterRepeat, 'Lesson started\nDevices ready\n');
assert.equal(tasks[19].check({ state: u5t4State }), true);

// ==========================================
// 单元 6：读懂命令与查找帮助 测试
// ==========================================

// 1. 帮助命令增强测试：help 与 help <命令名>
let helpState = fresh();
let generalHelp = executeCommand('help', helpState);
assert.equal(generalHelp.ok, true);
assert.match(generalHelp.output, /支持的命令/);

let helpWc = executeCommand('help wc', helpState);
assert.equal(helpWc.ok, true);
assert.match(helpWc.output, /wc -l 文件路径/);
assert.equal(helpWc.commandHelp, 'wc');

let helpRun = executeCommand('help run', helpState);
assert.equal(helpRun.ok, true);
assert.match(helpRun.output, /【网站专用教学命令/);

let helpUnknown = executeCommand('help unknown_cmd', helpState);
assert.equal(helpUnknown.ok, false);
assert.match(helpUnknown.output, /未知命令/);

let helpTooMany = executeCommand('help wc ls', helpState);
assert.equal(helpTooMany.ok, false);
assert.match(helpTooMany.output, /一次只接受一个命令名参数/);

// 2. 单元 6 任务 1：看懂命令的三个部分（grep -i python "Course Notes.txt"）
let u6t1State = { root: createUnit6FileSystem('parts'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(tasks[20].check({ state: u6t1State }), false);

// 错误尝试 A：缺少引号导致文件名被拆分成两个参数
let badQuotes = executeCommand('grep -i python Course Notes.txt', u6t1State);
assert.equal(badQuotes.ok, false);

// 错误尝试 B：未加 -i 选项，仅匹配小写的 1 行
let noOption = executeCommand('grep python "Course Notes.txt"', u6t1State);
assert.equal(noOption.ok, true);
u6t1State.output.push({ command: 'grep python "Course Notes.txt"', ...noOption });
assert.equal(tasks[20].check({ state: u6t1State }), false);

// 正确执行：带 -i 选项，双引号包裹带空格文件名
let goodT1Double = executeCommand('grep -i python "Course Notes.txt"', u6t1State);
assert.equal(goodT1Double.ok, true);
assert.equal(goodT1Double.matchedLines.length, 2);
u6t1State.output.push({ command: 'grep -i python "Course Notes.txt"', ...goodT1Double });
assert.equal(tasks[20].check({ state: u6t1State }), true);

// 等价解法：单引号包裹文件名
let u6t1Single = { root: createUnit6FileSystem('parts'), cwd: HOME, successfulCommands: [], output: [] };
let goodT1Single = executeCommand("grep -i python 'Course Notes.txt'", u6t1Single);
assert.equal(goodT1Single.ok, true);
u6t1Single.output.push({ command: "grep -i python 'Course Notes.txt'", ...goodT1Single });
assert.equal(tasks[20].check({ state: u6t1Single }), true);

// 3. 单元 6 任务 2：进入名字带空格的目录
let u6t2State = { root: createUnit6FileSystem('spaces'), cwd: `${HOME}/lessons`, successfulCommands: [], output: [] };
assert.equal(tasks[21].check({ state: u6t2State }), false);

// 错误尝试：未加引号直接 cd Summer Camp 会报错且 cwd 保持不变
let badCdSpace = executeCommand('cd Summer Camp', u6t2State);
assert.equal(badCdSpace.ok, false);
assert.equal(u6t2State.cwd, `${HOME}/lessons`);

// 正确操作：cd "Summer Camp"
let cdQuotes = executeCommand('cd "Summer Camp"', u6t2State);
assert.equal(cdQuotes.ok, true);
u6t2State.cwd = cdQuotes.output;
assert.equal(u6t2State.cwd, `${HOME}/lessons/Summer Camp`);

// 执行 pwd 验证
let pwdResult = executeCommand('pwd', u6t2State);
assert.equal(pwdResult.ok, true);
u6t2State.successfulCommands.push('pwd');

// 读取 overview.txt
let catOverview = executeCommand('cat overview.txt', u6t2State);
assert.equal(catOverview.ok, true);
u6t2State.output.push({ command: 'cat overview.txt', ...catOverview });
assert.equal(tasks[21].check({ state: u6t2State }), true);

// 4. 单元 6 任务 3：不会用时，先查帮助
let u6t3State = { root: createUnit6FileSystem('help'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(tasks[22].check({ state: u6t3State }), false);

// 如果直接运行 wc -l notes.txt 而没有先查 help wc，任务不通过
let wcDirect = executeCommand('wc -l notes.txt', u6t3State);
assert.equal(wcDirect.ok, true);
u6t3State.output.push({ command: 'wc -l notes.txt', ...wcDirect });
assert.equal(tasks[22].check({ state: u6t3State }), false);

// 执行 help wc 查看帮助
let helpWcTask = executeCommand('help wc', u6t3State);
assert.equal(helpWcTask.ok, true);
u6t3State.output.push({ command: 'help wc', ...helpWcTask });
// 此时已有 help wc 与 wc -l 输出，判定通过
assert.equal(tasks[22].check({ state: u6t3State }), true);

// 5. 单元 6 任务 4：读懂错误，再修正
let u6t4State = { root: createUnit6FileSystem('fix'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(tasks[23].check({ state: u6t4State }), false);

// 模拟初学者复合连写错误：cd lessons pwd
let badComposite = executeCommand('cd lessons pwd', u6t4State);
assert.equal(badComposite.ok, false);
assert.equal(u6t4State.cwd, HOME, '错误命令不能修改当前工作目录');

// 修正并分步执行：
// 步骤 1：cd lessons
let cdLessons = executeCommand('cd lessons', u6t4State);
assert.equal(cdLessons.ok, true);
u6t4State.cwd = cdLessons.output;
u6t4State.successfulCommands.push('cd lessons');

// 步骤 2：pwd 确认位置
let pwdFix = executeCommand('pwd', u6t4State);
assert.equal(pwdFix.ok, true);
u6t4State.successfulCommands.push('pwd');

// 步骤 3：cat course-overview.txt 读取说明
let catOverviewFix = executeCommand('cat course-overview.txt', u6t4State);
assert.equal(catOverviewFix.ok, true);
u6t4State.output.push({ command: 'cat course-overview.txt', ...catOverviewFix });

assert.equal(tasks[23].check({ state: u6t4State }), true);

// 验证：不要求必须先输入错误命令，直接正确完成也应通过
let directCorrectState = { root: createUnit6FileSystem('fix'), cwd: HOME, successfulCommands: [], output: [] };
let dirCd = executeCommand('cd lessons', directCorrectState);
directCorrectState.cwd = dirCd.output;
directCorrectState.successfulCommands.push('cd lessons');
let dirPwd = executeCommand('pwd', directCorrectState);
directCorrectState.successfulCommands.push('pwd');
let dirCat = executeCommand('cat course-overview.txt', directCorrectState);
directCorrectState.output.push({ command: 'cat course-overview.txt', ...dirCat });
assert.equal(tasks[23].check({ state: directCorrectState }), true);

console.log('全部测试通过：路径解析、命令边界、防覆盖保护、单元 1～6 全部 24 个任务判定与自动化执行。');
