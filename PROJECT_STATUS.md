# Terminal Steps Lab Project Status

## Project Goal and Current Stage

Goal: Build a safe, in-browser terminal practice environment. Help adult beginners connect commands, current folders, terminal output, and verification habits.

Current Stage: Unit 6 "Command Structure and Help" code and automated tests are complete. Awaiting user manual verification in the browser for Units 3, 4, 5, and 6. Units 7–12 remain in planning.

Unit 1 manual verification: Page opens. Input box works. Commands run and show output. Invalid input like `cd steven, pwd` is rejected and current folder stays unchanged. Task 4 requires `cd ..` followed by `pwd`.

Unit 2 manual verification: 4 tasks work and complete. Folder tree updates match expectations. Reset, invalid inputs, and page reloads are partially tested.

Units 3–6 manual verification: Not yet manually verified in a real browser (due to agent sandbox restrictions). Code and automated tests pass.

## Completed Features

- Static, zero-dependency web app for local use and GitHub Pages.
- Unit 1 (4 tasks): `pwd`, `ls`, enter course folder, return to parent with `pwd` check.
- Virtual filesystem and path parsing: absolute/relative paths, `.`, `..`, `~`, quotes, and paths with spaces.
- Commands: `pwd`, `ls`, `cd`, `help`, `clear`. Unsupported commands show helpful error messages.
- Screen clearing: `clear` command and `Ctrl+L` clear terminal text without resetting cwd or files.
- Command history, 3-level hints, task evaluation, folder tree, and Reset Task.
- `localStorage` progress saving with version check and storage failure warning.
- Real Mac Terminal practice card with safe copy-to-clipboard button.
- Clear input hints and automatic focus.
- Unit 2 (4 tasks): `mkdir`, `touch`, `cp`, `mv` safe basics with overwrite protection.
- Unit 3 (4 tasks): `cat`, literal `grep`, `grep -i`, `wc -l`, and pipes like `grep ... | wc -l`.
- Unit 4 "Troubleshoot and Independent Challenge" (4 tasks):
  - Task 1: "Why Can I Not Open the File?" (path troubleshooting).
  - Task 2: "Fix a Misspelled File Name" (rename with mv, overwrite protection).
  - Task 3: "Find Clues in Log Files" (log filtering and pipe count).
  - Task 4: "Organize Your Workspace Independently" (starter folder cleanup).
- Unit 5 "Output, Logs, and Automation" (4 tasks):
  - `echo` prints text to the screen.
  - `>` writes/overwrites into a file; `>>` appends to a file.
  - `run` executes command checklists one by one (special teaching command in this lab).
  - Task 1: "Print a Message to the Terminal".
  - Task 2: "Save Output into a Log File".
  - Task 3: "Append Records Without Losing Old Data".
  - Task 4: "Run Your First Automation Checklist".
- Unit 6 "Command Structure and Help" (4 tasks):
  - `help` and `help <command>` documentation for all 14 commands.
  - Task 1: "Understand the Three Command Parts" (`grep -i python "Course Notes.txt"`).
  - Task 2: "Enter a Folder Name with Spaces" (`cd "Summer Camp"`).
  - Task 3: "When in Doubt, Check Help" (`help wc` then `wc -l notes.txt`).
  - Task 4: "Read the Error, Then Fix It" (composite command error `cd lessons pwd` fixed step by step).
- Learning map navigation: free switching across Units 1–6.
- Course roadmap: shows all 12 units (Units 1–6 Ready, Units 7–12 Planned).
- GitHub Pages compatibility: relative paths (`./styles.css`, `./src/app.js`), no hardcoded hostnames, subpath safe.
- Storage isolation: `terminal-steps-lab:progress` key used in `localStorage`. Reset only deletes this key.

## Automated Tests Status

- `node tests/test.mjs`: All pass. Output: `All tests passed: path parsing, command boundaries, overwrite protection, and all 24 tasks across Units 1-6.`
- `node --check src/app.js && node --check src/engine.js && node --check src/filesystem.js && node --check src/data.js`: Pass with 0 errors.

## Unverified or Pending Items

- Units 3, 4, 5, 6 browser manual verification: not yet tested in a real browser by the user.
- Corner cases for Unit 2 reset and reload after extreme input: awaiting full manual confirmation.
- Legacy save state verification: Storage key, task IDs, and fallback check strings are preserved in code. Only the automated test cases actually executed have been verified. Arbitrary legacy browser save states with older Chinese virtual files have not been exhaustively tested across all 24 tasks in a real browser. Existing user progress is not cleared or overwritten.
- Units 7–12: in planning (07 Find Files and Batch Select, 08 Combine Commands and Handle Errors, 09 Running Programs and Safe Practice, 10 From Lists to Scripts, 11 Python Project Workflow, 12 Git and AI CLI Workflow).

## Run and Test Commands

Start local preview server:
```sh
cd ~/terminal-steps-lab
python3 -m http.server 4173 --bind 127.0.0.1
```
Open `http://127.0.0.1:4173/` in your browser. Stop with `Ctrl+C`.

Run automated tests:
```sh
cd ~/terminal-steps-lab
node tests/test.mjs
```

## User Manual Verification Checklist

### Unit 1
1. Run `pwd`, output is `/home/steven`, task completes.
2. Run `ls`, see `lessons` and `projects`, task completes.
3. Run `cd lessons`, folder tree and prompt update.
4. Run `cd ..` first, then run `pwd`, task completes.
5. Run `clear`, terminal clears, current folder and files stay intact.

### Unit 2
1. Task 1: `mkdir projects/summer-camp` creates folder in tree.
2. Task 2: `touch session-record.txt` creates empty file.
3. Task 3: `cp course-template.md robotics` copies file while keeping original.
4. Task 4: `mv session-record.md archive/robotics-session-final.md` moves and renames.
5. Overwrite test: repeated file/folder creation is safely rejected.

### Unit 3
1. Task 1: `cat course-overview.txt` displays text, file unchanged.
2. Task 2: `grep robotics keyword-notes.txt` returns 2 matching lines.
3. Task 3: Run `grep python case-notes.txt`, then `grep -i python case-notes.txt`. Second run finds 3 lines.
4. Task 4: `grep ERROR logs/lesson-run.log | wc -l` outputs `3`.

### Unit 4
1. Task 1 (Why Can I Not Open the File?):
   - At `/home/steven`, type `cat course-overview.txt`. Fails with "No such file".
   - Type `cat lessons/course-overview.txt` (or `cd lessons` then `cat course-overview.txt`). Task completes.
2. Task 2 (Fix a Misspelled File Name):
   - At `/home/steven/lessons/robotics`, run `ls` to spot `session-reocrd.md`.
   - Run `mv session-reocrd.md session-record.md`. Tree updates, task completes.
3. Task 3 (Find Clues in Log Files):
   - At `/home/steven/lessons`, run `grep WARN logs/hardware-check.log | wc -l`. Outputs `3`, task completes.
4. Task 4 (Organize Your Workspace Independently):
   - At `/home/steven/projects/starter`, run `ls` and `cat readme.txt`.
   - Run `mkdir docs` and `mkdir records`.
   - Run `cp template.md docs/` (original remains).
   - Run `mv notes-draft.txt records/lesson-01.txt` (draft moved).
   - Task completes. Click Next to go to Unit 5.

### Unit 5
1. Task 1 (Print a Message to the Terminal):
   - Type `echo "Welcome to STEM Lab"`. Prints welcome text, task completes.
   - Negative test: Type `echo "wrong text"`. Command succeeds, but task does not complete.
2. Task 2 (Save Output into a Log File):
   - Type `echo "Lesson started" > logs/session.log`. File appears in tree.
   - Type `cat logs/session.log`. Prints text, task completes.
3. Task 3 (Append Records Without Losing Old Data):
   - Initial state: `logs/session.log` has `Lesson started`.
   - Run `echo "Device check: OK" >> logs/session.log`.
   - Run `echo "Network connected" >> logs/session.log`. Task completes.
   - Accidental `>` recovery test:
     - If you run `echo "Device check: OK" > logs/session.log`, line 1 is lost and task fails.
     - Recovery A: Click Reset Task to restore original file.
     - Recovery B: Re-run `echo "Lesson started" > logs/session.log`, then append both lines. Task passes without locking.
4. Task 4 (Run Your First Automation Checklist):
   - First run `cat scripts/start-class.txt` to view commands.
   - Run `run scripts/start-class.txt`. Commands execute in order, task completes.
   - Repeat test: Run `run scripts/start-class.txt` again. `cat logs/session.log` still shows exactly 2 lines.

### Unit 6
1. Task 1 (Understand the Three Command Parts):
   - At `/home/steven`, run `grep -i python "Course Notes.txt"`.
   - Matches 2 lines, task completes.
   - Negative test: Unquoted `grep -i python Course Notes.txt` fails argument check. Without `-i`, only 1 line matches.
2. Task 2 (Enter a Folder Name with Spaces):
   - At `/home/steven/lessons`, type `cd Summer Camp` without quotes. Fails safely, cwd stays unchanged.
   - Type `cd "Summer Camp"`. Successfully enters folder.
   - Run `pwd` to verify, then `cat overview.txt` to read details. Task completes.
3. Task 3 (When in Doubt, Check Help):
   - At `/home/steven`, run `wc -l notes.txt` directly. Outputs `4`, but task is not complete because `help wc` was not run.
   - Run `help wc` to read usage and limits.
   - Now run `wc -l notes.txt`. Task completes.
4. Task 4 (Read the Error, Then Fix It):
   - At `/home/steven`, type `cd lessons pwd`. Observe error and see cwd is still `/home/steven`.
   - Run step by step: `cd lessons`, then `pwd`, then `cat course-overview.txt`. Task completes.
   - Direct completion test: Running the correct steps without the error first also passes.

## Next Steps

Complete manual verification in browser for Units 3–6. Once verified, plan Unit 7 "Find Files and Batch Select".
