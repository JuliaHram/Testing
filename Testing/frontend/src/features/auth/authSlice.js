import { createSlice } from '@reduxjs/toolkit';

// Безопасно достаем данные из sessionStorage
const getStoredItem = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const initialState = {
  teacher: JSON.parse(getStoredItem('teacher') || 'null'),
  accessToken: getStoredItem('accessToken'),
  refreshToken: getStoredItem('refreshToken'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { teacher, accessToken, refreshToken } = action.payload;
      state.teacher = teacher;
      state.accessToken = accessToken;
      if (refreshToken) state.refreshToken = refreshToken;

      // Сохраняем в sessionStorage (очистится при закрытии вкладки)
      sessionStorage.setItem('teacher', JSON.stringify(teacher));
      sessionStorage.setItem('accessToken', accessToken);
      if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
    },
    clearCredentials(state) {
      state.teacher = null;
      state.accessToken = null;
      state.refreshToken = null;
      
      // Очищаем sessionStorage
      sessionStorage.removeItem('teacher');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;