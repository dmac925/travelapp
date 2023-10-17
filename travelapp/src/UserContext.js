import React from 'react';

const UserContext = React.createContext({ userID: null });
console.log('Initial Context Value:', UserContext);


export default UserContext;