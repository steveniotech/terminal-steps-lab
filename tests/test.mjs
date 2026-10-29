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
assert.match(html, /placeholder="Type pwd, then press Enter"/);
assert.match(html, /<div id="unit-tabs"/);
assert.match(html, /02 Set Up Workspace · Ready/);
assert.match(html, /03 Read and Search · Ready/);
assert.match(html, /04 Troubleshoot and Challenge · Ready/);
assert.match(html, /05 Output, Logs and Automation · Ready/);
assert.match(html, /06 Command Structure and Help · Ready/);
assert.match(html, /07 Find Files and Batch Select · Planned/);
assert.match(html, /12 Git and AI CLI Workflow · Planned/);
assert.match(html, /Cache-Control/);
assert.doesNotMatch(html, /(href|src)=["']\/(?!\/)/, 'Do not use root-relative paths starting with /, ensuring support for GitHub Pages project subpath deployment');
assert.doesNotMatch(html, /localhost|127\.0\.0\.1/, 'Page should not contain local dev server addresses');
assert.match(html, /href=["']\.\/styles\.css/);
assert.match(html, /src=["']\.\/src\/app\.js/);

const appJs = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
assert.match(appJs, /STORAGE_KEY\s*=\s*['"]terminal-steps-lab:/, 'localStorage must use terminal-steps-lab dedicated namespace');
assert.doesNotMatch(appJs, /localStorage\.clear\(\)/, 'Do not use localStorage.clear() to wipe out origin data');

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
assert.equal(grepResult.ok, true); assert.equal(grepResult.matchedLines.length, 2); assert.equal(grepResult.output, 'robotics lessons require checking materials first.\nrobotics notes are saved after class.');
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

// Unit 4 tests
// Task 1: Why Can I Not Open the File?
let u4t1State = { root: createUnit4FileSystem('open'), cwd: HOME, successfulCommands: [], output: [] };
let failedCat = executeCommand('cat course-overview.txt', u4t1State);
assert.equal(failedCat.ok, false);
assert.equal(u4t1State.cwd, HOME);
assert.equal(tasks[12].check({ state: u4t1State }), false);

// Task 1 Solution A: relative path
let successCatRel = executeCommand('cat lessons/course-overview.txt', u4t1State);
assert.equal(successCatRel.ok, true);
u4t1State.output.push({ command: 'cat lessons/course-overview.txt', ...successCatRel });
assert.equal(tasks[12].check({ state: u4t1State }), true);

// Task 1 Solution B: cd first, then cat
let u4t1Alt = { root: createUnit4FileSystem('open'), cwd: HOME, successfulCommands: [], output: [] };
let cdRes = executeCommand('cd lessons', u4t1Alt);
assert.equal(cdRes.ok, true); u4t1Alt.cwd = cdRes.output; u4t1Alt.successfulCommands.push('cd lessons');
let catRes = executeCommand('cat course-overview.txt', u4t1Alt);
assert.equal(catRes.ok, true); u4t1Alt.output.push({ command: 'cat course-overview.txt', ...catRes });
assert.equal(tasks[12].check({ state: u4t1Alt }), true);

// Task 2: Fix a Misspelled File Name
let u4t2State = { root: createUnit4FileSystem('rename'), cwd: `${HOME}/lessons/robotics`, successfulCommands: [], output: [] };
assert.equal(getNode(u4t2State.root, `${HOME}/lessons/robotics/session-reocrd.md`)?.type, 'file');
assert.equal(getNode(u4t2State.root, `${HOME}/lessons/robotics/session-record.md`), null);
assert.equal(tasks[13].check({ state: u4t2State }), false);

let mvRes = executeCommand('mv session-reocrd.md session-record.md', u4t2State);
assert.equal(mvRes.ok, true);
u4t2State.successfulCommands.push('mv session-reocrd.md session-record.md');
assert.equal(tasks[13].check({ state: u4t2State }), true);
assert.equal(getNode(u4t2State.root, `${HOME}/lessons/robotics/session-reocrd.md`), null);
assert.equal(getNode(u4t2State.root, `${HOME}/lessons/robotics/session-record.md`)?.content.includes('Robotic arm assembly'), true);

// Task 2: overwrite protection test
let beforeTree = JSON.stringify(u4t2State.root);
assert.equal(executeCommand('mv session-record.md session-plan.md', u4t2State).ok, false);
assert.equal(JSON.stringify(u4t2State.root), beforeTree);

// Task 3: Find Clues in Log Files
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

// Task 3 Alternative Solution: cd into logs folder first
let u4t3Alt = { root: createUnit4FileSystem('log'), cwd: `${HOME}/lessons/logs`, successfulCommands: [], output: [] };
let pipeAlt = executeCommand('grep WARN hardware-check.log | wc -l', u4t3Alt);
assert.equal(pipeAlt.ok, true);
assert.equal(pipeAlt.output, '3');
u4t3Alt.output.push({ command: 'grep WARN hardware-check.log | wc -l', ...pipeAlt });
assert.equal(tasks[14].check({ state: u4t3Alt }), true);

// Task 4: Organize Workspace Independently
let u4t4State = { root: createUnit4FileSystem('organize'), cwd: `${HOME}/projects/starter`, successfulCommands: [], output: [] };
assert.equal(tasks[15].check({ state: u4t4State }), false);

// Step 1: create directories
assert.equal(executeCommand('mkdir docs', u4t4State).ok, true);
assert.equal(executeCommand('mkdir records', u4t4State).ok, true);
assert.equal(tasks[15].check({ state: u4t4State }), false);

// Step 2: copy template (keep original)
assert.equal(executeCommand('cp template.md docs/', u4t4State).ok, true);
assert.equal(tasks[15].check({ state: u4t4State }), false);

// Step 3: move draft and rename
assert.equal(executeCommand('mv notes-draft.txt records/lesson-01.txt', u4t4State).ok, true);
assert.equal(tasks[15].check({ state: u4t4State }), true);

// Verify final filesystem state
assert.equal(getNode(u4t4State.root, `${HOME}/projects/starter/template.md`)?.type, 'file');
assert.equal(getNode(u4t4State.root, `${HOME}/projects/starter/docs/template.md`)?.type, 'file');
assert.equal(getNode(u4t4State.root, `${HOME}/projects/starter/notes-draft.txt`), null);
assert.equal(getNode(u4t4State.root, `${HOME}/projects/starter/records/lesson-01.txt`)?.type, 'file');
assert.equal(getNode(u4t4State.root, `${HOME}/projects/starter/readme.txt`)?.type, 'file');

// Task 4 out-of-order solution support
let u4t4Alt = { root: createUnit4FileSystem('organize'), cwd: `${HOME}/projects/starter`, successfulCommands: [], output: [] };
assert.equal(executeCommand('mkdir records', u4t4Alt).ok, true);
assert.equal(executeCommand('mv notes-draft.txt records/lesson-01.txt', u4t4Alt).ok, true);
assert.equal(executeCommand('mkdir docs', u4t4Alt).ok, true);
assert.equal(executeCommand('cp template.md docs', u4t4Alt).ok, true);
assert.equal(tasks[15].check({ state: u4t4Alt }), true);

// Unit 5 basic functionality tests
// 1. echo command
let u5State = { root: createUnit5FileSystem('echo'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(executeCommand('echo hello', u5State).output, 'hello');
assert.equal(executeCommand('echo "Hello STEM"', u5State).output, 'Hello STEM');
assert.equal(executeCommand("echo 'Hello STEM'", u5State).output, 'Hello STEM');
assert.equal(executeCommand('echo', u5State).output, '');
assert.equal(executeCommand('echo "unclosed quote', u5State).ok, false);
assert.equal(executeCommand('echo "a > b"', u5State).output, 'a > b');
assert.equal(executeCommand("echo 'a >> b'", u5State).output, 'a >> b');

// 2. Output redirection > and >>
let redirState = { root: createUnit5FileSystem('redirect'), cwd: HOME, successfulCommands: [], output: [] };
// Create new file
let redir1 = executeCommand('echo "Lesson started" > logs/session.log', redirState);
assert.equal(redir1.ok, true);
assert.equal(getNode(redirState.root, `${HOME}/logs/session.log`)?.content, 'Lesson started\n');

// Overwrite existing content
let redir2 = executeCommand('echo "New header" > logs/session.log', redirState);
assert.equal(redir2.ok, true);
assert.equal(getNode(redirState.root, `${HOME}/logs/session.log`)?.content, 'New header\n');

// Append content
let redir3 = executeCommand('echo "Second line" >> logs/session.log', redirState);
assert.equal(redir3.ok, true);
assert.equal(getNode(redirState.root, `${HOME}/logs/session.log`)?.content, 'New header\nSecond line\n');

// Append to non-existent file (should create)
let redir4 = executeCommand('echo "First line" >> logs/new-file.log', redirState);
assert.equal(redir4.ok, true);
assert.equal(getNode(redirState.root, `${HOME}/logs/new-file.log`)?.content, 'First line\n');

// Failure case: parent directory does not exist
let beforeFail = JSON.stringify(redirState.root);
assert.equal(executeCommand('echo "fail" > missing-dir/file.log', redirState).ok, false);
assert.equal(JSON.stringify(redirState.root), beforeFail);

// Failure case: target is directory
assert.equal(executeCommand('echo "fail" > logs', redirState).ok, false);
assert.equal(JSON.stringify(redirState.root), beforeFail);

// Failure case: missing target path
assert.equal(executeCommand('echo "fail" >', redirState).ok, false);
assert.equal(JSON.stringify(redirState.root), beforeFail);

// Failure case: left command does not support redirection (only echo and cat supported)
assert.equal(executeCommand('ls > logs/list.txt', redirState).ok, false);
assert.equal(JSON.stringify(redirState.root), beforeFail);

// Failure case: left command fails, target file not created/modified
assert.equal(executeCommand('cat missing.txt > logs/fail.txt', redirState).ok, false);
assert.equal(getNode(redirState.root, `${HOME}/logs/fail.txt`), null);

// cat output redirection
let catRedir = executeCommand('cat logs/new-file.log > logs/copy.log', redirState);
assert.equal(catRedir.ok, true);
assert.equal(getNode(redirState.root, `${HOME}/logs/copy.log`)?.content, 'First line\n');

// 3. run command
let scriptRoot = createUnit5FileSystem('run');
let runState = { root: scriptRoot, cwd: HOME, successfulCommands: [], output: [] };

// Missing argument
assert.equal(executeCommand('run', runState).ok, false);
// Script not found
assert.equal(executeCommand('run scripts/missing.txt', runState).ok, false);

// Normal execution of start-class.txt
let runRes = executeCommand('run scripts/start-class.txt', runState);
assert.equal(runRes.ok, true);
assert.equal(runRes.run, true);
assert.equal(getNode(runState.root, `${HOME}/logs/session.log`)?.content, 'Lesson started\nDevices ready\n');

// Repeated execution: first line resets with >, second line appends with >>
let runRes2 = executeCommand('run scripts/start-class.txt', runState);
assert.equal(runRes2.ok, true);
assert.equal(getNode(runState.root, `${HOME}/logs/session.log`)?.content, 'Lesson started\nDevices ready\n');

// Mid-script failure: line number reported, prior changes preserved
const stevenNode = getNode(runState.root, HOME);
stevenNode.children.scripts.children['broken.txt'] = {
  type: 'file',
  name: 'broken.txt',
  content: 'echo "Step 1" > logs/broken.log\ncd missing-folder-fail\necho "Step 3" >> logs/broken.log\n'
};
let brokenRes = executeCommand('run scripts/broken.txt', runState);
assert.equal(brokenRes.ok, false);
assert.match(brokenRes.output, /line 2/i);
assert.equal(getNode(runState.root, `${HOME}/logs/broken.log`)?.content, 'Step 1\n');

// Nested run forbidden
stevenNode.children.scripts.children['nested.txt'] = {
  type: 'file',
  name: 'nested.txt',
  content: 'run scripts/start-class.txt\n'
};
let nestedRes = executeCommand('run scripts/nested.txt', runState);
assert.equal(nestedRes.ok, false);
assert.match(nestedRes.output, /cannot nest run/i);

// Line count and size limit tests
let longContent = Array.from({ length: 60 }, (_, i) => `echo line ${i}`).join('\n');
stevenNode.children.scripts.children['too-long.txt'] = { type: 'file', name: 'too-long.txt', content: longContent };
assert.equal(executeCommand('run scripts/too-long.txt', runState).ok, false);

// 4. Unit 5 task evaluation tests
// Task 1: Print a Message to the Terminal
let u5t1State = { root: createUnit5FileSystem('echo'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(tasks[16].check({ state: u5t1State }), false);
// Wrong text
let wrongEcho = executeCommand('echo "Hello World"', u5t1State);
u5t1State.output.push({ command: 'echo "Hello World"', ...wrongEcho });
assert.equal(tasks[16].check({ state: u5t1State }), false);
// Correct text (double quotes)
let rightEcho = executeCommand('echo "Welcome to STEM Lab"', u5t1State);
u5t1State.output.push({ command: 'echo "Welcome to STEM Lab"', ...rightEcho });
assert.equal(tasks[16].check({ state: u5t1State }), true);
// Single quotes solution
let u5t1Alt = { root: createUnit5FileSystem('echo'), cwd: HOME, successfulCommands: [], output: [] };
let singleEcho = executeCommand("echo 'Welcome to STEM Lab'", u5t1Alt);
u5t1Alt.output.push({ command: "echo 'Welcome to STEM Lab'", ...singleEcho });
assert.equal(tasks[16].check({ state: u5t1Alt }), true);

// Task 2: Save Output into a Log File
let u5t2State = { root: createUnit5FileSystem('redirect'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(tasks[17].check({ state: u5t2State }), false);
let writeLog = executeCommand('echo "Lesson started" > logs/session.log', u5t2State);
assert.equal(writeLog.ok, true);
u5t2State.output.push({ command: 'echo "Lesson started" > logs/session.log', ...writeLog });
// Not complete before cat check
assert.equal(tasks[17].check({ state: u5t2State }), false);
let catCheck = executeCommand('cat logs/session.log', u5t2State);
assert.equal(catCheck.ok, true);
u5t2State.output.push({ command: 'cat logs/session.log', ...catCheck });
assert.equal(tasks[17].check({ state: u5t2State }), true);

// Task 3: Append Records Without Losing Old Data
// Initial state: logs/session.log exists with start record
const initT3Fs = createUnit5FileSystem('append');
const initT3Log = getNode(initT3Fs, `${HOME}/logs/session.log`);
assert.equal(initT3Log?.type, 'file');
assert.equal(initT3Log?.content, 'Lesson started\n');

let u5t3State = { root: createUnit5FileSystem('append'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(tasks[18].check({ state: u5t3State }), false);

// Error case: accidentally overwriting with > fails task
let errState = { root: createUnit5FileSystem('append'), cwd: HOME, successfulCommands: [], output: [] };
let errCmd = executeCommand('echo "Device check: OK" > logs/session.log', errState);
errState.successfulCommands.push('echo "Device check: OK" > logs/session.log');
assert.equal(tasks[18].check({ state: errState }), false);

// Recovery: restoring initial line and appending subsequent lines passes
executeCommand('echo "Lesson started" > logs/session.log', errState);
errState.successfulCommands.push('echo "Lesson started" > logs/session.log');
executeCommand('echo "Device check: OK" >> logs/session.log', errState);
errState.successfulCommands.push('echo "Device check: OK" >> logs/session.log');
executeCommand('echo "Network connected" >> logs/session.log', errState);
errState.successfulCommands.push('echo "Network connected" >> logs/session.log');
assert.equal(tasks[18].check({ state: errState }), true, 'Recovering log content allows task completion');

// Normal workflow: appending two lines with >>
let resetT3State = { root: createUnit5FileSystem('append'), cwd: HOME, successfulCommands: [], output: [] };
executeCommand('echo "Device check: OK" >> logs/session.log', resetT3State);
resetT3State.successfulCommands.push('echo "Device check: OK" >> logs/session.log');
assert.equal(tasks[18].check({ state: resetT3State }), false);
executeCommand('echo "Network connected" >> logs/session.log', resetT3State);
resetT3State.successfulCommands.push('echo "Network connected" >> logs/session.log');
assert.equal(tasks[18].check({ state: resetT3State }), true);
let finalContent = getNode(resetT3State.root, `${HOME}/logs/session.log`).content;
assert.equal(finalContent, 'Lesson started\nDevice check: OK\nNetwork connected\n');

// Task 4: Run Your First Automation Checklist
let u5t4State = { root: createUnit5FileSystem('run'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(tasks[19].check({ state: u5t4State }), false);
// Step 1: inspect script with cat
let catScript = executeCommand('cat scripts/start-class.txt', u5t4State);
assert.equal(catScript.ok, true);
u5t4State.output.push({ command: 'cat scripts/start-class.txt', ...catScript });
assert.equal(tasks[19].check({ state: u5t4State }), false);
// Step 2: run script with run
let runClass = executeCommand('run scripts/start-class.txt', u5t4State);
assert.equal(runClass.ok, true);
u5t4State.output.push({ command: 'run scripts/start-class.txt', ...runClass });
assert.equal(tasks[19].check({ state: u5t4State }), true);

// Repeated execution maintains two lines
let runAgain = executeCommand('run scripts/start-class.txt', u5t4State);
assert.equal(runAgain.ok, true);
let logContentAfterRepeat = getNode(u5t4State.root, `${HOME}/logs/session.log`).content;
assert.equal(logContentAfterRepeat, 'Lesson started\nDevices ready\n');
assert.equal(tasks[19].check({ state: u5t4State }), true);

// ==========================================
// Unit 6: Command Structure and Help Tests
// ==========================================

// 1. Help command enhancements
let helpState = fresh();
let generalHelp = executeCommand('help', helpState);
assert.equal(generalHelp.ok, true);
assert.match(generalHelp.output, /Supported commands/);

let helpWc = executeCommand('help wc', helpState);
assert.equal(helpWc.ok, true);
assert.match(helpWc.output, /wc -l file_path/);
assert.equal(helpWc.commandHelp, 'wc');

let helpRun = executeCommand('help run', helpState);
assert.equal(helpRun.ok, true);
assert.match(helpRun.output, /\[Lab practice tool/);

let helpUnknown = executeCommand('help unknown_cmd', helpState);
assert.equal(helpUnknown.ok, false);
assert.match(helpUnknown.output, /unknown command/i);

let helpTooMany = executeCommand('help wc ls', helpState);
assert.equal(helpTooMany.ok, false);
assert.match(helpTooMany.output, /takes only one command name/i);

// 2. Unit 6 Task 1: Understand the Three Command Parts
let u6t1State = { root: createUnit6FileSystem('parts'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(tasks[20].check({ state: u6t1State }), false);

// Unquoted spaces error
let badQuotes = executeCommand('grep -i python Course Notes.txt', u6t1State);
assert.equal(badQuotes.ok, false);

// Missing -i option (only 1 match)
let noOption = executeCommand('grep python "Course Notes.txt"', u6t1State);
assert.equal(noOption.ok, true);
u6t1State.output.push({ command: 'grep python "Course Notes.txt"', ...noOption });
assert.equal(tasks[20].check({ state: u6t1State }), false);

// Correct execution: -i option and double quoted file name
let goodT1Double = executeCommand('grep -i python "Course Notes.txt"', u6t1State);
assert.equal(goodT1Double.ok, true);
assert.equal(goodT1Double.matchedLines.length, 2);
u6t1State.output.push({ command: 'grep -i python "Course Notes.txt"', ...goodT1Double });
assert.equal(tasks[20].check({ state: u6t1State }), true);

// Single quoted solution
let u6t1Single = { root: createUnit6FileSystem('parts'), cwd: HOME, successfulCommands: [], output: [] };
let goodT1Single = executeCommand("grep -i python 'Course Notes.txt'", u6t1Single);
assert.equal(goodT1Single.ok, true);
u6t1Single.output.push({ command: "grep -i python 'Course Notes.txt'", ...goodT1Single });
assert.equal(tasks[20].check({ state: u6t1Single }), true);

// 3. Unit 6 Task 2: Enter a Folder Name with Spaces
let u6t2State = { root: createUnit6FileSystem('spaces'), cwd: `${HOME}/lessons`, successfulCommands: [], output: [] };
assert.equal(tasks[21].check({ state: u6t2State }), false);

// Unquoted cd Summer Camp fails and keeps cwd unchanged
let badCdSpace = executeCommand('cd Summer Camp', u6t2State);
assert.equal(badCdSpace.ok, false);
assert.equal(u6t2State.cwd, `${HOME}/lessons`);

// Quoted cd "Summer Camp" succeeds
let cdQuotes = executeCommand('cd "Summer Camp"', u6t2State);
assert.equal(cdQuotes.ok, true);
u6t2State.cwd = cdQuotes.output;
assert.equal(u6t2State.cwd, `${HOME}/lessons/Summer Camp`);

// Verify with pwd
let pwdResult = executeCommand('pwd', u6t2State);
assert.equal(pwdResult.ok, true);
u6t2State.successfulCommands.push('pwd');

// Read overview.txt
let catOverview = executeCommand('cat overview.txt', u6t2State);
assert.equal(catOverview.ok, true);
u6t2State.output.push({ command: 'cat overview.txt', ...catOverview });
assert.equal(tasks[21].check({ state: u6t2State }), true);

// 4. Unit 6 Task 3: When in Doubt, Check Help
let u6t3State = { root: createUnit6FileSystem('help'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(tasks[22].check({ state: u6t3State }), false);

// Running wc -l without help wc fails check
let wcDirect = executeCommand('wc -l notes.txt', u6t3State);
assert.equal(wcDirect.ok, true);
u6t3State.output.push({ command: 'wc -l notes.txt', ...wcDirect });
assert.equal(tasks[22].check({ state: u6t3State }), false);

// Running help wc
let helpWcTask = executeCommand('help wc', u6t3State);
assert.equal(helpWcTask.ok, true);
u6t3State.output.push({ command: 'help wc', ...helpWcTask });
assert.equal(tasks[22].check({ state: u6t3State }), true);

// 5. Unit 6 Task 4: Read the Error, Then Fix It
let u6t4State = { root: createUnit6FileSystem('fix'), cwd: HOME, successfulCommands: [], output: [] };
assert.equal(tasks[23].check({ state: u6t4State }), false);

// Composite command error: cd lessons pwd
let badComposite = executeCommand('cd lessons pwd', u6t4State);
assert.equal(badComposite.ok, false);
assert.equal(u6t4State.cwd, HOME, 'Error command must not change cwd');

// Step 1: cd lessons
let cdLessons = executeCommand('cd lessons', u6t4State);
assert.equal(cdLessons.ok, true);
u6t4State.cwd = cdLessons.output;
u6t4State.successfulCommands.push('cd lessons');

// Step 2: pwd
let pwdFix = executeCommand('pwd', u6t4State);
assert.equal(pwdFix.ok, true);
u6t4State.successfulCommands.push('pwd');

// Step 3: cat course-overview.txt
let catOverviewFix = executeCommand('cat course-overview.txt', u6t4State);
assert.equal(catOverviewFix.ok, true);
u6t4State.output.push({ command: 'cat course-overview.txt', ...catOverviewFix });

assert.equal(tasks[23].check({ state: u6t4State }), true);

// Direct correct execution also passes
let directCorrectState = { root: createUnit6FileSystem('fix'), cwd: HOME, successfulCommands: [], output: [] };
let dirCd = executeCommand('cd lessons', directCorrectState);
directCorrectState.cwd = dirCd.output;
directCorrectState.successfulCommands.push('cd lessons');
let dirPwd = executeCommand('pwd', directCorrectState);
directCorrectState.successfulCommands.push('pwd');
let dirCat = executeCommand('cat course-overview.txt', directCorrectState);
directCorrectState.output.push({ command: 'cat course-overview.txt', ...dirCat });
assert.equal(tasks[23].check({ state: directCorrectState }), true);

console.log('All tests passed: path parsing, command boundaries, overwrite protection, and all 24 tasks across Units 1-6.');
