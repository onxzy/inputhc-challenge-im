export enum AuthPermissions {
  routes_user_new,
  routes_user_get,
  routes_user_delete,
  routes_user_update,
};

export const rolePermissions = {
  ANON: [

  ] as AuthPermissions[],
  USER: [

  ] as AuthPermissions[],
  ADMIN: [
    AuthPermissions.routes_user_new,
    AuthPermissions.routes_user_get,
    AuthPermissions.routes_user_delete,
    AuthPermissions.routes_user_update,
  ] as AuthPermissions[],
};
