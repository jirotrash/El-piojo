import { useCallback, useState } from 'react';
import gql from '../../../api/gqlClient';
import { CREATE_ROLE, UPDATE_ROLE, REMOVE_ROLE } from '../graphql/rolesMutations';

export function useRolesMutations() {
  const [loading, setLoading] = useState(false);

  const createRole = useCallback(async (input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ createRole: any }>(CREATE_ROLE, { input });
      return res.createRole;
    } finally { setLoading(false); }
  }, []);

  const updateRole = useCallback(async (id: number, input: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await gql<{ updateRole: any }>(UPDATE_ROLE, { id, input });
      return res.updateRole;
    } finally { setLoading(false); }
  }, []);

  const removeRole = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await gql<{ removeRole: boolean }>(REMOVE_ROLE, { id });
      return res.removeRole;
    } finally { setLoading(false); }
  }, []);

  return { loading, createRole, updateRole, removeRole } as const;
}

export default useRolesMutations;
