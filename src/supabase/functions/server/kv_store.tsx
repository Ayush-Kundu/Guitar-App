// This file has been removed as server functions are no longer used.
// The app now uses client-side authentication with local storage.

export const set = async (key: string, value: any): Promise<void> => {
  throw new Error('KV store is no longer used - server functions disabled');
};

export const get = async (key: string): Promise<any> => {
  throw new Error('KV store is no longer used - server functions disabled');
};

export const del = async (key: string): Promise<void> => {
  throw new Error('KV store is no longer used - server functions disabled');
};

export const mset = async (keys: string[], values: any[]): Promise<void> => {
  throw new Error('KV store is no longer used - server functions disabled');
};

export const mget = async (keys: string[]): Promise<any[]> => {
  throw new Error('KV store is no longer used - server functions disabled');
};

export const mdel = async (keys: string[]): Promise<void> => {
  throw new Error('KV store is no longer used - server functions disabled');
};

export const getByPrefix = async (prefix: string): Promise<any[]> => {
  throw new Error('KV store is no longer used - server functions disabled');
};