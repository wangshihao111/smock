type TaskFunc = () => any;

interface QueueItem {
  running: boolean;
  queue: TaskFunc[];
}

export class Scheduler {
  private queueMap: Map<string, QueueItem>;
  constructor() {
    this.queueMap = new Map();
  }

  public addQueue(key: string, task: TaskFunc) {
    let queueItem = this.queueMap.get(key);
    if (!queueItem) {
      queueItem = { running: false, queue: [] };
      this.queueMap.set(key, queueItem);
    }
    queueItem.queue.push(task);
    if (!queueItem.running) {
      queueItem.running = true;
      this.runQueue(key);
    }
  }

  private async runQueue(key: string) {
    const queueItem = this.queueMap.get(key) || ({} as QueueItem);
    while (queueItem.queue?.length > 0) {
      const current = queueItem.queue.shift() as TaskFunc;
      // console.log('Start--', key, (current as any).rand)
      await current();
      // console.log('End--', key, (current as any).rand)
    }
    queueItem.running = false;
  }
}
