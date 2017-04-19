import { data } from '../../../data/posts';

//----------------------------------------------
// Constants
//----------------------------------------------
export const REQUEST_POST = 'REQUEST_POST';
export const RECEIVE_POST = 'RECEIVE_POST';
export const GET_POSTS = 'GET_POSTS';
export const CREATE_POSTS = 'CREATE_POSTS';
export const UPDATE_POSTS = 'UPDATE_POSTS';
export const DELETE_POSTS = 'DELETE_POSTS';
export const GET_SELECTED_POSTS = 'GET_SELECTED_POSTS';
export const RESET_SELECTED_POSTS = 'RESET_SELECTED_POSTS';


const POST_URL = 'data/posts.json';

const extract = result => result.data;
//----------------------------------------------
// Actions
//----------------------------------------------
export const PostsActions = ($ngRedux, $http, $q) => {
        'ngInject';

        const getPosts = () => {
            console.log('get posts');
            return (dispatch, getState) => {
                const { posts } = getState();

                if (posts.length) {
                    return $q.when(posts)
                        .then(() => dispatch({ type: GET_POSTS, payload: posts }));
                } else {
                    return $q.when(data)
                        .then(() => dispatch({ type: GET_POSTS, payload: data }));
                    // return $http.get(POST_URL)
                    // .then(extract)
                    // .then(data => dispatch({ type: GET_POSTS, payload: data }));
                }
            };
        };

        return {
            getPosts
        };
    }
    //----------------------------------------------
    // Reducers
    //----------------------------------------------

export const posts = (state = [], { type, payload }) => {
    console.log('pp', payload);
    switch (type) {
        case GET_POSTS:
            return payload || state;
        default:
            return state;
    }
};