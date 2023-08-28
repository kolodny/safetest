import { spawnSync } from 'child_process';

export const getTree = () => {
  const isWin = process.platform === 'win32';
  const inspectCommand = isWin ? 'wmic.exe' : 'ps';
  const inspectArgs = isWin
    ? ['PROCESS', 'GET', 'Name,ProcessId,ParentProcessId,Status']
    : ['-A', '-o', 'ppid,pid,stat,args'];
  const output = spawnSync(inspectCommand, inspectArgs);
  const lines = output.stdout.toString().split('\n');
  const headers = lines.shift()!.trim().split(/\s+/).map(normalizeHeader);
  type Proc = {
    ppid: string;
    stat: string;
    argv: string[];
  };
  headers.pop();
  const processes: Record<string, Proc> = {};
  for (const line of lines) {
    const columns = line.trim().split(/\s+/);
    const info = Object.fromEntries(headers.map((h) => [h, columns.shift()]));
    const { pid, ...proc } = info as any;
    proc.argv = columns;
    processes[pid!] = proc;
  }
  return processes;
};

const headerMap: Record<string, string> = {
  Name: 'argv',
  ARGS: 'argv',
  ParentProcessId: 'ppid',
  ProcessId: 'pid',
  Status: 'stat',
};

const normalizeHeader = (str: string) => {
  return (headerMap[str] ?? str).toLowerCase();
};
