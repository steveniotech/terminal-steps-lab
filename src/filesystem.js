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
  if (mode === 'copy') lessons.children['course-template.md'] = file('course-template.md', '# Lesson Plan Template\n\nGoal:\nMaterials:\nSteps:\n');
  if (mode === 'move') {
    robotics.children['session-record.md'] = file('session-record.md', 'Date: TBD\nObservations: TBD\nNext steps: TBD\n');
    robotics.children.archive = dir('archive');
  }
  return root;
}

export function createUnit3FileSystem(mode = 'cat') {
  const root = createUnit1FileSystem();
  const lessons = getNode(root, `${HOME}/lessons`);
  const logs = getNode(root, `${HOME}/lessons/logs`);
  if (mode === 'cat') lessons.children['course-overview.txt'] = file('course-overview.txt', 'Course Overview\n\nThis course helps you organize lesson plans, record practice results, and verify file status.\nReading a file does not change its content.\n');
  if (mode === 'grep') lessons.children['keyword-notes.txt'] = file('keyword-notes.txt', 'robotics lessons require checking materials first.\npython automation notes are in another folder.\nrobotics notes are saved after class.\n');
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
      'Course Overview and Setup Guide\n\n1. Check the equipment list before class.\n2. Verify the control board power supply.\n3. If a file cannot be found, use pwd to check where you are, then use ls to inspect the folder.\n'
    );
  } else if (mode === 'rename') {
    robotics.children['session-reocrd.md'] = file(
      'session-reocrd.md',
      '# Robotics Class Notes\n\nDate: 2026-10-24\nRobotic arm assembly complete. Stepper motors tested OK.\n'
    );
  } else if (mode === 'log') {
    logs.children['hardware-check.log'] = file(
      'hardware-check.log',
      '[10:00] INFO system init completed\n[10:02] WARN battery voltage low\n[10:05] INFO motor calibrated\n[10:08] WARN motor temperature high\n[10:12] INFO sensor ready\n[10:15] WARN battery voltage low\n'
    );
  } else if (mode === 'organize') {
    projects.children['starter'] = dir('starter', {
      'template.md': file('template.md', '# Lesson Plan Template\n\n1. Lesson Goals\n2. Experiment Steps\n3. Summary\n'),
      'notes-draft.txt': file('notes-draft.txt', 'Lesson 1 Notes: Sensor working normally. Data collected.\n'),
      'readme.txt': file('readme.txt', 'Workspace Organization Guide:\n1. Create docs and records folders.\n2. Copy template.md into docs/.\n3. Move notes-draft.txt into records/ as lesson-01.txt.\n')
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
    // logs folder exists, waiting for session.log
  } else if (mode === 'append') {
    logs.children['session.log'] = file('session.log', 'Lesson started\n');
  } else if (mode === 'run') {
    steven.children.scripts = dir('scripts', {
      'start-class.txt': file(
        'start-class.txt',
        '# Class startup automated list\n# Step 1: Write session log (use > to start a fresh log)\necho "Lesson started" > logs/session.log\n\n# Step 2: Append device status\necho "Devices ready" >> logs/session.log\n\n# Step 3: Read log to verify\ncat logs/session.log\n'
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
      'Summer Camp Overview\n\n1. Topic: Smart hardware and automation.\n2. Room: Lab B2.\n3. Goal: Set up a clean workspace and record your practice.\n'
    );
  } else if (mode === 'help') {
    steven.children['notes.txt'] = file(
      'notes.txt',
      'Line 1: Check hardware list\nLine 2: Verify sensor wiring\nLine 3: Test motor power\nLine 4: Save practice notes\n'
    );
  } else if (mode === 'fix') {
    lessons.children['course-overview.txt'] = file(
      'course-overview.txt',
      'Course Overview\n\nThis course helps you organize lesson plans, record practice results, and verify file status.\nReading a file does not change its content.\n'
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
  if (quote) return { error: `Unclosed ${quote === '"' ? 'double' : 'single'} quote. Add the closing quote and try again.` };
  if (started) tokens.push(token);
  return { tokens };
}

export function displayName(node) { return node.type === 'dir' ? `${node.name}/` : node.name; }
