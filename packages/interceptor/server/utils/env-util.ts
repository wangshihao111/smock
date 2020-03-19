import execa from 'execa';
import fs from 'fs';
// import { NodeJs } from 'node/globals'

type Platform = 'linux' | 'win32' | 'darwin'

export class EnvUtil {
  private platform: Platform;

  private proxyUrl: string;
  // constructor(proxyUrl: string) {
  //   this.platform = os.platform() as Platform;
  //   this.proxyUrl = proxyUrl.startsWith('http') ? proxyUrl : `http://${proxyUrl}`;
  // }

  public async setupProxy () {
    let cmd: string;
    if (this.platform === 'linux') {
      cmd = `export HTTP_PROXY=${this.proxyUrl}`;
    } else if (this.platform === 'win32') {
      cmd = `set http_proxy=${this.proxyUrl}`;
    } else if (this.platform === 'darwin') {
      cmd = '';
    }
    const child = execa(cmd, [], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    try {
      await child;
    } catch (e) {
      console.log('error', e);
    }
  }

  public async clearProxy () {
    let cmd: string;
    if (this.platform === 'linux') {
      cmd = 'sudo export HTTP_PROXY=';
    } else if (this.platform === 'win32') {
      cmd = 'set http_proxy=';
    } else if (this.platform === 'darwin') {
      cmd = '';
    }
    const child = execa(cmd, [], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    try {
      await child;
    } catch (e) {
      console.log('error', e);
    }
  }

  public async setLinuxEnv () {
    let content = fs.readFileSync('/etc/profile', 'utf8');
    content += '\n' + 'export HTTP_PROXY=http://localhost:3030';
    fs.writeFileSync('/etc/profile', content, 'utf8');
    await execa('source /etc/profile');
  }

  public listenClose (callback) {
    process.on('SIGINT', async () => {
      callback();
      process.exit();
    });
    process.on('exit', async () => {
      callback();
    });
    // 监听挂断事件
    process.on('SIGHUP', () => {
      callback();
    });
  }
}
