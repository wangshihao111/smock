import { isArray, isInteger, isObject, isString, isBoolean } from 'lodash'

export function getVariableType(variable) {
  if (isArray(variable)) return 'array';
  if (isObject(variable)) return 'object';
  if (isInteger(variable)) return 'int';
  if (isString(variable)) return 'string';
  if (isBoolean(variable)) return 'boolean';
}