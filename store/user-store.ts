import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
   userId:string,
   username: string,
   email: string,
   role:string
}

interface UserStore {
   user: User | null,
   setUser: (user: User) => void
   clearUser: () => void;
}

// export const useUserStore = create<UserStore>((set) => ({
//    user: null,
//    setUser: (user) => set(()=>({user})),
//    clearUser: () => set({ user: null }),
// }))

//using set inside persist for data persistence
export const useUserStore = create<UserStore>()(
   persist(
      (set) => ({
         user: null,
         setUser: (user) => set(() => ({ user })),
         clearUser: () => set({ user: null }),
      }),
      {
         name: 'user-storage',
         storage: {
            getItem: async (name) => {
               const value = await AsyncStorage.getItem(name);
               try {
                  return value ? JSON.parse(value) : null;
               } catch (err) {
                  return null;
               }
            },
            setItem: async (name, value) => {
               await AsyncStorage.setItem(name, JSON.stringify(value));
            },
            removeItem: async (name) => {
               await AsyncStorage.removeItem(name);
            },
         },
      }
   )
);