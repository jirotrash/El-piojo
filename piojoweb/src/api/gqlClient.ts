import axios from 'axios';
import { piojoApi } from './piojoApi';

export async function gql<T = any>(query: string, variables?: Record<string, any>) {
  try {
    // DEBUG: log outgoing GraphQL request to help diagnose schema/variable issues
    // Remove or disable these logs in production.
    // eslint-disable-next-line no-console
      // Outgoing GraphQL request (debug logs removed in production)
    const resp = await piojoApi.post('', { query, variables });
    // log full response for debugging
      // Response received
    if (resp.data?.errors && resp.data.errors.length) {
      // log the errors array for fuller context
      console.error("[gql] errors:", resp.data.errors);
      throw new Error(resp.data.errors[0]?.message || JSON.stringify(resp.data.errors));
    }
    return resp.data?.data as T;
  } catch (err: any) {
    // if axios error, log response body for inspection
    if (axios.isAxiosError(err)) {
      console.error("[gql] axios error:", err?.response?.status, err?.response?.data);
      const msg = err.response?.data?.errors?.[0]?.message || err.message;
      throw new Error(msg);
    }
    console.error("[gql] unexpected error:", err);
    throw err;
  }
}

export default gql;
