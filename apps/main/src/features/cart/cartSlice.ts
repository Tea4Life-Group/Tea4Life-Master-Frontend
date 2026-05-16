import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getCartApi } from "@/services/cartApi";
import type { CartResponse } from "@/types/cart/CartResponse";

interface CartState {
  cart: CartResponse | null;
  loading: boolean;
  error: string | null;
  lastAction: {
    type: "add" | "update" | "remove" | "clear" | null;
    timestamp: number;
  };
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  lastAction: {
    type: null,
    timestamp: 0,
  },
};

export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const response = await getCartApi();
  return response.data.data;
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setLastAction: (
      state,
      action: PayloadAction<"add" | "update" | "remove" | "clear">,
    ) => {
      state.lastAction = {
        type: action.payload,
        timestamp: Date.now(),
      };
    },
    clearLastAction: (state) => {
      state.lastAction = {
        type: null,
        timestamp: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch cart";
      });
  },
});

export const { setLastAction, clearLastAction } = cartSlice.actions;
export default cartSlice.reducer;
