const functions = require('firebase-functions');
const express = require('express');
const app = express();
const FBAuth = require('./util/FBAuth');
const xss = require('xss-clean');
const helmet = require('helmet');
const cors = require('cors');

const {
    signup,
    login,
    updateProfile,
    getAccount,
    addNewsletterEmail
} = require('./handlers/users');

const {
    getLocals,
    getLocalsBySpecific,
    getLocalsByName,
    getLocalsByLocation,
    getLocalsByTag,
    getReservations,
    saveLocal,
    deleteLocal,
    updateLocal,
    reviewLocal,
    saveLocalMenu,
    updateLocalMenu,
    uploadImage,
    deleteImage,
    getTheNewest,
    getTheMostPopular,
    getTheBiggestRate,
    getReviews,
    getMetadataForLocals,
    getLocalTagsCategories,
    getLocalSpecificsCategories,
    getUserLocal,
    getFilteredLocals
} = require('./handlers/locals');

//MIDDLEWARES
app.use(helmet());
app.use(xss());
app.use(cors());
app.use(express.json({limit:'10kb'}));

//Admin routes
app.get('/admin/waitinglist',()=>{});
app.get('/admin/locals/:localId/accept',()=>{});
app.get('/admin/locals/:localId/decline',()=>{});
app.get('/admin/raport/the-most-active',()=>{});
app.delete('/admin/locals/:localId/delete',()=>{});


//Users routes
app.post('/users/signup',signup);
app.post('/users/login',login);
app.get('/users/:userId',getAccount);
app.post('/newsletter', addNewsletterEmail);
app.put('/users/:userId/edit', updateProfile);

//Locals routes
app.get('/locals',getLocals);
app.get('/locals/user-local/:userEmail',FBAuth,getUserLocal)
app.get('/locals/tags-categories', getLocalTagsCategories);
app.get('/locals/specifics-categories', getLocalSpecificsCategories);
app.get('/locals/metadata',getMetadataForLocals);
app.get('/locals/tag=:tag&specific=:specific', getFilteredLocals);
app.get('/locals/specific/:specific',getLocalsBySpecific);
app.get('/locals/tag/:tag',getLocalsByTag);
app.get('/locals/:name',getLocalsByName);
app.get('/locals/name/:name',getLocalsByName);
app.get('/locals/location/:location',getLocalsByLocation);
app.get('/locals/reservations',FBAuth,getReservations);
app.get('/locals/:localId/reviews',getReviews);
app.post('/locals/the-most-popular',getTheMostPopular);
app.post('/locals/the-newest',getTheNewest);
app.post('/locals/the-biggest-rate',getTheBiggestRate);
app.post('/locals/save',FBAuth,saveLocal);
app.post('/locals/:localId/menu/save',FBAuth,saveLocalMenu);
app.post('/locals/:localId/menu/edit',FBAuth,updateLocalMenu);
app.post('/locals/:localId/edit',FBAuth,updateLocal);
app.post('/locals/:localId/upload',FBAuth,uploadImage);
app.delete('/locals/image', FBAuth, deleteImage);
app.post('/locals/:localId/review',FBAuth,reviewLocal);
app.delete('/locals/:localId/delete',FBAuth,deleteLocal);


exports.api = functions.https.onRequest(app);