// User storage utilities for login data

export interface UserData {
  name: string;
  mobile: string;
  uniqueNumber: string;
  loginDate: string;
}

const USER_STORAGE_KEY = 'daily_tracker_user';
const LOGIN_COMPLETED_KEY = 'daily_tracker_login_completed';

export const userStorage = {
  // Save user data
  saveUser: (userData: Omit<UserData, 'loginDate'>): void => {
    const data: UserData = {
      ...userData,
      loginDate: new Date().toISOString(),
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(LOGIN_COMPLETED_KEY, 'true');
  },

  // Get user data
  getUser: (): UserData | null => {
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as UserData;
    } catch {
      return null;
    }
  },

  // Check if login is completed
  isLoginCompleted: (): boolean => {
    return localStorage.getItem(LOGIN_COMPLETED_KEY) === 'true';
  },

  // Clear user data (logout)
  clearUser: (): void => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(LOGIN_COMPLETED_KEY);
  },

  // Update user data
  updateUser: (updates: Partial<Omit<UserData, 'loginDate'>>): void => {
    const current = userStorage.getUser();
    if (current) {
      userStorage.saveUser({
        name: updates.name ?? current.name,
        mobile: updates.mobile ?? current.mobile,
        uniqueNumber: updates.uniqueNumber ?? current.uniqueNumber,
      });
    }
  },
};

