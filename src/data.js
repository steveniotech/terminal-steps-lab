import { HOME, getNode } from './filesystem.js';

export const unit1Tasks = [
  {
    id: 'where-am-i',
    unit: 'unit1',
    unitTitle: 'Unit 1 · Where Am I',
    title: 'Find Your Current Folder with pwd',
    goal: 'Check which folder you are in before you do anything else.',
    concept: 'Current folder (working directory)',
    initialCwd: HOME,
    initialFsMode: 'unit1',
    checklist: ['Run pwd successfully', 'Output is /home/steven'],
    hints: [
      'Idea: Ask the terminal "Where am I right now?".',
      'Command structure: pwd',
      'Full command: pwd — prints your current folder path.'
    ],
    errors: 'If the path is wrong, click Reset Task. Do not guess folder paths from browser URLs.',
    summary: 'You learned to use pwd to find where you are. This is the first step whenever a file is missing.',
    check: ({ command, result }) => command === 'pwd' && result.ok && result.output === HOME
  },
  {
    id: 'list-home',
    unit: 'unit1',
    unitTitle: 'Unit 1 · Where Am I',
    title: 'See What Is Here with ls',
    goal: 'Look at the files and folders in your home folder. Never guess names.',
    concept: 'List folder contents (ls)',
    initialCwd: HOME,
    initialFsMode: 'unit1',
    checklist: ['Run ls successfully', 'Output shows lessons and projects'],
    hints: [
      'Idea: View the list of items in the current folder.',
      'Command structure: ls',
      'Full command: ls — lists folder items. You should see lessons and projects.'
    ],
    errors: 'ls does not move you into a folder; it only lists contents. Look at the output before your next move.',
    summary: 'You learned to inspect folder contents with ls before moving. This avoids typing mistakes.',
    check: ({ command, result }) => command === 'ls' && result.ok && result.output.includes('lessons') && result.output.includes('projects')
  },
  {
    id: 'enter-lessons',
    unit: 'unit1',
    unitTitle: 'Unit 1 · Where Am I',
    title: 'Find and Enter lessons',
    goal: 'Use what you saw in ls to move into the lessons folder.',
    concept: 'Relative path (moving forward)',
    initialCwd: HOME,
    initialFsMode: 'unit1',
    checklist: ['Run cd successfully', 'Current folder becomes /home/steven/lessons'],
    hints: [
      'Idea: lessons is inside the current folder. Use it as the target of cd.',
      'Command structure: cd folder_name',
      'Full command: cd lessons — moves from the current folder into lessons.'
    ],
    errors: 'Check the name with ls first. Running cd on a file or misspelling the name will keep you in the same folder.',
    summary: 'You turned what you saw in ls into a clear cd action.',
    check: ({ command, result }) => (command === 'cd lessons' || command === 'cd ./lessons' || command === 'cd lessons/') && result.ok && result.output === `${HOME}/lessons`
  },
  {
    id: 'return-parent',
    unit: 'unit1',
    unitTitle: 'Unit 1 · Where Am I',
    title: 'Go Up One Level and Verify',
    goal: 'Leave lessons, return to the parent folder, and check where you are with pwd.',
    concept: 'Parent folder (..)',
    initialCwd: `${HOME}/lessons`,
    initialFsMode: 'unit1',
    checklist: ['Run cd .. successfully', 'Then run pwd successfully', 'Final location is /home/steven'],
    hints: [
      'Idea: Use .. to go up one level, then check your location.',
      'Command structure: cd .. then pwd',
      'Full steps: cd .. then pwd — .. means parent folder, and pwd verifies the move.'
    ],
    errors: 'Just staying in home is not enough. You must run cd .. first and then verify with pwd.',
    summary: 'You practiced the safe habit: move, then verify. Keep this habit for all terminal work.',
    check: ({ state }) => state.cwd === HOME && state.successfulCommands.includes('cd ..') && state.successfulCommands.includes('pwd')
  }
];

export const unit2Tasks = [
  {
    id: 'make-course-dir',
    unit: 'unit2',
    unitTitle: 'Unit 2 · Set Up Workspace',
    title: 'Create a Course Folder',
    goal: 'Create a new folder named summer-camp inside projects.',
    concept: 'Make folder (mkdir)',
    initialCwd: HOME,
    initialFsMode: 'unit2-mkdir',
    checklist: ['Run mkdir successfully', 'projects/summer-camp exists as a folder'],
    hints: [
      'Idea: The target location is projects, and the new folder name is summer-camp.',
      'Command structure: mkdir path/new_folder',
      'Full command: mkdir projects/summer-camp — creates a new folder safely.'
    ],
    errors: 'mkdir only creates folders. If the folder exists or the parent folder is missing, nothing changes.',
    summary: 'You created a clean workspace folder for your course files.',
    check: ({ state }) => getNode(state.root, `${HOME}/projects/summer-camp`)?.type === 'dir' && state.successfulCommands.some(command => command.split(/\s+/)[0] === 'mkdir')
  },
  {
    id: 'make-session-file',
    unit: 'unit2',
    unitTitle: 'Unit 2 · Set Up Workspace',
    title: 'Create an Empty Notes File',
    goal: 'Create an empty file named session-record.txt in the robotics folder.',
    concept: 'Create empty file (touch)',
    initialCwd: `${HOME}/lessons/robotics`,
    initialFsMode: 'unit2-touch',
    checklist: ['Run touch successfully', 'Target is an empty file'],
    hints: [
      'Idea: You are already in robotics. Create a new empty file here.',
      'Command structure: touch file_name',
      'Full command: touch session-record.txt — creates an empty file.'
    ],
    errors: 'touch needs a file path. If the folder does not exist, check your location first.',
    summary: 'You created an empty file ready for lesson notes.',
    check: ({ state }) => {
      const node = getNode(state.root, `${HOME}/lessons/robotics/session-record.txt`);
      return node?.type === 'file' && node.content === '' && state.successfulCommands.some(command => command.split(/\s+/)[0] === 'touch');
    }
  },
  {
    id: 'copy-template',
    unit: 'unit2',
    unitTitle: 'Unit 2 · Set Up Workspace',
    title: 'Copy the Lesson Template',
    goal: 'Copy course-template.md from lessons into the robotics folder.',
    concept: 'Copy and keep original (cp)',
    initialCwd: `${HOME}/lessons`,
    initialFsMode: 'unit2-copy',
    checklist: ['Target file exists with correct content', 'Original file still exists and is unchanged'],
    hints: [
      'Idea: The source file is in lessons. The destination is the existing robotics folder.',
      'Command structure: cp source_file destination_folder',
      'Full command: cp course-template.md robotics — copies the file into robotics.'
    ],
    errors: 'cp copies one file and will not overwrite existing files here. Check names carefully.',
    summary: 'You copied a template while keeping the original file safe for reuse.',
    check: ({ state }) => {
      const source = getNode(state.root, `${HOME}/lessons/course-template.md`);
      const target = getNode(state.root, `${HOME}/lessons/robotics/course-template.md`);
      return source?.type === 'file' && target?.type === 'file' && source.content === target.content && state.successfulCommands.some(command => command.split(/\s+/)[0] === 'cp');
    }
  },
  {
    id: 'move-session-file',
    unit: 'unit2',
    unitTitle: 'Unit 2 · Set Up Workspace',
    title: 'Move and Rename Lesson Notes',
    goal: 'Move session-record.md into archive and rename it to robotics-session-final.md.',
    concept: 'Move and rename (mv)',
    initialCwd: `${HOME}/lessons/robotics`,
    initialFsMode: 'unit2-move',
    checklist: ['Target file exists with unchanged content', 'Old file path is gone', 'Run mv successfully'],
    hints: [
      'Idea: archive already exists. Provide the full destination path with the new name.',
      'Command structure: mv old_file archive/new_name',
      'Full command: mv session-record.md archive/robotics-session-final.md — moves and renames.'
    ],
    errors: 'mv moves one file and will not overwrite. On error, the source file stays untouched.',
    summary: 'You moved a file into an archive folder, renamed it, and confirmed the old path was gone.',
    check: ({ state }) => {
      const source = getNode(state.root, `${HOME}/lessons/robotics/session-record.md`);
      const target = getNode(state.root, `${HOME}/lessons/robotics/archive/robotics-session-final.md`);
      return !source && target?.type === 'file' && (target.content.includes('Observations') || target.content.includes('观察')) && state.successfulCommands.some(command => command.split(/\s+/)[0] === 'mv');
    }
  }
];

export const unit3Tasks = [
  {
    id: 'read-course-overview',
    unit: 'unit3',
    unitTitle: 'Unit 3 · Read and Search',
    title: 'Read Course Overview',
    goal: 'Use cat to read course-overview.txt. Notice that reading does not change the file.',
    concept: 'Read file (cat)',
    initialCwd: `${HOME}/lessons`,
    initialFsMode: 'unit3-cat',
    checklist: ['Run cat successfully', 'Displays full file text', 'File content is not changed'],
    hints: [
      'Idea: The overview file is in lessons. Read it directly.',
      'Command structure: cat file_path',
      'Full command: cat course-overview.txt — prints the file text.'
    ],
    errors: 'cat prints text from one file. It does not open folders.',
    summary: 'You read a text file directly in the terminal and saw that reading never modifies files.',
    check: ({ state }) => {
      const entry = state.output.find(item => item.cat && item.path === `${HOME}/lessons/course-overview.txt`);
      const node = getNode(state.root, `${HOME}/lessons/course-overview.txt`);
      return Boolean(entry && (entry.output.includes('Reading a file does not change its content.') || entry.output.includes('读取文件不会修改文件内容。')) && (node?.content.includes('Course Overview') || node?.content.includes('课程说明')));
    }
  },
  {
    id: 'search-course-keyword',
    unit: 'unit3',
    unitTitle: 'Unit 3 · Read and Search',
    title: 'Search Course Keywords',
    goal: 'Use grep to find every line in keyword-notes.txt that contains robotics.',
    concept: 'Literal search (grep)',
    initialCwd: `${HOME}/lessons`,
    initialFsMode: 'unit3-grep',
    checklist: ['Run grep successfully', 'Returns lines with robotics', 'Outputs each matching line once'],
    hints: [
      'Idea: The keyword is robotics and the file is keyword-notes.txt.',
      'Command structure: grep keyword file',
      'Full command: grep robotics keyword-notes.txt — case-sensitive search.'
    ],
    errors: 'This grep does exact word search. If nothing matches, no lines are printed.',
    summary: 'You located exact matching lines in a file with grep.',
    check: ({ state }) => {
      const entry = state.output.find(item => item.grep && item.path === `${HOME}/lessons/keyword-notes.txt`);
      return Boolean(entry && entry.matchedLines.length === 2 && entry.matchedLines.every(line => line.includes('robotics')));
    }
  },
  {
    id: 'compare-case-search',
    unit: 'unit3',
    unitTitle: 'Unit 3 · Read and Search',
    title: 'Compare Case Sensitivity',
    goal: 'Run grep first, then run grep -i to see the difference between case-sensitive and case-insensitive search.',
    concept: 'Ignore case (-i option)',
    initialCwd: `${HOME}/lessons`,
    initialFsMode: 'unit3-case',
    checklist: ['Default grep finds lowercase matches', 'grep -i finds all 3 casing variations', 'See how outputs differ'],
    hints: [
      'Idea: Search for python twice: once without -i, once with -i.',
      'Command structure: grep keyword file; then grep -i keyword file',
      'Full steps: grep python case-notes.txt -> grep -i python case-notes.txt — -i ignores uppercase and lowercase.'
    ],
    errors: 'Only -i ignores case. Other grep options are not supported in this lab.',
    summary: 'You learned when to search exact case and when to use -i to find all variations.',
    check: ({ state }) => {
      const normal = state.output.find(item => item.grep && !item.ignoreCase && (item.keyword === 'python' || item.command?.match(/^grep\s+["']?python["']?(?:\s|$)/)));
      const insensitive = state.output.find(item => item.grep && item.ignoreCase && (item.keyword === 'python' || item.command?.match(/^grep\s+-i\s+["']?python["']?(?:\s|$)/)));
      return Boolean(normal?.matchedLines.length === 1 && insensitive?.matchedLines.length === 3 && insensitive.output !== normal.output);
    }
  },
  {
    id: 'count-log-matches',
    unit: 'unit3',
    unitTitle: 'Unit 3 · Read and Search',
    title: 'Count Matching Log Lines',
    goal: 'Use a simple pipe to count how many lines in lesson-run.log contain ERROR.',
    concept: 'Pipe (|) and line count (wc -l)',
    initialCwd: `${HOME}/lessons`,
    initialFsMode: 'unit3-pipeline',
    checklist: ['Run grep ... | wc -l successfully', 'Output is 3', 'Counts matching lines, not total word count'],
    hints: [
      'Idea: Let grep find lines with ERROR, then pipe those lines into wc -l.',
      'Command structure: grep keyword file | wc -l',
      'Full command: grep ERROR logs/lesson-run.log | wc -l — counts matching lines.'
    ],
    errors: 'Running wc -l alone does not complete this task. Use grep ERROR logs/lesson-run.log | wc -l.',
    summary: 'You connected search and counting with a pipe, and learned that wc -l counts lines, not words.',
    check: ({ state }) => {
      const entry = state.output.find(item => item.pipeline && item.command?.includes('wc -l'));
      return Boolean(entry && entry.output === '3' && entry.matchedLines.length === 3);
    }
  }
];

export const unit4Tasks = [
  {
    id: 'cant-open-file',
    unit: 'unit4',
    unitTitle: 'Unit 4 · Troubleshoot and Independent Challenge',
    title: 'Why Can I Not Open the File?',
    goal: 'Directly opening the file fails. Check where you are, check folder contents, and read course-overview.txt correctly.',
    concept: 'Path troubleshooting',
    initialCwd: HOME,
    initialFsMode: 'unit4-open',
    checklist: ['Understand current folder vs target path', 'Read lessons/course-overview.txt successfully', 'Confirm text contains Course Overview'],
    hints: [
      'Hint 1 (Observe): Run pwd to see your folder. Run ls to see what is here.',
      'Hint 2 (Concept): The file is inside lessons. You can cd into lessons first, or read it directly with a path.',
      'Hint 3 (Example): Type cat lessons/course-overview.txt, or run cd lessons and then cat course-overview.txt.'
    ],
    errors: 'cat says "No such file" when the file is not in your current folder. Check your path.',
    summary: 'You learned the top habit for missing files: check where you are (pwd), list items (ls), then use the right path.',
    check: ({ state }) => {
      const entry = state.output.find(item => item.cat && item.path === `${HOME}/lessons/course-overview.txt`);
      return Boolean(entry && entry.ok && (entry.output.includes('Course Overview') || entry.output.includes('课程总览与准备指南')));
    }
  },
  {
    id: 'fix-typo-filename',
    unit: 'unit4',
    unitTitle: 'Unit 4 · Troubleshoot and Independent Challenge',
    title: 'Fix a Misspelled File Name',
    goal: 'Find the misspelled file session-reocrd.md in robotics, and use mv to rename it to session-record.md.',
    concept: 'Rename with mv',
    initialCwd: `${HOME}/lessons/robotics`,
    initialFsMode: 'unit4-rename',
    checklist: ['Old misspelled file session-reocrd.md is gone', 'New file session-record.md exists with original content', 'Run mv successfully without overwriting'],
    hints: [
      'Hint 1 (Observe): Run ls to spot the spelling mistake in the file name.',
      'Hint 2 (Concept): Terminals do not have a separate rename command. Use mv old_name new_name.',
      'Hint 3 (Example): Run mv session-reocrd.md session-record.md.'
    ],
    errors: 'Check the spelling of both names. mv needs two arguments: source and target.',
    summary: 'You learned that renaming in the terminal means moving a file to a new name in the same folder.',
    check: ({ state }) => {
      const oldFile = getNode(state.root, `${HOME}/lessons/robotics/session-reocrd.md`);
      const newFile = getNode(state.root, `${HOME}/lessons/robotics/session-record.md`);
      return !oldFile && newFile?.type === 'file' && (newFile.content.includes('Robotic arm assembly') || newFile.content.includes('机械臂初装')) && state.successfulCommands.some(cmd => cmd.split(/\s+/)[0] === 'mv');
    }
  },
  {
    id: 'grep-hardware-log',
    unit: 'unit4',
    unitTitle: 'Unit 4 · Troubleshoot and Independent Challenge',
    title: 'Find Clues in Log Files',
    goal: 'Hardware test logs are in logs/hardware-check.log. Use grep and a pipe to count lines containing WARN.',
    concept: 'Log troubleshooting with pipes (grep & wc -l)',
    initialCwd: `${HOME}/lessons`,
    initialFsMode: 'unit4-log',
    checklist: ['Run grep ... | wc -l successfully', 'Filter lines containing WARN', 'Output is 3'],
    hints: [
      'Hint 1 (Observe): The log file is logs/hardware-check.log.',
      'Hint 2 (Concept): Use grep to filter WARN lines, then pipe into wc -l to count them.',
      'Hint 3 (Example): Run grep WARN logs/hardware-check.log | wc -l (or cd logs first, then grep WARN hardware-check.log | wc -l).'
    ],
    errors: 'Use grep keyword file | wc -l. Make sure the keyword is WARN and the path is correct.',
    summary: 'You combined grep and wc -l to count warnings in a log file. This is a common debugging technique.',
    check: ({ state }) => {
      const entry = state.output.find(item => item.pipeline && item.matchedLines && item.matchedLines.every(l => l.includes('WARN')) && item.output === '3');
      return Boolean(entry && entry.matchedLines.length === 3);
    }
  },
  {
    id: 'organize-workspace',
    unit: 'unit4',
    unitTitle: 'Unit 4 · Troubleshoot and Independent Challenge',
    title: 'Organize Your Workspace Independently',
    goal: 'Clean up starter: create docs and records folders, copy template.md to docs (keep original), and move notes-draft.txt to records/lesson-01.txt.',
    concept: 'Workspace cleanup workflow',
    initialCwd: `${HOME}/projects/starter`,
    initialFsMode: 'unit4-organize',
    checklist: [
      'Create docs and records folders',
      'template.md copied to docs/template.md; original remains',
      'notes-draft.txt moved to records/lesson-01.txt; old path is gone',
      'readme.txt remains safe and untouched'
    ],
    hints: [
      'Hint 1 (Observe): Run ls to see files in starter. Read readme.txt for the cleanup plan.',
      'Hint 2 (Concept): Use mkdir for folders, cp to keep the template original, and mv to move and rename the draft.',
      'Hint 3 (Example): Run in order: mkdir docs -> mkdir records -> cp template.md docs/ -> mv notes-draft.txt records/lesson-01.txt.'
    ],
    errors: 'Notice: cp must keep template.md. mv will remove the old notes-draft.txt path. Check all paths.',
    summary: 'Independent challenge complete! You analyzed the folder and used ls, mkdir, cp, and mv to organize files cleanly.',
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
        (movedRecord.content.includes('Sensor working normally') || movedRecord.content.includes('传感器工作正常')) &&
        readme?.type === 'file'
      );
    }
  }
];

export const unit5Tasks = [
  {
    id: 'echo-welcome',
    unit: 'unit5',
    unitTitle: 'Unit 5 · Output, Logs, and Automation',
    title: 'Print a Message to the Terminal',
    goal: 'Use echo to print the welcome message: Welcome to STEM Lab.',
    concept: 'Terminal output (echo)',
    initialCwd: HOME,
    initialFsMode: 'unit5-echo',
    checklist: ['Run echo successfully', 'Output is Welcome to STEM Lab', 'Handle text with spaces correctly'],
    hints: [
      'Hint 1 (Observe): The goal is to print "Welcome to STEM Lab" on the screen.',
      'Hint 2 (Concept): echo prints arguments to the screen. Use quotes around words with spaces.',
      'Hint 3 (Example): Type echo "Welcome to STEM Lab" and press Enter.'
    ],
    errors: 'Check the text: it must be Welcome to STEM Lab. Use quotes around text with spaces.',
    summary: 'You printed text to the terminal with echo. This is the foundation for prompts, logs, and automation scripts.',
    check: ({ state }) => {
      const entry = state.output.find(item => item.echo && item.ok && item.text === 'Welcome to STEM Lab');
      return Boolean(entry);
    }
  },
  {
    id: 'redirect-start-log',
    unit: 'unit5',
    unitTitle: 'Unit 5 · Output, Logs, and Automation',
    title: 'Save Output into a Log File',
    goal: 'Use > to write "Lesson started" into logs/session.log. Then use cat to verify the file.',
    concept: 'Redirect and overwrite (redirection >)',
    initialCwd: HOME,
    initialFsMode: 'unit5-redirect',
    checklist: [
      'Use > to write "Lesson started" into logs/session.log',
      'logs/session.log is created with the start record',
      'Use cat logs/session.log to read and verify the file'
    ],
    hints: [
      'Hint 1 (Observe): The logs folder already exists. Redirect the text into logs/session.log.',
      'Hint 2 (Concept): > sends command output into a file. Then use cat to check the file.',
      'Hint 3 (Example): Run echo "Lesson started" > logs/session.log, then run cat logs/session.log.'
    ],
    errors: 'Check the path logs/session.log. Remember to read the file with cat to complete the task.',
    summary: 'You mastered redirection with >: it writes output to a file instead of the screen, creating the file if needed.',
    check: ({ state }) => {
      const node = getNode(state.root, `${HOME}/logs/session.log`);
      const hasCat = state.output.some(item => item.cat && item.path === `${HOME}/logs/session.log` && item.ok);
      return Boolean(node?.type === 'file' && node.content.trim() === 'Lesson started' && hasCat);
    }
  },
  {
    id: 'append-device-log',
    unit: 'unit5',
    unitTitle: 'Unit 5 · Output, Logs, and Automation',
    title: 'Append Records Without Losing Old Data',
    goal: 'The log has one line. Use >> to append "Device check: OK" and then "Network connected" without erasing the old record.',
    concept: 'Append to file (redirection >>)',
    initialCwd: HOME,
    initialFsMode: 'unit5-append',
    checklist: [
      'Line 1 keeps Lesson started',
      'Line 2 appends Device check: OK using >>',
      'Line 3 appends Network connected using >>',
      'File has 3 ordered lines without overwriting old text'
    ],
    hints: [
      'Hint 1 (Observe): Run cat logs/session.log to see the existing first line.',
      'Hint 2 (Concept): > overwrites existing content. >> appends new lines at the end safely.',
      'Hint 3 (Example): Run echo "Device check: OK" >> logs/session.log, then run echo "Network connected" >> logs/session.log.'
    ],
    errors: 'Log lines do not match. If "Lesson started" was lost, click Reset Task to start fresh.',
    summary: 'You learned the key difference between > and >>: > overwrites old content, while >> safely appends new lines.',
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
    unitTitle: 'Unit 5 · Output, Logs, and Automation',
    title: 'Run Your First Automation Checklist',
    goal: 'Read scripts/start-class.txt with cat first. Then run it using the run command to initialize session logs.',
    concept: 'Automation checklist (lab-only teaching command: run)',
    initialCwd: HOME,
    initialFsMode: 'unit5-run',
    checklist: [
      'Read scripts/start-class.txt with cat',
      'Run scripts/start-class.txt in order with run',
      'Understand how > starts a clean session and >> appends records',
      'logs/session.log has the expected two lines'
    ],
    hints: [
      'Hint 1 (Observe): Run cat scripts/start-class.txt to see the prepared commands and comments.',
      'Hint 2 (Concept): run is a special teaching command in this lab. It runs checklist commands line by line.',
      'Hint 3 (Example): First run cat scripts/start-class.txt, then run run scripts/start-class.txt.'
    ],
    errors: 'Read the script file first, then run it with run scripts/start-class.txt. (run is a lab teaching command).',
    summary: 'Automation checklist ran successfully! Running it again keeps two lines because > resets the first line and >> appends the second. (Note: run is a lab teaching command).',
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
    unitTitle: 'Unit 6 · Command Structure and Help',
    title: 'Understand the Three Command Parts',
    goal: 'Use grep with an option and arguments to search for python in "Course Notes.txt", ignoring case.',
    concept: 'Command structure: command, options, and arguments',
    initialCwd: HOME,
    initialFsMode: 'unit6-parts',
    checklist: [
      'Understand the 3 parts: command name, option, and argument',
      'Use the -i option to ignore case',
      'Wrap file name with spaces in quotes: "Course Notes.txt"',
      'Match and output 2 lines with python'
    ],
    hints: [
      'Hint 1 (Observe): The file name has spaces ("Course Notes.txt"). Search for python ignoring case.',
      'Hint 2 (Concept): Command structure: command (grep) + option (-i) + arguments (keyword and file). Wrap names with spaces in quotes.',
      'Hint 3 (Example): Type grep -i python "Course Notes.txt" and press Enter.'
    ],
    errors: 'Check your command: command is grep, option is -i, keyword is python, and file "Course Notes.txt" needs quotes.',
    summary: 'You learned the 3 parts of a terminal command: command says what to do, option changes how to do it, and arguments specify what to act on. Quotes keep names with spaces as one argument.',
    check: ({ state }) => {
      const entry = state.output.find(item => item.grep && item.ignoreCase && item.keyword?.toLowerCase() === 'python' && item.path === `${HOME}/Course Notes.txt` && item.ok);
      return Boolean(entry && entry.matchedLines?.length === 2);
    }
  },
  {
    id: 'cd-space-path',
    unit: 'unit6',
    unitTitle: 'Unit 6 · Command Structure and Help',
    title: 'Enter a Folder Name with Spaces',
    goal: 'Move from lessons into "Summer Camp", check your location with pwd, and read overview.txt.',
    concept: 'Quoting paths with spaces',
    initialCwd: `${HOME}/lessons`,
    initialFsMode: 'unit6-spaces',
    checklist: [
      'Use quotes to enter "Summer Camp"',
      'Run pwd to confirm location is /home/steven/lessons/Summer Camp',
      'Run cat overview.txt to read camp details'
    ],
    hints: [
      'Hint 1 (Observe): In lessons, ls shows Summer Camp with a space. Running cd Summer Camp without quotes fails.',
      'Hint 2 (Concept): Terminals split words by spaces. Wrap folder names with spaces in quotes: "Summer Camp".',
      'Hint 3 (Example): Run in order: cd "Summer Camp" -> pwd -> cat overview.txt.'
    ],
    errors: 'If a folder name has spaces, wrap it in quotes (e.g. cd "Summer Camp"). Then use pwd and cat.',
    summary: 'Quotes tell the shell "this is one single name, do not split by spaces". Always verify with pwd after cd.',
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
    unitTitle: 'Unit 6 · Command Structure and Help',
    title: 'When in Doubt, Check Help',
    goal: 'Check help wc to see its usage and limits, then use wc -l notes.txt to count lines.',
    concept: 'Command help (help command)',
    initialCwd: HOME,
    initialFsMode: 'unit6-help',
    checklist: [
      'Run help wc to see usage and limits',
      'Understand that this lab only supports wc with -l',
      'Run wc -l notes.txt to count 4 lines'
    ],
    hints: [
      'Hint 1 (Observe): Type help or help <command> anytime to read documentation.',
      'Hint 2 (Concept): Run help wc. The help says "-l is required". Follow the instructions to count lines.',
      'Hint 3 (Example): First run help wc. Then run wc -l notes.txt.'
    ],
    errors: 'Run help wc first to read documentation, then run wc -l notes.txt.',
    summary: 'Checking help before guessing is standard practice. Documentation tells you exact syntax and limits.',
    check: ({ state }) => {
      const checkedHelp = state.output.some(item => item.help && item.commandHelp === 'wc');
      const hasWc = state.output.some(item => item.wc && item.path === `${HOME}/notes.txt` && item.output === '4');
      return Boolean(checkedHelp && hasWc);
    }
  },
  {
    id: 'fix-composite-error',
    unit: 'unit6',
    unitTitle: 'Unit 6 · Command Structure and Help',
    title: 'Read the Error, Then Fix It',
    goal: 'Beginners often type cd lessons pwd on one line. Understand why it fails, then enter lessons, check with pwd, and read course-overview.txt one step at a time.',
    concept: 'Read errors and run commands step by step',
    initialCwd: HOME,
    initialFsMode: 'unit6-fix',
    checklist: [
      'Understand basic terminals run one command per line',
      'Run cd lessons to enter the folder',
      'Run pwd to verify current folder',
      'Run cat course-overview.txt to read the overview'
    ],
    hints: [
      'Hint 1 (Observe): If you type cd lessons pwd, cd gets 2 arguments and fails safely.',
      'Hint 2 (Concept): Do not join separate commands on one line here. Run one command per step.',
      'Hint 3 (Example): Run step by step: cd lessons -> pwd -> cat course-overview.txt.'
    ],
    errors: 'Run step by step: cd lessons first, verify with pwd, then read with cat course-overview.txt.',
    summary: 'Reading errors is a superpower: when a command fails, your folder does not change. Splitting actions into "move, verify, act" keeps you safe and fast.',
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
  { id: 'unit1', title: 'Unit 1 · Where Am I', tasks: unit1Tasks },
  { id: 'unit2', title: 'Unit 2 · Set Up Workspace', tasks: unit2Tasks },
  { id: 'unit3', title: 'Unit 3 · Read and Search', tasks: unit3Tasks },
  { id: 'unit4', title: 'Unit 4 · Troubleshoot and Independent Challenge', tasks: unit4Tasks },
  { id: 'unit5', title: 'Unit 5 · Output, Logs, and Automation', tasks: unit5Tasks },
  { id: 'unit6', title: 'Unit 6 · Command Structure and Help', tasks: unit6Tasks }
];

export const migrationSteps = [
  ['pwd', 'Check your current folder in real Terminal.', 'Outputs an absolute path. The exact path depends on your Mac account.', 'Look at the path and verify it is where you expect.'],
  ['ls', 'List contents in current folder.', 'Outputs file and folder names without guessing.', 'Notice the names and spot the difference between files and folders.'],
  ['cd ~', 'Go to your real user home folder.', 'Usually prints nothing. The prompt or next pwd will reflect the move.', 'Run pwd right after to verify.'],
  ['cd ..', 'Go up one folder level.', 'Usually prints nothing.', 'Run pwd right after to verify the path is one level shorter.'],
  ['pwd', 'Verify your location again.', 'Outputs the new absolute path.', 'Compare this result with your previous pwd to confirm cd .. worked.']
];
