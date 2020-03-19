export const isArray = (arr) => toString.call(arr) === '[object Array]';

export const isObject = obj => toString.call(obj) === '[object Object]';

export const isInt = num => typeof num === 'number' && /(^\d+$)|(^-\d+$)/.test(String(num));
