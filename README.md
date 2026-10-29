# Terminal Steps Lab

Read commands. Practice safely. Learn by doing.

This is an in-browser terminal practice lab. It is made for learners who are getting started with Terminal, command-line tools, Python, Git, and AI coding tools. All commands run in a simulated virtual filesystem inside your browser. They never read or change real files on your computer.

## Current Scope

- **Unit 1: Where Am I** (4 tasks)
  - `pwd`, `ls`, `cd`, `help`, `clear`
  - Relative and absolute paths, `.`, `..`, `~`, quotes, and paths with spaces
  - Command history, 3-level hints, folder tree view, task evaluation, Reset Task
  - Progress saved in your browser with `localStorage`
  - Real Mac Terminal practice card
- **Unit 2: Set Up Workspace** (4 tasks)
  - Safe basics for `mkdir`, `touch`, `cp`, and `mv`
  - Create course folders, create notes files, copy templates safely, move and rename files
- **Unit 3: Read and Search** (4 tasks)
  - `cat`, `grep`, `grep -i`, `wc -l`, and pipes like `grep ... | wc -l`
- **Unit 4: Troubleshoot and Independent Challenge** (4 tasks)
  - Fix path mistakes, fix misspelled file names, read hardware logs, and organize your workspace independently
- **Unit 5: Output, Logs, and Automation** (4 tasks)
  - Print text with `echo`, write logs with `>`, append logs with `>>`, and run command checklists with `run`
- **Unit 6: Command Structure and Help** (4 tasks)
  - Understand the 3 command parts (command, options, arguments)
  - Quote paths with spaces
  - Look up syntax and limits with `help <command>`
  - Read composite command errors and run steps one by one

### Current Command Limits

- `help`: Type `help` for a list of commands, or `help <command>` for details.
- `cat`: Reads one file at a time. It cannot join multiple files.
- `grep`: Searches exact text. Regular expressions are not supported. Only the `-i` option is supported.
- `wc`: Only supports `wc -l file_path`.
- Pipes (`|`): Only supports `grep [-i] keyword file | wc -l`.
- Redirection: Supports `echo text [>|>>] file` and `cat file [>|>>] file`. `>` overwrites, `>>` appends.
- `run`: A special teaching command in this lab. It runs commands in a file one by one. It does not support loops, variables, background tasks, or nested `run` calls.
- Protection rules: `cp` and `mv` refuse to overwrite existing files. `mkdir -p`, folder copy, folder move, and wildcards (`*`) are not supported in this stage.

## Run Locally

You do not need to install packages or dependencies. To run ES modules in your browser, start a simple HTTP server:

```sh
cd ~/terminal-steps-lab
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/` in your browser.
To stop the server: Press `Ctrl+C` in your terminal.

## GitHub Pages Deployment

This project uses plain HTML, CSS, and JavaScript. It does not need a build step.

- **Hosting**: Push to a GitHub repository. In Settings -> Pages, set Source to `Deploy from a branch`, choose branch `main`, and folder `/ (root)`.
- **Subpath support**: All CSS, JavaScript, and asset links use relative paths (`./`). The site works in GitHub Pages project subpaths (such as `https://<user>.github.io/<repo>/`).
- **Progress storage**: Progress is stored in `localStorage` under the key `terminal-steps-lab:progress`. This prevents conflicts with other projects on the same domain. Resetting only clears this project's key. It never calls `localStorage.clear()`.

## Tests

Run the test suite with Node.js:

```sh
cd ~/terminal-steps-lab
node tests/test.mjs
```

The tests verify path parsing, command boundaries, overwrite protection, all 24 tasks across Units 1–6, deployment path contracts, and storage isolation.

## Security Boundaries

User input is never passed to `eval` or `new Function`. It never talks to a real shell. Output is rendered through DOM text nodes so input is never executed as HTML.
