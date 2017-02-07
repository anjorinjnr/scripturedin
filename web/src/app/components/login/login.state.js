//----------------------------------------------
// Constants
//----------------------------------------------
export const SET_FACEBOOK_USER = 'SET_FACEBOOK_USER';


//----------------------------------------------
// Actions
//----------------------------------------------
export const LoginActions = () => {

    const setFacebookUser = user => {
        return { type: SET_FACEBOOK_USER, user: user };
    }

    return {
        setFacebookUser
    };
}

//----------------------------------------------
// Reducers
//----------------------------------------------
export const facebookUser = (state = {}, action) => {
    switch (action.type) {
        case SET_FACEBOOK_USER:
            return Object.assign({}, state, action.user);
        default:
            return state;
    };
};