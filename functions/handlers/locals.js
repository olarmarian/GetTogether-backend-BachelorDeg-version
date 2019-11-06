const {admin, db } = require('../util/admin');

exports.getLocals = async (req, res) => {
    await db.collection('locals')
        .orderBy('location','asc')    
        .get()
        .then(doc => {
            let locals = [];
            doc.forEach(data => {
                locals.push({
                    localId:data.data().id,
                    userId:data.data().userId,
                    name:data.data().name,
                    location:data.data().location,
                    specific:data.data().specific,
                    phone:data.data().phone,
                    tags:data.data().tags
                })
            })
            return res.status(200).json(locals);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error:err.code});
        })
}

exports.getLocalsByTag = async (req, res) => {
    await db.collection('locals')
        .where('tags','array-contains',"#"+req.params.tag)
        .get()
        .then(doc => {
            let locals = [];
            doc.forEach(data => {
                locals.push({
                    localId:data.data().id,
                    userId:data.data().userId,
                    name:data.data().name,
                    location:data.data().location,
                    specific:data.data().specific,
                    phone:data.data().phone,
                    tags:data.data().tags
                })
            })
            return res.status(200).json(locals);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error:err.code});
        })
}
exports.getLocalsBySpecific = async (req, res) => {
    await db.collection('locals')
        .orderBy('location','asc')
        .where('specific','==',req.params.specific)
        .get()
        .then(doc => {
            let locals = [];
            doc.forEach(data => {
                locals.push({
                    localId:data.data().id,
                    userId:data.data().userId,
                    name:data.data().name,
                    location:data.data().location,
                    specific:data.data().specific,
                    phone:data.data().phone,
                    tags:data.data().tags
                })
            })
            return res.status(200).json(locals);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error:err.code});
        })
}

exports.getTheNewest = async (req, res) => {
    await db.collection('locals')
            .orderBy('createdAt','asc')
            .limit(4)
            .get()
            .then(doc => {
                let locals = [];
                doc.forEach(data => {
                    locals.push({
                        restaurantId:data.data().id,
                        userId:data.data().userId,
                        name:data.data().name,
                        location:data.data().location,
                        specific:data.data().specific,
                        phone:data.data().phone,
                        tags:data.data().tags
                    })
                })
                return res.status(200).json(locals);
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
}

exports.getTheMostPopular = async (req, res) => {
    let result = [];
    let locals = [];
    await db.collection('locals')
            .get()
            .then(doc => {
                doc.forEach(data => {
                    locals.push({
                        localId:data.id,
                        name:data.data().name
                    })
                })
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
    
    await db.collection('reservations')
            .get()
            .then(doc => {
                locals.forEach(local => {
                    let counter = 0;
                    let name;
                    doc.forEach(data=>{
                        if(data.data().localId === local.localId){
                            counter = counter + 1;
                            name = local.name;
                        }
                    })
                    result.push({
                        id:local.localId,
                        name,
                        counter
                    })
                })
            })
            .catch(err => {
                console.error(err)
                return res.status(500).json({error:err.code});
            })
    result.sort((e1,e2)=>{
        return e2.counter - e1.counter
    });
    result = result.length > 4? result.slice(0,4):result;
    return res.status(200).json(result);
}

exports.getTheBiggestRate = async (req, res) => {
    let result = [];
    let locals = [];
    await db.collection('locals')
            .get()
            .then(doc => {
                doc.forEach(data => {
                    locals.push({
                        id:data.id,
                        name:data.data().name,
                    })
                })
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
    
    await db.collection('reviews')
            .get()
            .then(doc => {
                let reviews = [];
                doc.forEach(data=>{
                    reviews.push({
                        localId:data.data().localId,
                        stars:data.data().stars
                    });
                })
                locals.forEach(local => {
                    let counter = 0;
                    let stars = 0;
                    let name;
                    reviews.forEach(data=>{
                        if(data.localId === local.id){
                            counter += 1;
                            stars = stars + data.stars;
                            name = local.name;
                        }
                    })
                    if(counter !== 0){
                        let avg = stars/counter;
                        result.push({
                            id:local.id,
                            name,
                            avg
                        })
                    }
                })
            })
            .catch(err => {
                console.error(err)
                return res.status(500).json({error:err.code});
            })
    result.sort((e1,e2)=>{
        return e2.avg - e1.avg
    });
    result = result.slice(0,4);
    return res.status(200).json(result);
}

exports.getLocalsByName = async (req, res) => {
    await db.collection('locals')
            .orderBy('location','asc')
            .where('name','==',req.params.name)
            .get()
            .then(doc => {
                let locals = [];
                doc.forEach(data => {
                    locals.push({
                        restaurantId:data.data().id,
                        userId:data.data().userId,
                        name:data.data().name,
                        location:data.data().location,
                        specific:data.data().specific,
                        phone:data.data().phone,
                        tags:data.data().tags
                    })
                })
                return res.status(200).json(locals);
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
}

exports.getLocalsByLocation = async (req, res) => {
    await db.collection('locals')
            .orderBy('location','asc')
            .where('location','==',req.params.location)
            .get()
            .then(doc => {
                let locals = [];
                doc.forEach(data => {
                    locals.push({
                        restaurantId:data.data().id,
                        userId:data.data().userId,
                        name:data.data().name,
                        location:data.data().location,
                        specific:data.data().specific,
                        phone:data.data().phone,
                        tags:data.data().tags
                    })
                })
                return res.status(200).json(locals);
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
}

exports.getReservations = async (req, res) => {
    await db.collection('reservations')
            .orderBy('createdAt','desc')
            .where('restaurantId','==',req.params.reservationId)
            .get()
            .then(doc => {
                let reservations = [];
                doc.forEach(data => {
                    reservations.push({
                        reservationId:data.data().reservationId,
                        restaurantId:data.data().restaurantId,
                        userId:data.data().userId,
                        hour:data.data().hour,
                        date:data.data().date,
                        seats:data.data().seats,
                    })
                })
                return res.status(200).json(reservations);
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
}

exports.saveLocal = async (req, res) => {
    const newLocal = {
        userEmail:req.user.email,
        name:req.body.name,
        location:req.body.location,
        specific:req.body.specific,
        phone:req.body.phone,
        tags:req.body.tags,
        createdAt:new Date().toISOString()
    };
    await db.collection('locals')
        .add(newLocal)
        .then(doc =>{
            const resLocal = newLocal;
            resLocal.localId = doc.id;
            return res.status(201).json(resLocal);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error: err.code});
        })

}

exports.deleteLocal = async (req, res) => {
    await db.collection('locals')
            .doc(req.params.localId)
            .delete()
            .then(() => {
                return res.status(200).json({message:"Local deleted successfully"});
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })

}

exports.updateLocal = async (req, res) => {
    await db.doc(`/locals/${req.params.localId}`)
        .get()
        .then(doc => {
            return doc.ref.update({
                name:req.body.name,
                location:req.body.location,
                specific:req.body.specific,
                phone:req.body.phone,
                tags:req.body.tags
            })
        })
        .then(()=>{
            res.status(200).json({message:"Local updated successfully"})
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error:err.code});
        })
}

exports.reviewLocal = async (req, res) => {
    const review = {
        userEmail:req.user.email,
        text:req.body.text,
        stars:req.body.stars,
        localId:req.params.localId,
        createdAt:new Date().toISOString()
    }
    await db.collection('reviews')
        .add(review)
        .then(doc => {
            const resReview = review;
            resReview.reviewId = doc.id;
            return res.status(201).json(resReview);
        })
        .catch(err =>{
            console.error(err);
            return res.status(500).json({error:"Something went wrong"});
        })
}

exports.saveLocalMenu = async (req, res) => {
    // await db.collection('locals')
}

exports.updateLocalMenu = async (req, res) => {
    
}

exports.uploadImage = async (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({headers:req.headers});
    let imageToBeUploaded = {};
    let imageFileName;
    await busboy.on('file',(fieldname, file, filename, encoding, mimetype) =>{
        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png'){
            return res.status(400).json({error: 'Wrong file type submitted'})
        }
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(Math.random()*10000000000)}.${imageExtension}`;
        const filePath = path.join(os.tmpdir(), imageFileName);
        
        imageToBeUploaded = { filePath,mimetype };
        file.pipe(fs.createWriteStream(filePath));
    });
    await busboy.on('finish', async ()=>{
        await admin
            .storage()
            .bucket(`${config.storageBucket}`)
            .upload(imageToBeUploaded.filePath,{
                resumable: false,
                metadata: {
                    metadata:{
                        contentType: imageToBeUploaded.mimetype
                    }
                }
            })
            .then(()=>{
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
                const newImage = {
                    restaurantId:req.params.restaurantId,
                    imageUrl
                }
                return db.collection('/images')
                        .add(newImage)
                        .then(doc => {
                            const resImage = newImage;
                            resImage.imageId = doc.id;
                        })
            })
            .then(()=>{
                return res.status(200).json({message:'Image uploaded successfully'});
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({error:err});
            });
    });
    await busboy.end(req.rawBody);
}