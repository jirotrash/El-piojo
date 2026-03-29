export const CREATE_ROLE = `
  mutation CreateRole($input: CreateRolesInput!) {
    createRole(input: $input) {
      id_roles
      nombre
    }
  }
`;

export const UPDATE_ROLE = `
  mutation UpdateRole($id: Int!, $input: UpdateRolesInput!) {
    updateRole(id: $id, input: $input) {
      id_roles
      nombre
    }
  }
`;

export const REMOVE_ROLE = `
  mutation RemoveRole($id: Int!) {
    removeRole(id: $id)
  }
`;
