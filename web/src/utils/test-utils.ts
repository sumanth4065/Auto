import { queryAllByAttribute, queryByAttribute } from '@testing-library/react';

export const getAllByQuid = queryAllByAttribute.bind(null, 'data-quid');
export const getAllById = queryAllByAttribute.bind(null, 'id');
export const getAllByClass = queryAllByAttribute.bind(null, 'class');

export const getByQuid = queryByAttribute.bind(null, 'data-quid');
export const getById = queryByAttribute.bind(null, 'id');
export const getByClass = queryByAttribute.bind(null, 'class');
export const getByRole = queryByAttribute.bind(null, 'role');

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
