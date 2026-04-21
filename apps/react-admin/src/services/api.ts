import { RequestBase } from '@umijs/max';

const BASE_URL = '/api';

export const login = (params: { username: string; password: string }) => {
  return RequestBase().post<{ token: string; user: any }>(`${BASE_URL}/auth/login`, params);
};

export const logout = () => {
  return RequestBase().post(`${BASE_URL}/auth/logout`);
};

export const getUserInfo = () => {
  return RequestBase().get<any>(`${BASE_URL}/auth/userinfo`);
};

export const getUserList = (params: { page?: number; pageSize?: number; username?: string }) => {
  return RequestBase().get<{ data: any[]; total: number }>(`${BASE_URL}/user/list`, { params });
};

export const getUserById = (id: number) => {
  return RequestBase().get<any>(`${BASE_URL}/user/${id}`);
};

export const createUser = (data: any) => {
  return RequestBase().post<any>(`${BASE_URL}/user`, data);
};

export const updateUser = (data: any) => {
  return RequestBase().put<any>(`${BASE_URL}/user`, data);
};

export const deleteUser = (id: number) => {
  return RequestBase().delete<any>(`${BASE_URL}/user/${id}`);
};

export const resetUserPassword = (id: number, password: string) => {
  return RequestBase().put(`${BASE_URL}/user/resetPwd`, { userId: id, password });
};

export const changeUserStatus = (id: number, status: number) => {
  return RequestBase().put(`${BASE_URL}/user/changeStatus`, { userId: id, status });
};

export const getRoleList = (params?: { page?: number; pageSize?: number }) => {
  return RequestBase().get<{ data: any[]; total: number }>(`${BASE_URL}/role/list`, { params });
};

export const getAllRoles = () => {
  return RequestBase().get<any[]>(`${BASE_URL}/role/all`);
};

export const createRole = (data: any) => {
  return RequestBase().post<any>(`${BASE_URL}/role`, data);
};

export const updateRole = (data: any) => {
  return RequestBase().put<any>(`${BASE_URL}/role`, data);
};

export const deleteRole = (id: number) => {
  return RequestBase().delete<any>(`${BASE_URL}/role/${id}`);
};

export const changeRoleStatus = (id: number, status: number) => {
  return RequestBase().put(`${BASE_URL}/role/changeStatus`, { roleId: id, status });
};

export const getPermissionList = (params?: any) => {
  return RequestBase().get<any>(`${BASE_URL}/permission/list`, { params });
};

export const getMenuTree = () => {
  return RequestBase().get<any[]>(`${BASE_URL}/permission/menu`);
};

export const createPermission = (data: any) => {
  return RequestBase().post<any>(`${BASE_URL}/permission`, data);
};

export const updatePermission = (data: any) => {
  return RequestBase().put<any>(`${BASE_URL}/permission`, data);
};

export const deletePermission = (id: number) => {
  return RequestBase().delete<any>(`${BASE_URL}/permission/${id}`);
};

export const assignPermissions = (roleId: number, permissionIds: number[]) => {
  return RequestBase().post(`${BASE_URL}/role/assignPermissions`, { roleId, permissionIds });
};

export const getStatistics = () => {
  return RequestBase().get<any>(`${BASE_URL}/statistics`);
};

export const getDashboardData = () => {
  return RequestBase().get<any>(`${BASE_URL}/dashboard`);
};
