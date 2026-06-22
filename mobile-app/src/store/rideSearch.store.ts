import { create } from 'zustand';

import type { SearchRidesParams } from '../api/rides.api';

type RideSearchState = {
  searchParams: SearchRidesParams | null;
  setSearchParams: (params: SearchRidesParams) => void;
  clearSearchParams: () => void;
};

export const useRideSearchStore = create<RideSearchState>((set) => ({
  searchParams: null,

  setSearchParams: (params) => {
    set({ searchParams: params });
  },

  clearSearchParams: () => {
    set({ searchParams: null });
  },
}));