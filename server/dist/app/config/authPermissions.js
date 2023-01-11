"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolePermissions = exports.AuthPermissions = void 0;
var AuthPermissions;
(function (AuthPermissions) {
    AuthPermissions[AuthPermissions["routes_user_new"] = 0] = "routes_user_new";
    AuthPermissions[AuthPermissions["routes_user_get"] = 1] = "routes_user_get";
    AuthPermissions[AuthPermissions["routes_user_delete"] = 2] = "routes_user_delete";
    AuthPermissions[AuthPermissions["routes_user_update"] = 3] = "routes_user_update";
})(AuthPermissions = exports.AuthPermissions || (exports.AuthPermissions = {}));
;
exports.rolePermissions = {
    ANON: [],
    USER: [],
    ADMIN: [
        AuthPermissions.routes_user_new,
        AuthPermissions.routes_user_get,
        AuthPermissions.routes_user_delete,
        AuthPermissions.routes_user_update,
    ],
};
