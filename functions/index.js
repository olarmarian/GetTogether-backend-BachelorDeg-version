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
    searchHistory,
    reservationsHistory,
    saveReservation,
    rejectReservation
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
    getTheNewest,
    getTheMostPopular,
    getTheBiggestRate
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
app.get('/users/:userId/search-history',searchHistory);
app.get('/users/:userId/reservations-history',reservationsHistory);
app.post('/users/reservation/save',FBAuth,saveReservation);
app.get('/users/reservation/:reservationId/reject',FBAuth,rejectReservation);

//Locals routes
app.get('/locals',getLocals);
app.get('/locals/specific/:specific',getLocalsBySpecific);
app.get('/locals/tag/:tag',getLocalsByTag);
app.get('/locals/name/:name',getLocalsByName);
app.get('/locals/location/:location',getLocalsByLocation);
app.get('/locals/reservations',FBAuth,getReservations);
app.get('/locals/the-most-popular',getTheMostPopular);
app.get('/locals/the-newest',getTheNewest);
app.get('/locals/the-biggest-rate',getTheBiggestRate);

app.post('/locals/save',FBAuth,saveLocal);
app.post('/locals/:localId/menu/save',FBAuth,saveLocalMenu);
app.post('/locals/:localId/menu/edit',FBAuth,updateLocalMenu);
app.post('/locals/:localId/edit',FBAuth,updateLocal);
app.post('/locals/:localId/upload',FBAuth,uploadImage);
app.post('/locals/:localId/review',FBAuth,reviewLocal);
app.delete('/locals/:localId/delete',FBAuth,deleteLocal);


exports.api = functions.https.onRequest(app);