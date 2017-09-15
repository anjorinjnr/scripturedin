//----------------------------------------------------------
// constants
//----------------------------------------------------------

export const OPEN_NAVBAR = 'OPEN_NAVBAR';

export const CLOSE_NAVBAR = 'CLOSE_NAVBAR';

//----------------------------------------------
// Actions
//----------------------------------------------
export const NavBarActions = () => {

    const openNavBar = () => {
        return { type: OPEN_NAVBAR };
    };
    const closeNavBar = () => {
        return { type: CLOSE_NAVBAR };
    };

    return {
        openNavBar,
        closeNavBar
    };
};
//----------------------------------------------------------
// Reducers
//----------------------------------------------------------
const initialState = {
    open: false
};

export const navbar = (state = initialState, { type, payload }) => {
    switch (type) {
        case OPEN_NAVBAR:
            return { open: true };
        default:
            return { open: false };
    }
};