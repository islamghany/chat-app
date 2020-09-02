import cookie from 'js-cookie';

// set in cookie
export const setCookie = (key:any, value:any,next) => {
   
        cookie.set(key, value);
        next();
    
};
// remove from cookie
export const removeCookie = (key:any,next:any)=> {
        cookie.remove(key);
        next();
    
};
// get from cookie such as stored token
// will be useful when we need to make request to server with token
export const getCookie = key => {
        return cookie.get(key);
    
};



