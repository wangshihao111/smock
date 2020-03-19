import createMock from './server/server';

function parseArgs (argv: string[]): {port: number; host: string} {
  const hostIndex = argv.findIndex((v) => v.match('host'));
  const portIndex = argv.findIndex((v) => v.match('port'));
  let host = 'localhost';
  let port = 4000;
  if (hostIndex > -1) {
    host = argv[hostIndex + 1];
  }
  if (portIndex > -1) {
    port = Number(argv[portIndex + 1]);
  }
  return { port, host };
}

function startMock (): void {
  const args = process.argv;
  console.log(args, process.argv0);
  const { port, host } = parseArgs(args);
  console.log(port, host);
  createMock({ port, host });
}

startMock();
