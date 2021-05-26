const express = require('express');
const Datastore = require('nedb');

const app = express();

var PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log ('listening at ', PORT));

app.use(express.static('public'));
app.use(express.json({limit:'1mb'}));

const database = new Datastore('data/appointments.db');
database.loadDatabase();

// const cosas = {
//     office: 1,
//     date: new Date('2021-05-25T03:00:00.000Z'),
//     hour:15,
//     name: 'Domingo Sarmiento',
//     email: 'faustino@abc.gob.ar',
//     active: true
// };

// database.insert( cosas, function (err, newDoc) {   // Callback is optional
//     // newDoc is the newly inserted document, including its _id
//     // newDoc has no key called notToBeSaved since its value was undefined
//   });


app.post('/api/appointments', (request, response) => {
    //post to retrieve appointments
   const data = request.body;
   const office = data.office;
   const date = data.date.split('T',1)[0];

   database.find( { office:office , date:date } , function(err, docs) {
    if (docs.length !== 0) {
        response.json({
            status:'ok',
            data: docs
        });
    } else {
        response.json({
            status:'ok',
            data: null
        });
    }
    });

});

app.post('/api/takeappointment', (request, response) => {
    const data = request.body;
    console.log ("recived data", data)
    const doc = {
        office: data.office
        ,date: data.date.split('T',1)[0]
        ,hour: parseInt(data.time)
        ,name: data.name
        ,email: data.email
        ,active:true
        ,timestamp: Date.now()
    };
    database.insert(doc, function (err, newDoc) {
        console.log("inserting on data base");
        response.json({
            status:'ok',
            data: newDoc
        });
      });
})