import axios from 'axios';
import { piojoApi } from './piojoApi';

export async function gql<T = any>(query: string, variables?: Record<string, any>) {
  try {
    // DEBUG: log outgoing GraphQL request to help diagnose schema/variable issues
    // Remove or disable these logs in production.
    // eslint-disable-next-line no-console
    console.debug("[gql] query:", query);
    // eslint-disable-next-line no-console
    console.debug("[gql] variables:", variables);
    const resp = await piojoApi.post('', { query, variables });
    if (resp.data?.errors && resp.data.errors.length) {
      throw new Error(resp.data.errors[0]?.message || JSON.stringify(resp.data.errors));
    }
    return resp.data?.data as T;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const msg = err.response?.data?.errors?.[0]?.message || err.message;
      throw new Error(msg);
    }
    throw err;
  }
}

export default gql;
