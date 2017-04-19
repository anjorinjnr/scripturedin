//----------------------------------------------------------
// constants
//----------------------------------------------------------

export const OPEN_SIDEBAR = 'OPEN_SIDEBAR';

export const CLOSE_SIDEBAR = 'CLOSE_SIDEBAR';

//----------------------------------------------
// Actions
//----------------------------------------------
export const SideBarActions = () => {

    const openSideBar = () => {
        return { type: OPEN_SIDEBAR };
    };
    const closeSideBar = () => {
        return { type: CLOSE_SIDEBAR };
    };

    return {
        openSideBar,
        closeSideBar
    };
};
//----------------------------------------------------------
// Reducers
//----------------------------------------------------------
const initialState = {
    open: false
};

export const sidebar = (state = initialState, { type, payload }) => {
    switch (type) {
        case OPEN_SIDEBAR:
            return { open: true };
        default:
            return { open: false };
    }
};