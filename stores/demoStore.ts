import { create } from 'zustand';

interface Checkpoint {
  id: string;
  name: string;
  timestamp: string;
  data: any;
}

interface DemoStore {
  isDemoMode: boolean;
  realStateBackup: any | null;
  checkpoints: Checkpoint[];
  
  enterDemoMode: (currentData: any) => void;
  exitDemoMode: () => any | null; // Returns the real state backup
  
  createCheckpoint: (name: string, currentData: any) => void;
  restoreCheckpoint: (id: string) => any | null; // Returns the checkpoint data
  
  clearCheckpoints: () => void;
}

export const useDemoStore = create<DemoStore>((set, get) => ({
  isDemoMode: false,
  realStateBackup: null,
  checkpoints: [],

  enterDemoMode: (currentData) => {
    set({
      isDemoMode: true,
      realStateBackup: currentData,
      checkpoints: [
        {
          id: 'initial_demo',
          name: 'Punto Inicial (Real)',
          timestamp: new Date().toISOString(),
          data: currentData
        }
      ]
    });
  },

  exitDemoMode: () => {
    const state = get();
    const backup = state.realStateBackup;
    set({
      isDemoMode: false,
      realStateBackup: null,
      checkpoints: []
    });
    return backup;
  },

  createCheckpoint: (name, currentData) => {
    const newCheckpoint: Checkpoint = {
      id: Date.now().toString(),
      name,
      timestamp: new Date().toISOString(),
      data: currentData
    };
    set((state) => ({
      checkpoints: [...state.checkpoints, newCheckpoint]
    }));
  },

  restoreCheckpoint: (id) => {
    const state = get();
    const checkpoint = state.checkpoints.find(c => c.id === id);
    return checkpoint ? checkpoint.data : null;
  },

  clearCheckpoints: () => {
    set({ checkpoints: [] });
  }
}));
