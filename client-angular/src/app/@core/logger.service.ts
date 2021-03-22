import { Subject } from 'rxjs';
import { shortStringify } from '@core/jsonutils';
import { environment } from '@env/environment';
import { IDebugLevels } from '@app/IDebugLevels';

//TODO move to lib
export type ILogCall = (...args: any[]) => void;

const debugLevels: IDebugLevels = {
  verbose: 5,
  log: 4,
  info: 3,
  debug: 2,
  warn: 1,
  error: 0,
};

const debugLevelsStyle = {
  verbose: 'color: #999',
  log: 'color: #333',
  info: 'color: #666',
  debug: 'color: teal; font-weight: 700',
  warn: 'color: orange',
  error: 'color: #FF33300, ',
};

export interface ILogger {
  // Identical to angular's definition
  debug: ILogCall;
  error: ILogCall;
  info: ILogCall;
  log: ILogCall;
  warn: ILogCall;
  // Our extensions
  verbose: ILogCall;
}

const levelToConsoleMethod = {
  verbose: 'info',
  log: 'log',
  info: 'info',
  debug: 'log',
  warn: 'warn',
  error: 'error',
};

const getColorByWordPRand = (word: string) => {
  let color = '#';
  let max = 6;
  let getXX = function (index: number) {
    let p = [];
    let count = 0;
    while (count < max) {
      if (index >= word.length) {
        index = 0;
      }
      p.push(word.charCodeAt(index));
      count++;
      index++;
    }

    let a = (p[2] * p[1] + p[1]) % 16;
    if (a < 8) {
      a += 8;
    }
    const b = (p[3] * p[4] + p[5]) % 16;
    return a.toString(16) + b.toString(16);
  };

  color += getXX(0) + getXX(max) + getXX(max * 2);
  return color;
};

const logging: Subject<string> = new Subject();

export const logging$ = logging.asObservable();

export const createLogger = (context: string): ILogger => {
  const op = (level: string) => (...args: any[]) => {
    let [originalMessage, ...tail] = args;
    const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');
    const formattedMessage = `${timestamp} %c[${context}]%c ${originalMessage}`;
    const method = levelToConsoleMethod[level];
    if (method) {
      console[method](
        ...[formattedMessage, `background: ${getColorByWordPRand(context)}`, debugLevelsStyle[level], ...tail]
      );
    } else {
      console.log('method ', method, ' not exits');
    }

    if (tail.length) {
      tail = tail.reduce((item, currentValue) => {
        if (typeof currentValue === 'object') {
          return item + (item ? ' | ' : ' ') + shortStringify(currentValue);
        } else if (currentValue !== undefined && currentValue !== null) {
          return item + (item ? ' | ' : ' ') + (currentValue as any).toString();
        } else {
          return item;
        }
      }, '') as any;
    }
    logging.next(timestamp.concat(...[' ', `${method} [${context}] ${originalMessage}`, ...tail]));
    args = null;
  };

  const getOpOrNoop = (level: string) =>
    debugLevels[environment.logLevel] >= debugLevels[level] ? op(level) : () => {};

  return {
    debug: getOpOrNoop('debug'),
    error: getOpOrNoop('error'),
    info: getOpOrNoop('info'),
    log: getOpOrNoop('log'),
    warn: getOpOrNoop('warn'),
    verbose: getOpOrNoop('verbose'),
  };
};
