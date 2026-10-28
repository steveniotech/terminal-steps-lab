export const HOME = '/home/steven';

export function dir(name, children = {}) { return { type: 'dir', name, children }; }
export function file(name, content = '') { return { type: 'file', name, content }; }

export function createUnit1FileSystem() {
  return dir('', {
    home: dir('home', { steven: dir('steven', {
      lessons: dir('lessons', {
        robotics: dir('robotics', { 'session-plan.md': file('session-plan.md') }),
        python: dir('python', { 'automation-notes.md': file('automation-notes.md') }),
        logs: dir('logs', { 'lesson-run.log': file('lesson-run.log') }),
        'Summer Camp': dir('Summer Camp', { 'overview.txt': file('overview.txt') })
      }),
      projects: dir('projects'),
      'course-notes.md': file('course-notes.md')
    }) })
  });
}

export function createUnit2FileSystem(mode = 'base') {
  const root = createUnit1FileSystem();
  const lessons = getNode(root, `${HOME}/lessons`);
  const robotics = getNode(root, `${HOME}/lessons/robotics`);
  if (mode === 'copy') lessons.children['course-template.md'] = file('course-template.md', '# 课程教案模板\n\n目标：\n材料：\n步骤：\n');
  if (mode === 'move') {
    robotics.children['session-record.md'] = file('session-record.md', '日期：待填写\n观察：待填写\n下一步：待填写\n');
    robotics.children.archive = dir('archive');
  }
  return root;
}

export function createUnit3FileSystem(mode = 'cat') {
  const root = createUnit1FileSystem();
  const lessons = getNode(root, `${HOME}/lessons`);
  const logs = getNode(root, `${HOME}/lessons/logs`);
  if (mode === 'cat') lessons.children['course-overview.txt'] = file('course-overview.txt', '课程说明\n\n本课程用于整理教案、记录练习结果，并在操作后确认文件状态。\n读取文件不会修改文件内容。\n');
  if (mode === 'grep') lessons.children['keyword-notes.txt'] = file('keyword-notes.txt', 'robotics 课程需要先确认材料。\npython 自动化记录放在另一个目录。\nrobotics 课程结束后记录观察。\n');
  if (mode === 'case') lessons.children['case-notes.txt'] = file('case-notes.txt', 'Python automation uses scripts.\npython practice notes are separate.\nPYTHON is worth noticing.\n');
  if (mode === 'pipeline') logs.children['lesson-run.log'] = file('lesson-run.log', 'INFO robotics lesson started\nERROR missing material\nINFO learner checked the folder\nERROR robotics retry requested\n\nERROR missing material\n');
  return root;
}

export function createUnit4FileSystem(mode = 'open') {
  const root = createUnit1FileSystem();
  const lessons = getNode(root, `${HOME}/lessons`);
  const robotics = getNode(root, `${HOME}/lessons/robotics`);
  const logs = getNode(root, `${HOME}/lessons/logs`);
  const projects = getNode(root, `${HOME}/projects`);

  if (mode === 'open') {
    lessons.children['course-overview.txt'] = file(
      'course-overview.txt',
      '课程总览与准备指南\n\n1. 课前核对器材清单。\n2. 检查控制板供电。\n3. 如果找不到文件，先用 pwd 确认所在目录，再用 ls 观察。\n'
    );
  } else if (mode === 'rename') {
    robotics.children['session-reocrd.md'] = file(
      'session-reocrd.md',
      '# 机器人课程记录\n\n日期：2026-10-24\n学员已完成机械臂初装，步进电机测试正常。\n'
    );
  } else if (mode === 'log') {
    logs.children['hardware-check.log'] = file(
      'hardware-check.log',
      '[10:00] INFO system init completed\n[10:02] WARN battery voltage low\n[10:05] INFO motor calibrated\n[10:08] WARN motor temperature high\n[10:12] INFO sensor ready\n[10:15] WARN battery voltage low\n'
    );
  } else if (mode === 'organize') {
    projects.children['starter'] = dir('starter', {
      'template.md': file('template.md', '# 教学方案模板\n\n1. 教学目标\n2. 实验步骤\n3. 课后总结\n'),
      'notes-draft.txt': file('notes-draft.txt', '第1课实验记录：传感器工作正常，数据已采集。\n'),
      'readme.txt': file('readme.txt', '工作区整理指南：\n1. 创建 docs 和 records 两个目录。\n2. 将 template.md 复制到 docs/。\n3. 将 notes-draft.txt 移动到 records/ 并更名为 lesson-01.txt。\n')
    });
  }

  return root;
}

export function createUnit5FileSystem(mode = 'echo') {
  const root = createUnit1FileSystem();
  const steven = getNode(root, HOME);
  if (!steven.children.logs) {
    steven.children.logs = dir('logs');
  }
  const logs = steven.children.logs;

  if (mode === 'redirect') {
    // logs 目录已存在，等待创建 session.log
  } else if (mode === 'append') {
    logs.children['session.log'] = file('session.log', 'Lesson started\n');
  } else if (mode === 'run') {
    steven.children.scripts = dir('scripts', {
      'start-class.txt': file(
        'start-class.txt',
        '# 课程启动自动化清单\n# 第一步：写入开课记录（使用 > 重新开辟新会话日志）\necho "Lesson started" > logs/session.log\n\n# 第二步：追加设备准备状态\necho "Devices ready" >> logs/session.log\n\n# 第三步：读取日志确认结果\ncat logs/session.log\n'
      )
    });
  }

  return root;
}

export function createUnit6FileSystem(mode = 'parts') {
  const root = createUnit1FileSystem();
  const steven = getNode(root, HOME);
  const lessons = getNode(root, `${HOME}/lessons`);

  if (mode === 'parts') {
    steven.children['Course Notes.txt'] = file(
      'Course Notes.txt',
      'Python automation is simple and fast.\nTerminal basics require regular practice.\npython scripts can save repetitive work.\nKeep your notes organized and clean.\n'
    );
  } else if (mode === 'spaces') {
    const summerCamp = lessons.children['Summer Camp'];
    summerCamp.children['overview.txt'] = file(
      'overview.txt',
      '夏令营活动总览\n\n1. 课程主题：智能硬件与自动化初探。\n2. 场地：科技探索中心 B2 教室。\n3. 目标：建立清晰的工作区，完成练习记录。\n'
    );
  } else if (mode === 'help') {
    steven.children['notes.txt'] = file(
      'notes.txt',
      '第一行：核对课程硬件清单\n第二行：检查传感器接线\n第三行：测试电机供电\n第四行：整理操作记录\n'
    );
  } else if (mode === 'fix') {
    lessons.children['course-overview.txt'] = file(
      'course-overview.txt',
      '课程说明\n\n本课程用于整理教案、记录练习结果，并在操作后确认文件状态。\n读取文件不会修改文件内容。\n'
    );
  }

  return root;
}

export function cloneNode(node) {
  return node.type === 'file' ? file(node.name, node.content) : dir(node.name, Object.fromEntries(Object.entries(node.children).map(([key, child]) => [key, cloneNode(child)])));
}

export function splitPath(input) {
  return input.split('/').filter(Boolean);
}

export function normalizePath(input, cwd = HOME) {
  const raw = input === '' || input === '~' ? HOME : (input.startsWith('/') ? input : (input.startsWith('~/') ? `${HOME}/${input.slice(2)}` : `${cwd}/${input}`));
  const parts = [];
  for (const part of splitPath(raw)) {
    if (part === '.' || part === '') continue;
    if (part === '..') parts.pop(); else parts.push(part);
  }
  return '/' + parts.join('/');
}

export function getNode(root, path) {
  if (path === '/') return root;
  let node = root;
  for (const segment of splitPath(path)) {
    if (node.type !== 'dir' || !node.children[segment]) return null;
    node = node.children[segment];
  }
  return node;
}

export function getParent(root, path) {
  const segments = splitPath(path);
  if (!segments.length) return null;
  const name = segments.pop();
  const parentPath = '/' + segments.join('/');
  const parent = getNode(root, parentPath);
  return { parent, name, parentPath: parentPath || '/' };
}

export function addChild(root, path, node) {
  const info = getParent(root, path);
  if (!info?.parent || info.parent.type !== 'dir') return false;
  info.parent.children[info.name] = node;
  return true;
}

export function removeChild(root, path) {
  const info = getParent(root, path);
  if (!info?.parent || info.parent.type !== 'dir' || !info.parent.children[info.name]) return null;
  const removed = info.parent.children[info.name];
  delete info.parent.children[info.name];
  return removed;
}

export function parsePath(raw, cwd = HOME) { return normalizePath(raw, cwd); }

export function tokenize(input) {
  const tokens = [];
  let token = '', quote = null, started = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quote) {
      if (char === quote) quote = null; else token += char;
      started = true;
    } else if (char === '"' || char === "'") { quote = char; started = true; }
    else if (/\s/.test(char)) { if (started) { tokens.push(token); token = ''; started = false; } }
    else { token += char; started = true; }
  }
  if (quote) return { error: `未闭合的${quote === '"' ? '双' : '单'}引号。请补上引号后再运行。` };
  if (started) tokens.push(token);
  return { tokens };
}

export function displayName(node) { return node.type === 'dir' ? `${node.name}/` : node.name; }
