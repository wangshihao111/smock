import { isArray, isInteger, isObject, isString, isBoolean, isNumber } from 'lodash'

export function getVariableType(variable) {
  if (isArray(variable)) return 'array';
  if (isObject(variable)) return 'object';
  if (isNumber(variable)) return 'number';
  if (isString(variable)) return 'string';
  if (isBoolean(variable)) return 'boolean';
}