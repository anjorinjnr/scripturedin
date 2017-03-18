import { isEmpty } from 'lodash';

//----------------------------------------------
// Constants
//----------------------------------------------
export const GET_USER = 'GET_USER';
export const REQUEST_USER = 'REQUEST_USER';
export const REQUEST_USER_FAILED = 'REQUEST_USER_FAILED';
export const RECEIVE_USER = 'RECEIVE_USER';
// export const SAVE_USER = 'SAVE_USER';
// export const DELETE_USER = 'DELETE_USER';
// export const UPDATE_USER = 'UPDATE_USER';




//----------------------------------------------
// Actions
//----------------------------------------------

export const UserActions = ($http, localStorageService, $q) => {
    'ngInject';
    const extract = result => result.data;
    const getFacebookUser = () => {

    }
    const getUser = () => {
        return (dispatch, getState) => {
            const userState = getState().user;
            const user = localStorageService.get('user');
            if (isEmpty(user)) {
                dispatch({ type: GET_USER });
                return Promise.resolve();
            } else if (isEmpty(userState.data)) {
                dispatch({ type: REQUEST_USER });
                return $http.get('/api/user')
                    .then(extract)
                    .then(data => {
                        if (data.status === 'no active user session') {
                            dispatch({ type: RECEIVE_USER, user: undefined });
                        } else {
                            dispatch({ type: RECEIVE_USER, user: data });
                        }
                    });
            } else {
                return $q.when(userState)
                    .then(() => dispatch({ type: GET_USER }));
            }
        };
    };

    const signup = () => {

    };

    const login = (user) => {
        return (dispatch) => {

            dispatch({ type: REQUEST_USER });

            return $http.post('/api/login', user)
                .then(extract)
                .then(user => {
                    if (user.id) {
                        localStorageService.set('user', user);
                        console.log('action..', { type: RECEIVE_USER, user });
                        dispatch({ type: RECEIVE_USER, user });
                    } else {
                        Promise.resolve('Unsuccessful login attempt. Please try again.');
                    }
                });
        };
    };

    const logout = () => {

    };

    return {
        getUser,
        login
    };

}


//----------------------------------------------
// Reducers
//----------------------------------------------

//--u------------
//------------
const initialUser = {
    isFetching: false,
    didInvalidate: false,
    data: undefined
};

export const user = (state = initialUser, action) => {
    switch (action.type) {
        case REQUEST_USER:
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false,
            });
        case RECEIVE_USER:
            return Object.assign({}, state, {
                isFetching: false,
                didInvalidate: false,
                data: action.user
            });
        default:
            return state;
    }
};