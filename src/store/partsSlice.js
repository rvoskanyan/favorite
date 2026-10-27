import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = '/api-proxy/hs/hsprice/';
const API_KEY = 'FAVORIT1-PRICE-3333-4444-123456789012';

export const fetchBrandsByNumber = createAsyncThunk(
    'parts/fetchBrands',
    async (number, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}?key=${API_KEY}&number=${encodeURIComponent(number)}`);

            if (!response.ok) {
                throw new Error('Ошибка сети при запросе к API');
            }

            const data = await response.json();

            if (data.error) {
                return rejectWithValue(data.error);
            }

            const isEmpty =
                !data.goods ||
                data.goods.length === 0 ||
                (
                    data.goods.length === 1 &&
                    data.goods.at(0).goodsID === "00000000-0000-0000-0000-000000000000"
                )

            if (isEmpty) {
                return [];
            }

            return data.goods;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchOffersAndAnalogues = createAsyncThunk(
    'parts/fetchOffers',
    async ({ number, brand }, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${API_URL}?key=${API_KEY}&number=${encodeURIComponent(number)}&brand=${encodeURIComponent(brand)}&analogues=on`
            );

            if (!response.ok) {
                throw new Error('Ошибка сети при получении аналогов');
            }

            const data = await response.json();

            if (data.error) {
                return rejectWithValue(data.error);
            }

            const isEmpty =
                !data.goods ||
                data.goods.length === 0 ||
                (
                    data.goods.length === 1 &&
                    data.goods.at(0).goodsID === "00000000-0000-0000-0000-000000000000"
                )

            if (isEmpty) {
                return [];
            }

            const parsedOffers = [];

            const parsAndPushItem = (item) => {
                parsedOffers.push({
                    id: item.goodsID,
                    name: item.name,
                    brand: item.brand,
                    number: item.number,
                    price: item.warehouses?.at(0)?.price || 0,
                    stock: item.count || 0,
                })
            }

            data.goods.forEach(item => {
                parsAndPushItem(item)

                item.analogues?.forEach(parsAndPushItem)
            });

            return parsedOffers;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const partsSlice = createSlice({
    name: 'parts',
    initialState: {
        searchNumber: '',
        brands: [],
        selectedBrand: '',
        offers: [],
        loading: false,
        error: null,
    },
    reducers: {
        setSearchNumber: (state, action) => {
            state.searchNumber = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBrandsByNumber.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.brands = [];
                state.offers = [];
                state.selectedBrand = '';
            })
            .addCase(fetchBrandsByNumber.fulfilled, (state, action) => {
                const allBrands = action.payload.map(item => item.brand.toUpperCase());

                state.loading = false;
                state.brands = [...new Set(allBrands)];

                if (state.brands.length === 0) {
                    state.error = 'По данному артикулу ничего не найдено.';
                }
            })
            .addCase(fetchBrandsByNumber.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Произошла непредвиденная ошибка';
            })
            .addCase(fetchOffersAndAnalogues.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.offers = [];
            })
            .addCase(fetchOffersAndAnalogues.fulfilled, (state, action) => {
                state.loading = false;
                state.offers = action.payload;
                if (action.payload.length === 0) {
                    state.error = 'Предложения и аналоги по выбранному бренду отсутствуют.';
                }
            })
            .addCase(fetchOffersAndAnalogues.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Не удалось загрузить аналоги';
            });
    },
});

export const { setSearchNumber } = partsSlice.actions;
export default partsSlice.reducer;
