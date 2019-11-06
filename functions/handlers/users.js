const {admin, db } = require('../util/admin');
const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const {
    validateSignUpData, 
    validateLogInData
} = require('../util/validators');

exports.signup = async (req, res) => {
    const newUser = {
        name:req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmedPassword: req.body.confirmedPassword,
        phone: req.body.phone,
        role: ['user'],
        localId: '',
    };

    const {valid, errors} = validateSignUpData(newUser);
    if(!valid){
        return res.status(401).json({error:errors});
    }
    let token,userId;
    await db.doc(`/users/${newUser.email}`)
            .get()
            .then(doc => {
                if(doc.exists){
                    return res.status(400).json({error:"This email is already in use"});
                }else{
                    return firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password);
                }
            })
            .then(data => {
                userId = data.user.uid;
                return data.user.getIdToken();
            })
            .then(idToken => {
                token = idToken;
                const userCredentials = {
                    name:newUser.name,
                    email:newUser.email,
                    password:newUser.password,
                    phone:newUser.phone,
                    role:newUser.role,
                    createdAt: new Date().toISOString()
                };
                return db.doc(`/users/${userCredentials.userId}`)
                        .set(userCredentials);
            })
            .then(() => {
                return res.status(201).json({token});
            })
            .catch(err => {
                console.error(err);
                if(err.code === 'auth/email-already-in-use'){
                    return res.status(500).json({error:'Email already in use'});
                }else{
                    return res.status(500).json({error:err.code});
                }
            });
}

exports.login = async (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    
    }
    const { valid, errors } = validateLogInData(user);
    if(!valid){
        return res.status(401).json(errors);
    }
    await firebase.auth()
            .signInWithEmailAndPassword(user.email,user.password)
            .then(data => {
                return data.user.getIdToken();
            })
            .then(token => {
                return res.status(200).json({token});
            })
            .catch(err => {
                console.error(err);
                if(err.code === 'auth/wrong-password'){
                    return res.status(403).json({error: "Wrong credentials, please try again!"});
                }else if(err.code === 'auth/user-not-found'){
                    return res.status(404).json({error:"User not found"});
                }
            })
}

exports.searchHistory = async (req, res) => {
    await db.collection('/searchhistory')
            .where('userId','==',req.user.id)
            .orderBy('createdAt','desc')
            .get()
            .then(doc => {
                let history = [];
                doc.forEach(data => {
                    history.push({
                        searchId:data.data().searchId,
                        restaurantId:data.data().restaurantId,
                    })
                })
                return res.status(200).json(history);
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
}

exports.reservationsHistory = async (req, res) => {
    await db.collection('/reservationhistory')
            .where('userId','==',req.user.id)
            .orderBy('createdAt','desc')
            .get()
            .then(doc => {
                let history = [];
                doc.forEach(data => {
                    history.push({
                        reservationHistoryId:data.data().searchId,
                        reservationId:data.data().reservationId,
                    })
                })
                return res.status(200).json(history);
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
}

exports.saveReservation = async (req, res) => {
    const reservation = {
        userEmail:req.user.email,
        localId:req.body.localId,
        hour:req.body.hour,
        seats:req.body.seats,
        date:req.body.date,
        createdAt:new Date().toISOString(),
        status:"waiting"
    }
    await db.collection("reservations")
            .add(reservation)
            .then(doc => {
                const newReservation = reservation;
                newReservation.reservationId = doc.id;
                return res.status(201).json(newReservation);
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
}

exports.rejectReservation = async (req, res) => {

}




