import { HOME, addChild, getNode, getParent, normalizePath, removeChild, tokenize, displayName, file, dir } from './filesystem.js';

export const SUPPORTED = ['pwd', 'ls', 'cd', 'mkdir', 'touch', 'cp', 'mv', 'cat', 'grep', 'wc', 'echo', 'run', 'help', 'clear'];

export const COMMAND_DOCS = {
  pwd: {
    usage: 'pwd',
    summary: 'Print your current folder path.',
    detail: 'Usage: pwd\nThis command takes no arguments. It shows the full path of the folder you are in.'
  },
  ls: {
    usage: 'ls [folder_path]',
    summary: 'List the contents of a folder.',
    detail: 'Usage: ls [folder_path]\nWithout arguments, it lists files and folders in your current folder. With a path, it lists that folder.\nNote: Options like -l or -a are not supported here.'
  },
  cd: {
    usage: 'cd [folder_path]',
    summary: 'Change your current folder.',
    detail: 'Usage: cd [folder_path]\nWithout arguments, it returns to your home folder (~). You can use relative paths, absolute paths, ., .., and ~.\nTip: If a folder name has spaces, wrap it in quotes, such as cd "Summer Camp".'
  },
  mkdir: {
    usage: 'mkdir folder_path',
    summary: 'Create a new folder.',
    detail: 'Usage: mkdir folder_path\nCreates an empty folder at the given path.\nNote: -p is not supported. It will not overwrite existing files or folders.'
  },
  touch: {
    usage: 'touch file_path',
    summary: 'Create a new empty file.',
    detail: 'Usage: touch file_path\nCreates an empty file at the given path. If the file already exists, its content is kept.'
  },
  cp: {
    usage: 'cp source_file target',
    summary: 'Copy a single file.',
    detail: 'Usage: cp source_file target_path\nCopies a file and keeps the original file.\nSafety: Refuses to overwrite an existing file to protect your data.'
  },
  mv: {
    usage: 'mv source_file target',
    summary: 'Move or rename a single file.',
    detail: 'Usage: mv source_file target_path\nMoves or renames a file to the target path. The old path is removed.\nSafety: Refuses to overwrite an existing file.'
  },
  cat: {
    usage: 'cat file_path',
    summary: 'Read and display file contents.',
    detail: 'Usage: cat file_path\nDisplays text from a file. Reading a file does not change its content.\nNote: Only one file at a time is supported here.'
  },
  grep: {
    usage: 'grep [-i] keyword file_path',
    summary: 'Search for text in a file.',
    detail: 'Usage: grep [-i] keyword file_path\nPrints lines that contain the keyword. It is case-sensitive by default. Add -i to ignore case.\nNote: This simulator searches for exact text matches, not regular expressions.'
  },
  wc: {
    usage: 'wc -l file_path',
    summary: 'Count lines in a file.',
    detail: 'Usage: wc -l file_path\nCounts newline characters in a file.\nNote: Must use -l. Can be used with a pipe: grep ... | wc -l.'
  },
  echo: {
    usage: 'echo [text]',
    summary: 'Print text to the terminal.',
    detail: 'Usage: echo [text]\nPrints your text to the screen. Wrap text with spaces in quotes.\nTip: You can use > or >> to redirect output into a file.'
  },
  run: {
    usage: 'run script_file',
    summary: '[Practice Tool] Run commands from a file in order.',
    detail: 'Usage: run script_file\n[Lab practice tool, not a standard system shell command]\nRuns each command in the file one by one. Skips empty lines and comments (#).\nStops immediately if an error occurs. Loops and nested run commands are not supported.'
  },
  help: {
    usage: 'help [command_name]',
    summary: 'Show available commands or help for a command.',
    detail: 'Usage: help [command_name]\nType help to see all commands. Type help <command_name> (like help wc) to see usage and limits for that command.'
  },
  clear: {
    usage: 'clear',
    summary: 'Clear the terminal screen.',
    detail: 'Usage: clear (or press Ctrl+L)\nClears the terminal screen. Does not change your current folder, files, or progress.'
  }
};

function failure(message, teaching = '') { return { ok: false, output: message, teaching, changed: false, mutated: false }; }
function success(output = '', teaching = '', changed = false, mutated = false, extra = {}) { return { ok: true, output, teaching, changed, mutated, ...extra }; }
function optionFailure(command) { return failure(`${command}: options are not supported in this stage.`, `Use the basic form of ${command}.`); }
function parentFailure(path, cwd) { return failure(`Path does not exist: ${path}`, `You are in ${cwd}. Check that the parent folder exists. Files were not changed.`); }

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
  if (count > 1) return { error: 'This simulator only supports a single pipe.', teaching: 'Only grep ... | wc -l is supported.' };
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
  if (count > 1) return { error: 'Only a single redirection operator (> or >>) is supported.', teaching: 'Multiple redirections are not supported.' };
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
  if (!node) return { error: failure(`${command}: ${rawPath}: No such file`, `You are in ${cwd}. Check the file path. Files were not changed.`) };
  if (node.type !== 'file') return { error: failure(`${command}: ${rawPath}: Is a directory`, `${command} only reads files, not folders.`) };
  return { path, node };
}

function lineContent(content) { return content.split('\n').map(line => line.endsWith('\r') ? line.slice(0, -1) : line); }

function executeGrep(args, state) {
  let ignoreCase = false;
  if (args[0] === '-i') { ignoreCase = true; args = args.slice(1); }
  else if (args[0]?.startsWith('-')) return optionFailure('grep');
  if (args.length !== 2) return failure('grep: requires a keyword and a file path.', 'Structure: grep [-i] keyword file.');
  const [keyword, rawPath] = args;
  if (!keyword) return failure('grep: keyword cannot be empty.', 'Search for non-empty text.');
  const read = readFile(state.root, rawPath, state.cwd, 'grep');
  if (read.error) return read.error;
  const needle = ignoreCase ? keyword.toLocaleLowerCase() : keyword;
  const matches = lineContent(read.node.content).filter(line => (ignoreCase ? line.toLocaleLowerCase() : line).includes(needle));
  return success(matches.join('\n'), matches.length ? `Found ${matches.length} matching line(s). This is exact text search.` : 'No matching lines found. This is a valid search result, not an error.', false, false, { matchedLines: matches, grep: true, path: read.path, ignoreCase, keyword });
}

function executePipeline(input, state) {
  const parts = splitPipeline(input);
  if (parts.error) return failure(parts.error, parts.teaching);
  if (!parts.left) return failure('Left side of pipe cannot be empty.', 'Format: grep [-i] keyword file | wc -l.');
  if (parts.right !== 'wc -l') return failure('Unsupported pipeline combination.', 'Only grep [-i] keyword file | wc -l is supported.');
  const left = tokenize(parts.left);
  if (left.error) return failure(left.error, 'Fix the unclosed quote before running.');
  if (left.tokens[0] !== 'grep') return failure('Left side of pipe must be grep.', 'Only grep output can be counted in this pipe.');
  const grepResult = executeGrep(left.tokens.slice(1), state);
  if (!grepResult.ok) return grepResult;
  return success(String(grepResult.matchedLines.length), `wc -l counted ${grepResult.matchedLines.length} line(s) from grep. Multiple keywords on the same line count as one line.`, false, false, { pipeline: true, matchedLines: grepResult.matchedLines });
}

function executeRedirection(redirection, state, options) {
  if (!redirection.left) {
    return failure('Left side of redirection cannot be empty.', 'Provide a command like echo or cat on the left.');
  }
  if (!redirection.right) {
    return failure('Missing target file path for redirection.', `Structure: command ${redirection.op} target_file.`);
  }
  const rightParsed = tokenize(redirection.right);
  if (rightParsed.error) return failure(rightParsed.error, 'Target file path format is invalid.');
  if (rightParsed.tokens.length !== 1) {
    return failure('Target file path is not valid.', 'Redirection takes only one target file path.');
  }
  const targetPath = rightParsed.tokens[0];

  const leftParsed = tokenize(redirection.left);
  if (leftParsed.error) return failure(leftParsed.error, 'Unclosed quote on left side of redirection.');
  if (!leftParsed.tokens.length) return failure('Left side of redirection cannot be empty.', 'Provide a command on the left.');
  const leftCmd = leftParsed.tokens[0];
  if (leftCmd !== 'echo' && leftCmd !== 'cat') {
    return failure(`${leftCmd}: only echo and cat support redirection here.`, 'Use echo text > file or cat file > file.');
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
    return failure(`Redirection failed: ${targetPath}: Is a directory`, 'Redirection target must be a file, not a folder.');
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
    return success('', `Output redirected to ${destPath} (overwrote previous content).`, false, true, { redirection: true, op: '>', targetPath: destPath, content: contentToWrite });
  } else {
    if (targetNode) {
      targetNode.content += contentToWrite;
    } else {
      addChild(state.root, destPath, file(parentInfo.name, contentToWrite));
    }
    return success('', `Output appended to ${destPath}.`, false, true, { redirection: true, op: '>>', targetPath: destPath, content: contentToWrite });
  }
}

function executeRun(args, state, options = {}) {
  if (options.isScript) {
    return failure('run: cannot nest run inside a script.', 'Recursive scripts are not supported.');
  }
  if (args.length !== 1) {
    return failure('run: requires a script file path.', 'Structure: run script_path. run is a practice list runner.');
  }
  const read = readFile(state.root, args[0], state.cwd, 'run');
  if (read.error) return read.error;
  if (read.node.content.length > 10240) {
    return failure('run: script file is too large (over 10KB limit).', 'Practice lists should stay short and clear.');
  }
  const rawLines = read.node.content.split(/\r?\n/);
  if (rawLines.length > 50) {
    return failure('run: script has too many lines (over 50 lines limit).', 'Practice lists should stay short and clear.');
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
      return failure(`run: Line ${lineNum} error: cannot nest run inside a script.`, 'Recursive scripts are not supported.');
    }
    const res = executeCommand(trimmed, state, { isScript: true });
    if (!res.ok) {
      return failure(`run: stopped at line ${lineNum}: ${trimmed}\nReason: ${res.output}`, `Earlier changes were kept. ${res.teaching || ''}`);
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
      executedLines.push(`[Line ${lineNum}] ${trimmed}\n${res.output}`);
    } else {
      executedLines.push(`[Line ${lineNum}] ${trimmed}`);
    }
  }
  const summaryOutput = executedLines.join('\n');
  return success(summaryOutput, 'Automated list finished. run executes commands in a file one by one.', anyChanged, anyMutated, { run: true, scriptPath: read.path, executedCount: executedLines.length });
}

export function executeCommand(input, state, options = {}) {
  const redirection = splitRedirection(input);
  if (redirection.error) return failure(redirection.error, redirection.teaching);
  const pipeline = splitPipeline(input);
  if (pipeline.error) return failure(pipeline.error, pipeline.teaching);
  if (redirection.op && pipeline.left !== null) {
    return failure('This simulator does not support combining pipe and redirection.', 'Use a pipe or redirection separately.');
  }
  if (redirection.op) return executeRedirection(redirection, state, options);
  if (pipeline.left !== null) return executePipeline(input, state);
  if (hasUnsupportedSyntax(input)) return failure('Wildcards, semicolons, and complex syntax are not supported.', 'Enter one basic command at a time.');
  const parsed = tokenize(input.trim());
  if (parsed.error) return failure(parsed.error, 'Unclosed quotes. Make sure opening and closing quotes match.');
  if (!parsed.tokens.length) return success();
  const [command, ...args] = parsed.tokens;
  if (!SUPPORTED.includes(command)) return failure(`Command not supported: ${command}`, `Supported commands: ${SUPPORTED.join(', ')}.`);
  if (command === 'clear') return success('', 'clear clears the screen display. It does not change folders, files, or progress.', false, false, { clear: true });
  if (command === 'help') {
    if (args.length > 1) return failure('help: takes only one command name argument.', 'Structure: help [command_name], for example help wc.');
    if (args.length === 1) {
      const target = args[0].toLowerCase();
      const doc = COMMAND_DOCS[target];
      if (!doc) return failure(`help: unknown command "${args[0]}"`, `Supported commands: ${SUPPORTED.join(', ')}. Type help to see the full list.`);
      return success(`${doc.usage}\n${doc.summary}\n\n${doc.detail}`, 'Read the command syntax and limits carefully.', false, false, { help: true, commandHelp: target });
    }
    return success('Supported commands:\npwd              Print current folder path\nls [path]        List folder contents\ncd [path]        Change folder; no arguments returns to home\nmkdir path       Create a folder (no -p)\ntouch path       Create a file; existing files are kept\ncp source dest   Copy a single file, will not overwrite\nmv source dest   Move or rename a single file, will not overwrite\ncat file         Read a text file\ngrep [-i] kw f   Search for lines matching keyword\nwc -l file       Count lines in a file\ngrep ... | wc -l Simple pipeline to count matching lines\necho [text]      Print text to the terminal\n> / >>           Redirect output (> overwrite, >> append; echo & cat only)\nrun script       [Practice Tool] Run commands listed in a file\nhelp [command]   Show help (for example: help wc)\nclear            Clear terminal screen\n\nSupported: Absolute/relative paths, ., .., ~, single and double quotes.\ngrep searches for exact text; wc -l counts newlines.\nrun is a lab practice command, not a general shell command.\nRedirection supports: echo text [>|>>] file and cat file [>|>>] file.\nSafe copy/move refuses to overwrite existing files. > overwrites by design.\nWildcards, environment variables, and complex command chains are not supported.', 'Type help <command_name> to view detailed usage for a command.', false, false, { help: true, commandHelp: null });
  }
  if (command === 'pwd') {
    if (args.length) return failure('pwd: does not take arguments.', 'Type pwd by itself to see your current folder.');
    return success(state.cwd, 'This is the absolute path of your current practice folder.');
  }
  if (command === 'ls') {
    if (args.some(arg => arg.startsWith('-'))) return optionFailure('ls');
    if (args.length > 1) return failure('ls: takes only one folder path argument.', 'Structure: ls [folder_path].');
    const targetPath = normalizePath(args[0] ?? '.', state.cwd);
    const node = getNode(state.root, targetPath);
    if (!node) return failure(`ls: ${args[0]}: No such directory`, `You are in ${state.cwd}. Type ls to see folders here.`);
    if (node.type !== 'dir') return failure(`ls: ${args[0]}: Not a directory`, 'ls needs a folder path.');
    return success(Object.values(node.children).map(displayName).join('  '), `Listed contents of ${targetPath}.`);
  }
  if (command === 'cd') {
    if (args.some(arg => arg.startsWith('-'))) return optionFailure('cd');
    if (args.length > 1) return failure('cd: takes only one folder path argument.', 'If a folder name has spaces, wrap it in quotes: cd "Summer Camp".');
    const targetPath = normalizePath(args[0] ?? '~', state.cwd);
    const node = getNode(state.root, targetPath);
    if (!node) return failure(`cd: ${args[0] ?? '~'}: No such directory`, `You are in ${state.cwd}. Your location did not change.`);
    if (node.type !== 'dir') return failure(`cd: ${args[0]}: Not a directory`, 'cd only enters folders, not files. Your location did not change.');
    return success(targetPath, `Entered ${targetPath}.`, true);
  }
  if (command === 'mkdir') {
    if (args.some(arg => arg.startsWith('-'))) return optionFailure('mkdir');
    if (args.length !== 1) return failure('mkdir: requires one folder path argument.', 'Structure: mkdir folder_path.');
    const targetPath = normalizePath(args[0], state.cwd);
    if (getNode(state.root, targetPath)) return failure(`mkdir: ${args[0]}: File or folder already exists`, 'This simulator refuses to overwrite existing objects.');
    const info = getParent(state.root, targetPath);
    if (!info?.parent || info.parent.type !== 'dir') return parentFailure(args[0], state.cwd);
    addChild(state.root, targetPath, dir(info.name));
    return success(`Created folder ${targetPath}`, 'mkdir created a new folder.', false, true);
  }
  if (command === 'touch') {
    if (args.some(arg => arg.startsWith('-'))) return optionFailure('touch');
    if (args.length !== 1) return failure('touch: requires one file path argument.', 'Structure: touch file_path.');
    const targetPath = normalizePath(args[0], state.cwd);
    const existing = getNode(state.root, targetPath);
    if (existing?.type === 'dir') return failure(`touch: ${args[0]}: Is a directory`, 'touch target must be a file path. Files were not changed.');
    if (existing?.type === 'file') return success(`File already exists; content kept at ${targetPath}`, 'Existing file was kept unchanged.');
    const info = getParent(state.root, targetPath);
    if (!info?.parent || info.parent.type !== 'dir') return parentFailure(args[0], state.cwd);
    addChild(state.root, targetPath, file(info.name));
    return success(`Created empty file ${targetPath}`, 'touch created an empty file.', false, true);
  }
  if (command === 'cp' || command === 'mv') {
    if (args.some(arg => arg.startsWith('-'))) return optionFailure(command);
    if (args.length !== 2) return failure(`${command}: requires two arguments: source and target.`, `Structure: ${command} source_file target_path.`);
    const sourcePath = normalizePath(args[0], state.cwd);
    const source = getNode(state.root, sourcePath);
    if (!source) return failure(`${command}: ${args[0]}: Source file does not exist`, 'Check the source file path. Files were not changed.');
    if (source.type !== 'file') return failure(`${command}: ${args[0]}: Directory operations are not supported`, `${command} only copies or moves single files.`);
    const destination = resolveDestination(state.root, args[1], state.cwd, source);
    if (destination.path === sourcePath) return failure(`${command}: Source and target paths are identical`, 'Source and target must be different.');
    if (destination.target) return failure(`${command}: Target already exists, refusing to overwrite`, 'Safety check: Choose a different target path.');
    const info = getParent(state.root, destination.path);
    if (!info?.parent || info.parent.type !== 'dir') return parentFailure(args[1], state.cwd);
    if (command === 'cp') {
      addChild(state.root, destination.path, file(info.name, source.content));
      return success(`Copied file to ${destination.path}`, 'cp copied the file. Source file was kept.', false, true);
    }
    const moved = removeChild(state.root, sourcePath);
    moved.name = info.name;
    addChild(state.root, destination.path, moved);
    return success(`Moved file to ${destination.path}`, 'mv moved or renamed the file. Old path is gone.', false, true);
  }
  if (command === 'cat') {
    if (args.length !== 1) return failure('cat: requires one file path argument.', 'Structure: cat file_path.');
    const read = readFile(state.root, args[0], state.cwd, 'cat');
    if (read.error) return read.error;
    return success(read.node.content, 'cat reads and displays file content. It does not change the file.', false, false, { cat: true, path: read.path });
  }
  if (command === 'grep') return executeGrep(args, state);
  if (command === 'wc') {
    if (args[0] !== '-l' || args.length !== 2) return failure('wc: only wc -l file is supported here.', 'Structure: wc -l file.');
    const read = readFile(state.root, args[1], state.cwd, 'wc');
    if (read.error) return read.error;
    const count = (read.node.content.match(/\n/g) || []).length;
    return success(String(count), `wc -l counted ${count} line(s). Text without a trailing newline is not counted as an extra line.`, false, false, { wc: true, newlineCount: count, path: read.path });
  }
  if (command === 'echo') {
    const text = args.join(' ');
    return success(text, 'echo prints text to the terminal.', false, false, { echo: true, text });
  }
  if (command === 'run') {
    return executeRun(args, state, options);
  }
  return failure('Unknown command error');
}
