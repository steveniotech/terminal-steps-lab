import { HOME, addChild, getNode, getParent, normalizePath, removeChild, tokenize, displayName, file, dir } from './filesystem.js';

export const SUPPORTED = ['pwd', 'ls', 'cd', 'mkdir', 'touch', 'cp', 'mv', 'cat', 'grep', 'wc', 'echo', 'run', 'help', 'clear'];

export const COMMAND_DOCS = {
  pwd: {
    usage: 'pwd',
    summary: '显示当前虚拟工作目录的绝对路径。',
    detail: '用法：pwd\n本阶段不接受参数。执行后返回当前所在目录的完整路径。'
  },
  ls: {
    usage: 'ls [目录路径]',
    summary: '列出目录内容。',
    detail: '用法：ls [目录路径]\n无参数时列出当前工作目录内容；有参数时列出指定目录内容。\n限制：本模拟器仅支持一个目录路径参数，不支持 -l、-a 等选项。'
  },
  cd: {
    usage: 'cd [目录路径]',
    summary: '切换当前工作目录。',
    detail: '用法：cd [目录路径]\n无参数时返回 home 目录（~）；支持相对路径、绝对路径、.、.. 与 ~。\n提示：若目录名包含空格，必须使用单引号或双引号包裹，例如 cd "Summer Camp"。'
  },
  mkdir: {
    usage: 'mkdir 目录路径',
    summary: '创建一个新目录。',
    detail: '用法：mkdir 目录路径\n在指定路径创建一个空目录。\n限制：不支持 -p；若目标已存在或父目录不存在将拒绝操作。'
  },
  touch: {
    usage: 'touch 文件路径',
    summary: '创建一个空文件。',
    detail: '用法：touch 文件路径\n在指定路径创建一个空文件；若文件已存在，保留原内容不清空。'
  },
  cp: {
    usage: 'cp 源文件 目标',
    summary: '复制单个文件。',
    detail: '用法：cp 源文件 目标路径\n复制单个文件，并完整保留源文件。\n安全保护：拒绝覆盖已有目标文件，保护原数据不丢失。'
  },
  mv: {
    usage: 'mv 源文件 目标',
    summary: '移动或重命名单个文件。',
    detail: '用法：mv 源文件 目标路径\n将源文件移动或重命名至目标路径，原路径消失。\n安全保护：拒绝覆盖已有目标文件。'
  },
  cat: {
    usage: 'cat 文件路径',
    summary: '原样读取并显示文本文件内容。',
    detail: '用法：cat 文件路径\n读取指定文件并在终端输出原文，不修改文件内容。\n限制：本阶段每次仅读取一个文件，不支持多文件拼接。'
  },
  grep: {
    usage: 'grep [-i] 关键词 文件路径',
    summary: '在文件中字面搜索包含关键词的行。',
    detail: '用法：grep [-i] 关键词 文件路径\n返回包含关键词的所有匹配整行。默认区分大小写，加入 -i 选项可忽略大小写。\n限制：本模拟器仅支持字面文本搜索，不支持正则表达式。'
  },
  wc: {
    usage: 'wc -l 文件路径',
    summary: '统计文件中的换行符行数。',
    detail: '用法：wc -l 文件路径\n统计并输出文件中的换行符数量。\n支持：必须带 -l 选项；可配合管道 grep ... | wc -l 统计匹配行数。\n限制：本模拟器不支持 -w、-c 等其他选项。'
  },
  echo: {
    usage: 'echo [文本]',
    summary: '在终端输出文本内容。',
    detail: '用法：echo [文本]\n将参数文本打印至终端。带空格的文本建议用引号包裹。\n支持：可结合 > 或 >> 输出重定向写入文件。'
  },
  run: {
    usage: 'run 脚本文件',
    summary: '【网站专用教学命令】顺序执行清单中的命令。',
    detail: '用法：run 脚本文件\n【网站专用教学命令，非系统通用 Shell 命令】\n按顺序执行文件中的每行命令，自动跳过空行与 # 开头的注释行。\n遇到首个错误立即停止并报告行号。不支持变量、循环或嵌套 run。'
  },
  help: {
    usage: 'help [命令名]',
    summary: '查看支持的命令或具体命令的用法说明。',
    detail: '用法：help [命令名]\n直接输入 help 查看全部可用命令概览；输入 help <命令名> 查看指定命令的详细用法与限制说明。'
  },
  clear: {
    usage: 'clear',
    summary: '清空终端屏幕显示。',
    detail: '用法：clear 或快捷键 Ctrl+L\n清空终端屏幕历史显示；不改变当前工作目录、文件系统或学习进度。'
  }
};

function failure(message, teaching = '') { return { ok: false, output: message, teaching, changed: false, mutated: false }; }
function success(output = '', teaching = '', changed = false, mutated = false, extra = {}) { return { ok: true, output, teaching, changed, mutated, ...extra }; }
function optionFailure(command) { return failure(`${command}：本阶段尚未支持选项。`, `先使用 ${command} 的基础形式；本轮不支持带选项的写法。`); }
function parentFailure(path, cwd) { return failure(`路径不存在：${path}`, `你当前位于 ${cwd}。请先确认父目录存在，失败时文件系统不会改变。`); }

function resolveDestination(root, rawTarget, cwd, source) {
  const targetPath = normalizePath(rawTarget, cwd);
  const target = getNode(root, targetPath);
  if (target?.type === 'dir') {
    const finalPath = normalizePath(`${targetPath}/${source.name}`, '/');
    return { path: finalPath, target: getNode(root, finalPath), container: target, isDirectory: true };
  }
  return { path: targetPath, target, isDirectory: false };
}

function splitPipeline(input) {
  let quote = null;
  let separator = -1;
  let count = 0;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quote) { if (char === quote) quote = null; continue; }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (char === '|') { separator = index; count += 1; }
  }
  if (count > 1) return { error: '本模拟器只支持一条有限管道。', teaching: '本轮只支持 grep ... | wc -l。' };
  if (separator < 0) return { left: null, right: null };
  return { left: input.slice(0, separator).trim(), right: input.slice(separator + 1).trim() };
}

function splitRedirection(input) {
  let quote = null;
  let opIndex = -1;
  let op = null;
  let count = 0;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quote) { if (char === quote) quote = null; continue; }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (char === '>') {
      if (input[index + 1] === '>') {
        count += 1;
        if (opIndex < 0) { opIndex = index; op = '>>'; }
        index += 1;
      } else {
        count += 1;
        if (opIndex < 0) { opIndex = index; op = '>'; }
      }
    }
  }
  if (count > 1) return { error: '本模拟器只支持单个重定向符号（> 或 >>）。', teaching: '本阶段不支持多重重定向。' };
  if (!op) return { left: null, right: null, op: null };
  const left = input.slice(0, opIndex).trim();
  const right = input.slice(opIndex + op.length).trim();
  return { left, right, op };
}

function hasUnsupportedSyntax(input) {
  let quote = null;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quote) { if (char === quote) quote = null; continue; }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (/[;&*<]/.test(char)) return true;
  }
  return false;
}

function readFile(root, rawPath, cwd, command) {
  const path = normalizePath(rawPath, cwd);
  const node = getNode(root, path);
  if (!node) return { error: failure(`${command}: ${rawPath}: 文件不存在`, `你当前位于 ${cwd}。请检查文件路径；文件系统没有改变。`) };
  if (node.type !== 'file') return { error: failure(`${command}: ${rawPath}: 是目录`, `${command} 本轮只读取文件，不读取目录。`) };
  return { path, node };
}

function lineContent(content) { return content.split('\n').map(line => line.endsWith('\r') ? line.slice(0, -1) : line); }

function executeGrep(args, state) {
  let ignoreCase = false;
  if (args[0] === '-i') { ignoreCase = true; args = args.slice(1); }
  else if (args[0]?.startsWith('-')) return optionFailure('grep');
  if (args.length !== 2) return failure('grep：需要关键词和一个文件路径两个参数。', '命令结构：grep [-i] 关键词 文件。');
  const [keyword, rawPath] = args;
  if (!keyword) return failure('grep：关键词不能为空。', '本教学模拟器只支持对非空字面文本进行搜索。');
  const read = readFile(state.root, rawPath, state.cwd, 'grep');
  if (read.error) return read.error;
  const needle = ignoreCase ? keyword.toLocaleLowerCase() : keyword;
  const matches = lineContent(read.node.content).filter(line => (ignoreCase ? line.toLocaleLowerCase() : line).includes(needle));
  return success(matches.join('\n'), matches.length ? `找到 ${matches.length} 行匹配内容。这里是字面搜索，不是完整正则表达式 grep。` : '没有匹配行；这是有效的搜索结果，不是命令格式错误。', false, false, { matchedLines: matches, grep: true, path: read.path, ignoreCase, keyword });
}

function executePipeline(input, state) {
  const parts = splitPipeline(input);
  if (parts.error) return failure(parts.error, parts.teaching);
  if (!parts.left) return failure('管道左侧不能为空。', '本轮格式是 grep [-i] 关键词 文件 | wc -l。');
  if (parts.right !== 'wc -l') return failure('不支持的管道组合。', '本轮只支持 grep [-i] 关键词 文件 | wc -l。');
  const left = tokenize(parts.left);
  if (left.error) return failure(left.error, '请补上引号后再运行。');
  if (left.tokens[0] !== 'grep') return failure('管道左侧必须是 grep。', '本轮只统计 grep 输出的匹配行。');
  const grepResult = executeGrep(left.tokens.slice(1), state);
  if (!grepResult.ok) return grepResult;
  return success(String(grepResult.matchedLines.length), `wc -l 统计左侧 grep 实际输出的匹配行数：${grepResult.matchedLines.length}。同一行多个关键词仍只计一行。`, false, false, { pipeline: true, matchedLines: grepResult.matchedLines });
}

function executeRedirection(redirection, state, options) {
  if (!redirection.left) {
    return failure('重定向左侧不能为空。', '请在重定向符号左侧提供可执行的命令，例如 echo 或 cat。');
  }
  if (!redirection.right) {
    return failure('重定向缺少目标文件路径。', `命令结构：命令 ${redirection.op} 目标文件。`);
  }
  const rightParsed = tokenize(redirection.right);
  if (rightParsed.error) return failure(rightParsed.error, '目标文件名格式有误。');
  if (rightParsed.tokens.length !== 1) {
    return failure('重定向目标路径无效。', '重定向右侧只接受一个目标文件路径。');
  }
  const targetPath = rightParsed.tokens[0];

  const leftParsed = tokenize(redirection.left);
  if (leftParsed.error) return failure(leftParsed.error, '左侧命令引号未闭合。');
  if (!leftParsed.tokens.length) return failure('重定向左侧不能为空。', '请在重定向符号左侧提供命令。');
  const leftCmd = leftParsed.tokens[0];
  if (leftCmd !== 'echo' && leftCmd !== 'cat') {
    return failure(`${leftCmd}：本阶段重定向仅支持 echo 和 cat。`, '你可以使用 echo 文本 > 文件，或 cat 文件 > 新文件。');
  }

  let contentToWrite = '';
  if (leftCmd === 'echo') {
    const text = leftParsed.tokens.slice(1).join(' ');
    contentToWrite = text + '\n';
  } else if (leftCmd === 'cat') {
    const catRes = executeCommand(redirection.left, state, options);
    if (!catRes.ok) return catRes;
    contentToWrite = catRes.output;
  }

  const destPath = normalizePath(targetPath, state.cwd);
  const targetNode = getNode(state.root, destPath);
  if (targetNode?.type === 'dir') {
    return failure(`重定向失败：${targetPath}: 是目录`, '重定向目标必须是文件，不能是目录。');
  }
  const parentInfo = getParent(state.root, destPath);
  if (!parentInfo?.parent || parentInfo.parent.type !== 'dir') {
    return parentFailure(targetPath, state.cwd);
  }

  if (redirection.op === '>') {
    if (targetNode) {
      targetNode.content = contentToWrite;
    } else {
      addChild(state.root, destPath, file(parentInfo.name, contentToWrite));
    }
    return success('', `已将输出重定向写入 ${destPath}（已覆盖原内容）。`, false, true, { redirection: true, op: '>', targetPath: destPath, content: contentToWrite });
  } else {
    if (targetNode) {
      targetNode.content += contentToWrite;
    } else {
      addChild(state.root, destPath, file(parentInfo.name, contentToWrite));
    }
    return success('', `已将输出追加写入 ${destPath}。`, false, true, { redirection: true, op: '>>', targetPath: destPath, content: contentToWrite });
  }
}

function executeRun(args, state, options = {}) {
  if (options.isScript) {
    return failure('run：禁止在脚本中嵌套执行 run。', '本教学模拟器不支持脚本递归或嵌套调用。');
  }
  if (args.length !== 1) {
    return failure('run：需要一个脚本文件路径。', '命令结构：run 脚本路径；run 是本教学模拟器专用的命令清单执行器。');
  }
  const read = readFile(state.root, args[0], state.cwd, 'run');
  if (read.error) return read.error;
  if (read.node.content.length > 10240) {
    return failure('run：脚本文件过大（超过 10KB 上限）。', '教学清单应保持简短清晰。');
  }
  const rawLines = read.node.content.split(/\r?\n/);
  if (rawLines.length > 50) {
    return failure('run：脚本行数过多（超过 50 行上限）。', '教学清单应保持简短清晰。');
  }
  const executedLines = [];
  let anyMutated = false;
  let anyChanged = false;
  for (let index = 0; index < rawLines.length; index += 1) {
    const lineNum = index + 1;
    const trimmed = rawLines[index].trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const tokens = tokenize(trimmed);
    if (!tokens.error && tokens.tokens[0] === 'run') {
      return failure(`run：第 ${lineNum} 行错误：禁止在脚本中嵌套执行 run。`, '本教学模拟器不支持脚本递归或嵌套调用。');
    }
    const res = executeCommand(trimmed, state, { isScript: true });
    if (!res.ok) {
      return failure(`run：执行中断于第 ${lineNum} 行：${trimmed}\n原因：${res.output}`, `前序已执行的修改已保留；${res.teaching || ''}`);
    }
    if (res.mutated) anyMutated = true;
    if (res.changed) {
      anyChanged = true;
      state.cwd = res.output;
    }
    const commandName = trimmed.split(/\s+/)[0];
    if (!['help', 'clear'].includes(commandName)) {
      state.successfulCommands.push(trimmed);
    }
    if (res.output) {
      executedLines.push(`[第 ${lineNum} 行] ${trimmed}\n${res.output}`);
    } else {
      executedLines.push(`[第 ${lineNum} 行] ${trimmed}`);
    }
  }
  const summaryOutput = executedLines.join('\n');
  return success(summaryOutput, '自动化清单执行完毕。run 是本教学模拟器专用命令，用于按顺序执行命令清单。', anyChanged, anyMutated, { run: true, scriptPath: read.path, executedCount: executedLines.length });
}

export function executeCommand(input, state, options = {}) {
  const redirection = splitRedirection(input);
  if (redirection.error) return failure(redirection.error, redirection.teaching);
  const pipeline = splitPipeline(input);
  if (pipeline.error) return failure(pipeline.error, pipeline.teaching);
  if (redirection.op && pipeline.left !== null) {
    return failure('本模拟器尚不支持同时使用管道与重定向。', '请分开使用管道或重定向。');
  }
  if (redirection.op) return executeRedirection(redirection, state, options);
  if (pipeline.left !== null) return executePipeline(input, state);
  if (hasUnsupportedSyntax(input)) return failure('本模拟器尚不支持通配符、多命令连接或其他复杂语法。', '本轮请一次输入一条基础命令；引号中的特殊字符可以作为字面搜索内容。');
  const parsed = tokenize(input.trim());
  if (parsed.error) return failure(parsed.error, '引号中的空格和特殊符号会保留在同一个参数里。');
  if (!parsed.tokens.length) return success();
  const [command, ...args] = parsed.tokens;
  if (!SUPPORTED.includes(command)) return failure(`命令未支持：${command}`, `这是练习环境的范围限制；当前支持：${SUPPORTED.join(', ')}。`);
  if (command === 'clear') return success('', 'clear 只清空终端显示，不改变目录、任务或进度。', false, false, { clear: true });
  if (command === 'help') {
    if (args.length > 1) return failure('help：一次只接受一个命令名参数。', '结构：help [命令名]，例如 help wc。');
    if (args.length === 1) {
      const target = args[0].toLowerCase();
      const doc = COMMAND_DOCS[target];
      if (!doc) return failure(`help: 未知命令 "${args[0]}"`, `当前支持的命令：${SUPPORTED.join(', ')}。输入 help 查看完整列表。`);
      return success(`${doc.usage}\n${doc.summary}\n\n${doc.detail}`, '仔细阅读命令语法与限制，避免误用参数。', false, false, { help: true, commandHelp: target });
    }
    return success('支持的命令：\npwd              显示当前绝对路径\nls [目录路径]    列出目录内容\ncd [目录路径]    进入目录；无参数返回 home\nmkdir 目录路径   创建一个目录（不支持 -p）\ntouch 文件路径   创建文件；已有文件内容不清空\ncp 源文件 目标   复制单个文件，不覆盖\nmv 源文件 目标   移动或重命名单个文件，不覆盖\ncat 文件         原样读取一个文本文件\ngrep [-i] 关键词 文件  字面搜索并返回匹配行\nwc -l 文件       统计换行符数量\ngrep ... | wc -l  仅支持有限的匹配行统计管道\necho [文本]      在终端输出文本\n> / >>           输出重定向（> 覆盖，>> 追加；仅支持 echo 和 cat）\nrun 脚本文件     【网站专用】按顺序执行文件中的命令清单\nhelp [命令名]    查看命令说明（例如 help wc）\nclear            清空终端显示\n\n支持：绝对/相对路径、.、..、~、单引号和双引号。\ngrep 是本教学模拟器的字面搜索子集；wc -l 统计换行符数量。\nrun 是本网站专用的教学命令，非通用 Shell 命令，不支持循环、变量或嵌套 run。\n重定向目前仅支持 echo 文本 [>|>>] 文件 以及 cat 文件 [>|>>] 文件。\n拒绝覆盖是 cp/mv 的安全保护，> 覆盖写入是重定向的标准行为。\n本轮不支持通配符、环境变量、多命令连接或任意复杂重定向。', 'help 只说明本模拟器已实现的范围。可使用 help <命令名> 查看具体命令用法。', false, false, { help: true, commandHelp: null });
  }
  if (command === 'pwd') {
    if (args.length) return failure('pwd：本阶段不接受参数。', '先只输入 pwd，观察当前目录。');
    return success(state.cwd, '这是当前虚拟目录的绝对路径。');
  }
  if (command === 'ls') {
    if (args.some(arg => arg.startsWith('-'))) return optionFailure('ls');
    if (args.length > 1) return failure('ls：本阶段只接受一个目录路径参数。', '结构是 ls [目录路径]。');
    const targetPath = normalizePath(args[0] ?? '.', state.cwd);
    const node = getNode(state.root, targetPath);
    if (!node) return failure(`ls: ${args[0]}: 目录不存在`, `你当前位于 ${state.cwd}。可以先用 ls 查看这里有哪些目录。`);
    if (node.type !== 'dir') return failure(`ls: ${args[0]}: 不是目录`, 'ls 需要查看目录；请换成目录路径。');
    return success(Object.values(node.children).map(displayName).join('  '), `已列出 ${targetPath} 的内容。`);
  }
  if (command === 'cd') {
    if (args.some(arg => arg.startsWith('-'))) return optionFailure('cd');
    if (args.length > 1) return failure('cd：本阶段只接受一个目录路径参数。', '路径含空格时请使用引号，例如 cd "Summer Camp"。');
    const targetPath = normalizePath(args[0] ?? '~', state.cwd);
    const node = getNode(state.root, targetPath);
    if (!node) return failure(`cd: ${args[0] ?? '~'}: 目录不存在`, `你当前位于 ${state.cwd}，路径没有改变。`);
    if (node.type !== 'dir') return failure(`cd: ${args[0]}: 不是目录`, 'cd 只能进入目录，不能进入文件；路径没有改变。');
    return success(targetPath, `已进入 ${targetPath}。`, true);
  }
  if (command === 'mkdir') {
    if (args.some(arg => arg.startsWith('-'))) return optionFailure('mkdir');
    if (args.length !== 1) return failure('mkdir：需要一个目录路径参数。', '命令结构：mkdir 目录路径。');
    const targetPath = normalizePath(args[0], state.cwd);
    if (getNode(state.root, targetPath)) return failure(`mkdir: ${args[0]}: 目录或文件已存在`, '本模拟器拒绝覆盖或替换已有对象。');
    const info = getParent(state.root, targetPath);
    if (!info?.parent || info.parent.type !== 'dir') return parentFailure(args[0], state.cwd);
    addChild(state.root, targetPath, dir(info.name));
    return success(`已创建目录 ${targetPath}`, 'mkdir 创建了一个目录。', false, true);
  }
  if (command === 'touch') {
    if (args.some(arg => arg.startsWith('-'))) return optionFailure('touch');
    if (args.length !== 1) return failure('touch：需要一个文件路径参数。', '命令结构：touch 文件路径。');
    const targetPath = normalizePath(args[0], state.cwd);
    const existing = getNode(state.root, targetPath);
    if (existing?.type === 'dir') return failure(`touch: ${args[0]}: 是目录`, 'touch 的目标必须是文件；文件系统没有改变。');
    if (existing?.type === 'file') return success(`文件已存在，内容保持不变 ${targetPath}`, '本模拟器不模拟时间戳；已有文件不会被清空。');
    const info = getParent(state.root, targetPath);
    if (!info?.parent || info.parent.type !== 'dir') return parentFailure(args[0], state.cwd);
    addChild(state.root, targetPath, file(info.name));
    return success(`已创建空文件 ${targetPath}`, 'touch 在指定位置创建了一个空文件。', false, true);
  }
  if (command === 'cp' || command === 'mv') {
    if (args.some(arg => arg.startsWith('-'))) return optionFailure(command);
    if (args.length !== 2) return failure(`${command}：需要源路径和目标路径两个参数。`, `命令结构：${command} 源文件 目标路径。`);
    const sourcePath = normalizePath(args[0], state.cwd);
    const source = getNode(state.root, sourcePath);
    if (!source) return failure(`${command}: ${args[0]}: 源文件不存在`, '请先确认源文件路径；失败时文件系统不会改变。');
    if (source.type !== 'file') return failure(`${command}: ${args[0]}: 不支持目录操作`, `本轮 ${command} 只处理单个文件，不支持目录递归复制或目录移动。`);
    const destination = resolveDestination(state.root, args[1], state.cwd, source);
    if (destination.path === sourcePath) return failure(`${command}: 源路径和目标路径相同`, '源和目标必须是不同路径；文件系统没有改变。');
    if (destination.target) return failure(`${command}: 目标已存在，拒绝覆盖`, '这是本教学模拟器的安全保护；请换一个不存在的目标路径。');
    const info = getParent(state.root, destination.path);
    if (!info?.parent || info.parent.type !== 'dir') return parentFailure(args[1], state.cwd);
    if (command === 'cp') {
      addChild(state.root, destination.path, file(info.name, source.content));
      return success(`已复制文件到 ${destination.path}`, 'cp 复制了文件，源文件仍然保留。', false, true);
    }
    const moved = removeChild(state.root, sourcePath);
    moved.name = info.name;
    addChild(state.root, destination.path, moved);
    return success(`已移动文件到 ${destination.path}`, 'mv 移动或重命名了文件，原路径不再存在。', false, true);
  }
  if (command === 'cat') {
    if (args.length !== 1) return failure('cat：需要一个文件路径参数。', '本轮不支持多个文件拼接；命令结构：cat 文件。');
    const read = readFile(state.root, args[0], state.cwd, 'cat');
    if (read.error) return read.error;
    return success(read.node.content, 'cat 读取并显示文件内容，不会修改文件。', false, false, { cat: true, path: read.path });
  }
  if (command === 'grep') return executeGrep(args, state);
  if (command === 'wc') {
    if (args[0] !== '-l' || args.length !== 2) return failure('wc：本轮只支持 wc -l 文件。', '命令结构：wc -l 文件；管道右侧只支持 wc -l。');
    const read = readFile(state.root, args[1], state.cwd, 'wc');
    if (read.error) return read.error;
    const count = (read.node.content.match(/\n/g) || []).length;
    return success(String(count), `wc -l 统计换行符数量：${count}。末尾没有换行的文本不会额外计数。`, false, false, { wc: true, newlineCount: count, path: read.path });
  }
  if (command === 'echo') {
    const text = args.join(' ');
    return success(text, 'echo 输出文本到终端。', false, false, { echo: true, text });
  }
  if (command === 'run') {
    return executeRun(args, state, options);
  }
  return failure('未知错误');
}
