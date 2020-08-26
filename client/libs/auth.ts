import cookie from 'js-cookie';

// set in cookie
export const setCookie = (key, value) => {
   
        cookie.set(key, value);
    
};
// remove from cookie
export const removeCookie = key => {
        cookie.remove(key);
    
};
// get from cookie such as stored token
// will be useful when we need to make request to server with token
export const getCookie = key => {
        return cookie.get(key);
    
};



