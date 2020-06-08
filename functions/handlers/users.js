const {admin, db } = require('../util/admin');
const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const {
    validateSignUpData, 
    validateLogInData,
    validateEmail
} = require('../util/validators');

exports.addNewsletterEmail = async (req, res) => {
    
    if(validateEmail(req.body.email)){
        return res.status(401).json({message:"Invalid email"})
    }

    const email = {
        email: req.body.email
    };
    await db.collection('newsletter-emails')
        .add(email)
        .then(() => {
            return res.status(201).json({message:"Email registered to our newsletter!"});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error: err.code});
        })
}

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
                    localId: newUser.localId,
                    createdAt: new Date().toISOString()
                };
                return db.doc(`/users/${userId}`)
                        .set(userCredentials);
            })
            .then(() => {
                return res.status(201).json({token,userId});
            })
            .catch(err => {
                console.error(err);
                if(err.code === 'auth/email-already-in-use'){
                    return res.status(500).json({error:'This email is already in use'});
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
    let userId;
    await firebase.auth()
            .signInWithEmailAndPassword(user.email,user.password)
            .then(data => {
                userId = data.user.uid;
                return data.user.getIdToken();
            })
            .then(token => {
                return res.status(200).json({token,userId});
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

exports.getAccount = async( req, res) => {
    await db.doc(`/users/${req.params.userId}`)
        .get()
        .then(doc => {
            let user = {
                name:doc.data().name,
                email:doc.data().email,
                phone:doc.data().phone,
                role:doc.data().role,
                createdAt: doc.data().createdAt
            }
            return res.status(200).json(user)
        })
        .catch( err => {
            console.error(err);
            return res.status(500).json({error: err.code});
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
    await db.collection('reservations')
            .where('userId','==',req.user.uid)
            .orderBy('createdAt','desc')
            .get()
            .then(doc => {
                let history = [];
                doc.forEach(data => {
                    history.push({
                        reservationId:data.id,
                        date:data.data().date,
                        hour:data.data().hour,
                        localId:data.data().localId,
                        status:data.data().status,
                        seats:data.data().seats,
                        createdAt:data.data().createdAt,
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
        userId:req.user.uid,
        localId:req.body.localId,
        localName:req.body.localName,
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




