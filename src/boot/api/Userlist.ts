import { api } from 'boot/axios';

// 定義數據接口（根據實際數據結構調整）
interface Userlist {
  id: string; // 主鍵
  name: string; // 姓名
  age: number; // 年齡
}

export const FetchUserList = {
  // 獲取列表
  getList() {
    return api.get<Userlist[]>('/api/CRUDTest/a');
  },

  // 創建新項目
  create(data: Partial<Userlist>) {
    return api.post<Userlist>('/api/CRUDTest', data);
  },

  // 更新項目
  update(data: Partial<Userlist>) {
    return api.patch<Userlist>('/api/CRUDTest', data);
  },

  // 刪除項目
  delete(id: number) {
    return api.delete(`/api/CRUDTest/${id}`);
  },
};
