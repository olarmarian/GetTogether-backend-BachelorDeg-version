const {admin, db } = require('../util/admin');
const  config  = require('../util/config')
exports.getLocals = async (req, res) => {
    let locals = [];
    await db.collection('locals')
        .orderBy('location','asc')    
        .get()
        .then(doc => {
            doc.forEach(data => {
                locals.push({
                    localId:data.id,
                    userEmail:data.data().userEmail,
                    name:data.data().name,
                    searchName:data.data().searchName,
                    location:data.data().location,
                    specific:data.data().specific,
                    phone:data.data().phone,
                    tags:data.data().tags,
                    imagesUrl:[]
                })
            })
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error:err.code});
        })
    
    await db.collection('images')
    .get()
    .then(doc => {
        doc.forEach(data=>{
            locals.forEach(local => {
                if( local.localId === data.data().localId){
                    local.imagesUrl.push({
                        id: data.id,
                        imageUrl: data.data().imageUrl
                    });
                }
            })
        })
        return res.status(200).json(locals);
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error:err.code});
    })
}

exports.getUserLocal = async (req, res) => {
    let local;
    await db.collection('locals')
        .where("userEmail","==",req.params.userEmail)
        .limit(1)
        .get()
        .then(doc => {
            doc.forEach(data => {
                local = {
                    localId:data.id,
                    userEmail:data.data().userEmail,
                    name:data.data().name,
                    searchName:data.data().searchName,
                    location:data.data().location,
                    specific:data.data().specific,
                    phone:data.data().phone,
                    tags:data.data().tags,
                    imagesUrl:[]
                }
            })
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error:err.code});
        })
    
    await db.collection('images')
    .get()
    .then(doc => {
        doc.forEach(data=>{
            if( local.localId === data.data().localId){
                local.imagesUrl.push({
                    id: data.id,
                    imageUrl: data.data().imageUrl
                });
            }
        })
        return res.status(200).json(local);
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error:err.code});
    })
}

exports.getMetadataForLocals = async (req,res) =>{
    let metadata = {
        tags:[],
        specifics:[],
    }
    await db.collection('locals')
        .get()
        .then(doc =>{
            doc.forEach(data=>{
                data.data().tags.forEach(tag => {
                    metadata.tags.push(tag);
                })
                data.data().specific.forEach(specific=>{
                    metadata.specifics.push(specific);
                })
            })
            resultMetadata = {
                tags:[...new Set(metadata.tags)],
                specifics:[...new Set(metadata.specifics)]
            }
            return res.status(200).json(resultMetadata)
        })
        .catch(err =>{
            return res.status(500).json({err:err.code})
        })
}

exports.getStarsForLocalById = async (req,res)=>{
    let reviews = [];
    await db.collection('reviews')
            .get()
            .then(doc => {
                doc.forEach(data=>{
                    if(req.body.localId===data.data().localId){
                        reviews.push({
                            stars:data.data().stars
                        });
                    }
                })
            })
            .then(()=>{
                let average = reviews.reduce((a,b)=> a+b,0) / reviews.length
                return res.status(200).json(average);
            })
            .catch(err => {
                console.error(err)
                return res.status(500).json({error:err.code});
            })
}

exports.getLocalsByTag = async (req, res) => {
    let locals = [];
    await db.collection('locals')
        .where('tags','array-contains',"#"+req.params.tag)
        .get()
        .then(doc => {
            doc.forEach(data => {
                locals.push({
                    localId:data.id,
                    userId:data.data().userEmail,
                    name:data.data().name,
                    searchName:data.data().searchName,
                    location:data.data().location,
                    specific:data.data().specific,
                    phone:data.data().phone,
                    tags:data.data().tags,
                    imagesUrl: []
                })
            })
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error:err.code});
        })
    await db.collection('images')
    .get()
    .then(doc => {
        doc.forEach(data=>{
            locals.forEach(local => {
                if( local.localId === data.data().localId){
                    local.imagesUrl.push({
                        id: data.id,
                        imageUrl: data.data().imageUrl
                    });
                }
            })
        })
        return res.status(200).json(locals);
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error:err.code});
    })
}

exports.getFilteredLocals = async (req, res) => {
    const filters = {
        tag: req.params.tag,
        specific: req.params.specific
    }
   
    console.log(filters.tag)
    let locals = [];
   
    if(filters.tag === "all" && filters.specific !== "all"){
        await db.collection('locals')
        .where('specific','array-contains', filters.specific)
        .get()
        .then(doc => {
            doc.forEach(data => {
                locals.push({
                    localId:data.id,
                    userId:data.data().userEmail,
                    name:data.data().name,
                    searchName:data.data().searchName,
                    location:data.data().location,
                    specific:data.data().specific,
                    phone:data.data().phone,
                    tags:data.data().tags,
                    imagesUrl: []
                })
            })
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error:err.code});
        })
    }else if(filters.tag !== "all"){
        await db.collection('locals')
            .where('tags','array-contains', '#' + filters.tag)
            .get()
            .then(doc => {
                doc.forEach(data => {
                    if(filters.specific === "all" || data.data().specific.includes(filters.specific)){
                        locals.push({
                            localId:data.id,
                            userId:data.data().userEmail,
                            name:data.data().name,
                            searchName:data.data().searchName,
                            location:data.data().location,
                            specific:data.data().specific,
                            phone:data.data().phone,
                            tags:data.data().tags,
                            imagesUrl: []
                        })
                    }
                })
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
    }else{
        await db.collection('locals')
            .orderBy('location','asc')    
            .get()
            .then(doc => {
                doc.forEach(data => {
                    locals.push({
                        localId:data.id,
                        userEmail:data.data().userEmail,
                        name:data.data().name,
                        searchName:data.data().searchName,
                        location:data.data().location,
                        specific:data.data().specific,
                        phone:data.data().phone,
                        tags:data.data().tags,
                        imagesUrl:[]
                    })
                })
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
    
    }

    await db.collection('images')
    .get()
    .then(doc => {
        doc.forEach(data=>{
            locals.forEach(local => {
                if( local.localId === data.data().localId){
                    local.imagesUrl.push({
                        id: data.id,
                        imageUrl: data.data().imageUrl
                    });
                }
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
    let locals = [];
    await db.collection('locals')
        .orderBy('location','asc')
        .where('specific','==',req.params.specific)
        .get()
        .then(doc => {
            doc.forEach(data => {
                locals.push({
                    localId:data.id,
                    userId:data.data().userEmail,
                    name:data.data().name,
                    searchName:data.data().searchName,
                    location:data.data().location,
                    specific:data.data().specific,
                    phone:data.data().phone,
                    tags:data.data().tags,
                    imagesUrl: []
                })
            })
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error:err.code});
        })
        await db.collection('images')
            .get()
            .then(doc => {
                doc.forEach(data=>{
                    locals.forEach(local => {
                        if( local.localId === data.data().localId){
                            local.imagesUrl.push({
                                id: data.id,
                                imageUrl: data.data().imageUrl
                            });
                        }
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
    let locals = [];
    await db.collection('locals')
            .orderBy('createdAt','asc')
            .limit(4)
            .get()
            .then(doc => {
                doc.forEach(data => {
                    locals.push({
                        localId:data.id,
                        userId:data.data().userEmail,
                        name:data.data().name,
                        searchName:data.data().searchName,
                        location:data.data().location,
                        specific:data.data().specific,
                        phone:data.data().phone,
                        tags:data.data().tags,
                        imagesUrl: []
                    })
                })
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
            await db.collection('images')
                .get()
                .then(doc => {
                    doc.forEach(data=>{
                        locals.forEach(local => {
                            if( local.localId === data.data().localId){
                                local.imagesUrl.push({
                                    id: data.id,
                                    imageUrl: data.data().imageUrl
                                });
                            }
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
    let locals = [];
    await db.collection('locals')
            .orderBy('location','asc')
            .where("searchName","==",req.params.name)
            .get()
            .then(doc => {
                doc.forEach(data => {
                    locals.push({
                        localId:data.id,
                        userEmail:data.data().userEmail,
                        name:data.data().name,
                        searchName:data.data().searchName,
                        location:data.data().location,
                        specific:data.data().specific,
                        phone:data.data().phone,
                        tags:data.data().tags,
                        imagesUrl: []
                    })
                
                })
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
        await db.collection('images')
            .get()
            .then(doc => {
                doc.forEach(data=>{
                    locals.forEach(local => {
                        if( local.localId === data.data().localId){
                            local.imagesUrl.push({
                                id: data.id,
                                imageUrl: data.data().imageUrl
                            });
                        }
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
                        localId:data.id,
                        userId:data.data().userEmail,
                        name:data.data().name,
                        searchName:data.data().searchName,
                        location:data.data().location,
                        specific:data.data().specific,
                        phone:data.data().phone,
                        tags:data.data().tags,
                        imagesUrl: []
                    })
                })
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
            await db.collection('images')
                .get()
                .then(doc => {
                    doc.forEach(data=>{
                        locals.forEach(local => {
                            if( local.localId === data.data().localId){
                                local.imagesUrl.push({
                                    id: data.id,
                                    imageUrl: data.data().imageUrl
                                });
                            }
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
            .where('localId','==',req.params.reservationId)
            .get()
            .then(doc => {
                let reservations = [];
                doc.forEach(data => {
                    reservations.push({
                        reservationId:data.data().reservationId,
                        localId:data.data().localId,
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
exports.getReviews = async (req,res) =>{
    let localId = req.params.localId;
    await db.collection('reviews')
        .orderBy('createdAt','desc')
        .where('localId','==',localId)
        .get()
        .then(doc =>{
            let reviews = [];
            doc.forEach(data => {
                if(data.data().localId === localId){
                    reviews.push({
                        userEmail:data.data().userEmail,                        
                        createdAt:data.data().createdAt,                        
                        localId :data.data().localId,                        
                        stars :data.data().stars,                        
                        text :data.data().text,                        
                    })
                }
            });
            return res.status(200).json(reviews);
        })
        .catch(err=>{
            console.error(err);
            return res.status(500).json({error:err.code});
        })
}
exports.saveLocal = async (req, res) => {
    const newLocal = {
        userEmail:req.user.email,
        name:req.body.name,
        searchName:req.body.name.replace(" ","-").toLowerCase(),
        location:req.body.location,
        specific:req.body.specifics,
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
    console.log(req.body)
    await db.doc(`/locals/${req.params.localId}`)
        .get()
        .then(doc => {
            return doc.ref.update({
                name:req.body.name,
                searchName:req.body.searchName,
                location:req.body.location,
                specific:req.body.specific,
                phone:req.body.phone,
                tags:req.body.tags
            })
        })
        .then(()=>{
            return res.status(200).json({message:"Local updated successfully"})
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error:err.code});
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

exports.getLocalSpecificsCategories = async ( req, res ) => {
    const specifics = [
        "pizza", 
        "mancare italiana", 
        "mancare internationala",
        "mancare americana", 
        "fast-food", 
        "mancare romaneasca",
        "fructe de mare", 
        "cafea", 
        "bar",
        "vin",
        "paste",
        "catering", 
        "mancare frantuzeasca", 
        "mancare vegetariana"]
        return res.status(200).json(specifics);
}

exports.getLocalTagsCategories = async ( req, res ) => {
    const tags = [
        "#party",
        "#laobere",
        "#fine-dining",
        "#chill",
        "#old",
        "#narghilea",
        "#steakhouse",
        "#barbeque",
        "#club",
        "#italian",
        "#irish",
        "#romantic"
    ]

    return res.status(200).json(tags);
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
                    localId:req.params.localId,
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
                return res.status(500).json({error:err + "ss"});
            });
    });
    await busboy.end(req.rawBody);
}

exports.deleteImage = async (req, res) => {
    await db.collection('images')
            .doc(req.body.imageId)
            .delete()
            .then(() => {
                return res.status(200).json({message:"Image deleted successfully"});
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error:err.code});
            })
}