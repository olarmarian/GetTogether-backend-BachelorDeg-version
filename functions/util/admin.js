const admin = require('firebase-admin');
const service = require('../gettogether-55ba9-firebase-adminsdk-5nemn-de438cb026.json')

admin.initializeApp({
    credential:admin.credential.cert(service)
});

const db = admin.firestore();

module.exports = { admin, db };

/*
<!-- The core Firebase JS SDK is always required and must be listed first -->
<script src="/__/firebase/7.2.3/firebase-app.js"></script>

<!-- TODO: Add SDKs for Firebase products that you want to use
     https://firebase.google.com/docs/web/setup#available-libraries -->
<script src="/__/firebase/7.2.3/firebase-analytics.js"></script>

<!-- Initialize Firebase -->
<script src="/__/firebase/init.js"></script>


*/